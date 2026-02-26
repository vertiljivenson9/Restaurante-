/**
 * Middleware de Next.js
 * Verifica la autenticación en rutas protegidas
 * Llama al endpoint /auth/me de la API para validar el JWT
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// URL de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// Rutas que no requieren autenticación
const PUBLIC_PATHS = ['/login', '/_next', '/api', '/favicon.ico'];

/**
 * Middleware que se ejecuta en cada request
 * Verifica si el usuario está autenticado en rutas protegidas
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin verificación
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Obtener la cookie de autenticación
  const authCookie = request.cookies.get('auth');

  // Si no hay cookie, redirigir al login
  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar el token con la API
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `auth=${authCookie.value}`,
        Accept: 'application/json',
      },
    });

    // Si el token es inválido, redirigir al login
    if (!response.ok) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      // Crear respuesta que elimina la cookie inválida
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.delete('auth');
      
      return redirectResponse;
    }

    // Token válido, obtener datos del usuario
    const data = await response.json();

    if (!data.success) {
      throw new Error('Respuesta inválida de la API');
    }

    // Añadir headers con info del usuario para uso en server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', data.data.userId);
    requestHeaders.set('x-user-email', data.data.email);
    requestHeaders.set('x-user-name', data.data.name || '');
    requestHeaders.set('x-user-picture', data.data.picture || '');

    // Continuar con el request, pasando los headers modificados
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    
    // En caso de error, redirigir al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete('auth');
    
    return redirectResponse;
  }
}

/**
 * Configuración del middleware
 * Define en qué rutas se ejecuta
 */
export const config = {
  matcher: [
    // Excluir archivos estáticos y API interna
    '/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$).*)',
  ],
};
