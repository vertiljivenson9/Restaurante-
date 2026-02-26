/**
 * API de Autenticación - Hono.js en Cloudflare Workers
 * Sistema completo de autenticación con Google OAuth 2.0
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import authRouter from './routes/auth';
import type { Env, Variables } from './types';

// Crear aplicación Hono con tipos
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * Middleware global
 */

// Logger para desarrollo
app.use(logger());

// Powered by header
app.use(poweredBy());

// CORS configurado para permitir credenciales desde orígenes permitidos
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const env = c.env as Env;
      const allowedOrigins = [
        env.FRONTEND_URL,
        env.ADMIN_URL,
        'http://localhost:4321', // Astro dev
        'http://localhost:3000', // Next.js dev
        'http://localhost:8787', // Wrangler dev
      ];
      
      // Permitir requests sin origin (como los de Google OAuth callback)
      if (!origin) return '*';
      
      // Verificar si el origin está permitido
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      
      // Por defecto, permitir el origin solicitado (ajustar en producción)
      return origin;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposeHeaders: ['Set-Cookie'],
    credentials: true,
    maxAge: 86400,
  })
);

/**
 * Health check
 */
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'API de Autenticación - Menús Digitales',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Rutas de autenticación
 * Prefijo: /auth
 */
app.route('/auth', authRouter);

/**
 * Ruta protegida de ejemplo
 * Demuestra cómo usar el middleware de autenticación
 */
app.get('/api/protected', async (c) => {
  const { authMiddleware } = await import('./middleware/auth');
  return authMiddleware(c, async () => {
    const user = c.get('user');
    return c.json({
      success: true,
      message: 'Ruta protegida accedida correctamente',
      data: {
        userId: user.userId,
        email: user.email,
      },
    });
  });
});

/**
 * Manejo de errores 404
 */
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Ruta no encontrada',
      path: c.req.path,
    },
    404
  );
});

/**
 * Manejo global de errores
 */
app.onError((err, c) => {
  console.error('Error en la aplicación:', err);
  
  return c.json(
    {
      success: false,
      error: 'Error interno del servidor',
      message: err.message,
    },
    500
  );
});

// Exportar handler para Cloudflare Workers
export default app;
