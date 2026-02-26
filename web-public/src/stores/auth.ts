/**
 * Store de autenticación usando nanostores
 * Maneja el estado global del usuario en la aplicación
 */

import { atom } from 'nanostores';

// Tipo de usuario autenticado
export interface AuthUser {
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
}

// Estado de autenticación
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Store global de autenticación
export const $auth = atom<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

// URL de la API
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

/**
 * Verifica la sesión actual llamando al endpoint /auth/session
 * Actualiza el store con el resultado
 */
export async function checkSession(): Promise<void> {
  $auth.set({ ...$auth.get(), isLoading: true });

  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error verificando sesión');
    }

    const data = await response.json();

    if (data.success && data.data.authenticated) {
      $auth.set({
        user: data.data.user,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      $auth.set({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    $auth.set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }
}

/**
 * Obtiene los datos completos del usuario autenticado
 * Requiere autenticación válida
 */
export async function fetchUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        $auth.set({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
      return null;
    }

    const data = await response.json();

    if (data.success) {
      const user = data.data;
      $auth.set({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return user;
    }

    return null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
}

/**
 * Cierra la sesión del usuario
 * Llama al endpoint de logout y limpia el estado
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error cerrando sesión');
    }
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    // Limpiar estado independientemente del resultado
    $auth.set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    
    // Redirigir a login
    window.location.href = '/login';
  }
}

/**
 * Redirige al usuario al login de Google
 */
export function loginWithGoogle(): void {
  const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';
  window.location.href = `${apiUrl}/auth/google`;
}

/**
 * Suscripción al store para reactividad
 * Puede usarse en componentes de React o vanilla JS
 */
export function subscribeToAuth(callback: (state: AuthState) => void): () => void {
  return $auth.subscribe(callback);
}
