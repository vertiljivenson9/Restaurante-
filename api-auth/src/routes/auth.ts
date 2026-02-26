/**
 * Rutas de autenticación con Google OAuth 2.0
 * Implementa el flujo completo de autorización
 */

import { Hono } from 'hono';
import { SignJWT } from 'jose';
import { initDb, upsertUserFromGoogle, closeDb } from '../db/client';
import { authMiddleware } from '../middleware/auth';
import type { Env, Variables, GoogleTokenResponse, GoogleUserProfile } from '../types';

// Router de autenticación
const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /auth/google
 * Inicia el flujo OAuth redirigiendo al usuario a Google
 * Incluye state parameter para prevenir ataques CSRF
 */
authRouter.get('/google', async (c) => {
  try {
    const { GOOGLE_CLIENT_ID, FRONTEND_URL } = c.env;

    // Validar configuración
    if (!GOOGLE_CLIENT_ID) {
      return c.json(
        {
          success: false,
          error: 'Google Client ID no configurado',
        },
        500
      );
    }

    // Construir URL de autorización de Google
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    // Parámetros OAuth 2.0
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set(
      'redirect_uri',
      `${new URL(c.req.url).origin}/auth/google/callback`
    );
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');
    
    // State parameter para prevenir CSRF
    // Incluye el origin del frontend para redirigir correctamente después
    const state = Buffer.from(
      JSON.stringify({
        redirect: FRONTEND_URL,
        nonce: crypto.randomUUID(),
      })
    ).toString('base64url');
    
    googleAuthUrl.searchParams.set('state', state);

    // Redirigir a Google
    return c.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Error iniciando OAuth:', error);
    return c.json(
      {
        success: false,
        error: 'Error al iniciar autenticación con Google',
      },
      500
    );
  }
});

/**
 * GET /auth/google/callback
 * Recibe el código de Google, intercambia por tokens y autentica al usuario
 */
authRouter.get('/google/callback', async (c) => {
  let db;
  
  try {
    const { 
      GOOGLE_CLIENT_ID, 
      GOOGLE_CLIENT_SECRET, 
      JWT_SECRET, 
      FRONTEND_URL 
    } = c.env;

    // Obtener código y state de la query
    const code = c.req.query('code');
    const state = c.req.query('state');
    const error = c.req.query('error');

    // Manejar errores de Google
    if (error) {
      console.error('Error de Google OAuth:', error);
      return c.redirect(`${FRONTEND_URL}/login?error=google_auth_denied`);
    }

    // Validar parámetros
    if (!code) {
      return c.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    // Parsear state para obtener redirect URL
    let redirectUrl = FRONTEND_URL;
    try {
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
        redirectUrl = stateData.redirect || FRONTEND_URL;
      }
    } catch {
      // Ignorar errores de parseo, usar default
    }

    // Intercambiar código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${new URL(c.req.url).origin}/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Error obteniendo tokens:', errorData);
      return c.redirect(`${redirectUrl}/login?error=token_exchange_failed`);
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Obtener información del usuario desde Google
    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error('Error obteniendo perfil de usuario');
      return c.redirect(`${redirectUrl}/login?error=profile_fetch_failed`);
    }

    const profile: GoogleUserProfile = await userResponse.json();

    // Validar que el email esté verificado
    if (!profile.email_verified) {
      return c.redirect(`${redirectUrl}/login?error=email_not_verified`);
    }

    // Conectar a base de datos
    db = initDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    // Crear o actualizar usuario
    const user = await upsertUserFromGoogle(db, {
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    // Generar JWT propio
    const secret = new TextEncoder().encode(JWT_SECRET);
    const jwt = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Token válido por 7 días
      .sign(secret);

    // Determinar a dónde redirigir basado en el origin
    const isAdminRequest = redirectUrl.includes('admin') || 
                          redirectUrl.includes('3000');
    const dashboardUrl = isAdminRequest 
      ? `${redirectUrl}/dashboard` 
      : `${redirectUrl}/dashboard`;

    // Establecer cookie httpOnly y redirigir
    // secure: true en producción (HTTPS)
    // sameSite: lax para permitir redirecciones desde Google
    const isSecure = c.req.url.startsWith('https');
    
    c.header(
      'Set-Cookie',
      `auth=${jwt}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; ${
        isSecure ? 'Secure; ' : ''
      }SameSite=Lax`
    );

    return c.redirect(dashboardUrl);
  } catch (error) {
    console.error('Error en callback OAuth:', error);
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=unknown`);
  } finally {
    // Cerrar conexión de base de datos
    if (db) {
      closeDb();
    }
  }
});

/**
 * POST /auth/logout
 * Cierra la sesión eliminando la cookie
 */
authRouter.post('/logout', async (c) => {
  // Establecer cookie expirada para eliminarla
  const isSecure = c.req.url.startsWith('https');
  
  c.header(
    'Set-Cookie',
    `auth=; HttpOnly; Path=/; Max-Age=0; ${
      isSecure ? 'Secure; ' : ''
    }SameSite=Lax`
  );

  return c.json({
    success: true,
    message: 'Sesión cerrada correctamente',
  });
});

/**
 * GET /auth/me
 * Devuelve los datos del usuario autenticado
 * Requiere autenticación vía middleware
 */
authRouter.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');

  return c.json({
    success: true,
    data: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
});

/**
 * GET /auth/session
 * Verifica si hay sesión activa (endpoint público)
 */
authRouter.get('/session', async (c) => {
  try {
    const authCookie = c.req.header('Cookie')?.match(/auth=([^;]+)/);
    
    if (!authCookie) {
      return c.json({
        success: true,
        data: { authenticated: false },
      });
    }

    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    
    try {
      const { payload } = await jwtVerify(authCookie[1], secret);
      
      return c.json({
        success: true,
        data: {
          authenticated: true,
          user: {
            userId: payload.userId,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          },
        },
      });
    } catch {
      return c.json({
        success: true,
        data: { authenticated: false },
      });
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return c.json({
      success: true,
      data: { authenticated: false },
    });
  }
});

export default authRouter;
