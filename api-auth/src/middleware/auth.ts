/**
 * Middleware de autenticación
 * Verifica el JWT en las cookies y añade el usuario al contexto
 */

import { MiddlewareHandler } from 'hono';
import { jwtVerify } from 'jose';
import type { Env, Variables, JWTPayload } from '../types';

/**
 * Middleware que verifica la cookie de autenticación
 * Extrae el JWT, lo valida y añade los datos del usuario al contexto
 */
export const authMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: Variables;
}> = async (c, next) => {
  try {
    // Obtener la cookie de autenticación
    const authCookie = c.req.header('Cookie')?.match(/auth=([^;]+)/);
    
    if (!authCookie) {
      return c.json(
        {
          success: false,
          error: 'No se encontró token de autenticación',
        },
        401
      );
    }

    const token = authCookie[1];

    // Verificar el JWT usando jose (compatible con Cloudflare Workers)
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Validar que el payload tenga los campos necesarios
    if (!payload.userId || !payload.email) {
      return c.json(
        {
          success: false,
          error: 'Token inválido',
        },
        401
      );
    }

    // Añadir usuario al contexto para uso posterior
    c.set('user', payload as JWTPayload);

    // Continuar con el siguiente middleware/handler
    await next();
  } catch (error) {
    console.error('Error verificando JWT:', error);
    
    return c.json(
      {
        success: false,
        error: 'Token inválido o expirado',
      },
      401
    );
  }
};

/**
 * Middleware opcional de autenticación
 * No requiere autenticación pero añade el usuario al contexto si existe
 */
export const optionalAuthMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: Variables;
}> = async (c, next) => {
  try {
    const authCookie = c.req.header('Cookie')?.match(/auth=([^;]+)/);
    
    if (authCookie) {
      const token = authCookie[1];
      const secret = new TextEncoder().encode(c.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      if (payload.userId && payload.email) {
        c.set('user', payload as JWTPayload);
      }
    }

    await next();
  } catch {
    // Ignorar errores, continuar sin usuario
    await next();
  }
};
