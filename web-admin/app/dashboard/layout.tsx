/**
 * Layout: Dashboard
 * Layout con sidebar para las páginas del panel de administración
 * Incluye navegación, header con avatar y menú móvil
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from './components/dashboard-shell';

// URL de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

/**
 * Tipo de usuario autenticado
 */
interface User {
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
}

/**
 * Función para obtener el usuario actual desde el header (seteado por middleware)
 */
function getUserFromHeaders(): User | null {
  const headersList = headers();
  
  const userId = headersList.get('x-user-id');
  const email = headersList.get('x-user-email');
  
  if (!userId || !email) {
    return null;
  }

  return {
    userId,
    email,
    name: headersList.get('x-user-name'),
    picture: headersList.get('x-user-picture'),
  };
}

/**
 * Función para verificar autenticación directamente con la API
 * (fallback si el middleware no funcionó)
 */
async function verifyAuth(): Promise<User | null> {
  try {
    const headersList = headers();
    const cookie = headersList.get('cookie');
    
    if (!cookie) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: cookie,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error('Error verificando auth:', error);
    return null;
  }
}

/**
 * DashboardLayout
 * Layout protegido que requiere autenticación
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Intentar obtener usuario desde headers (seteado por middleware)
  let user = getUserFromHeaders();

  // Si no está en headers, verificar directamente con la API
  if (!user) {
    user = await verifyAuth();
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
