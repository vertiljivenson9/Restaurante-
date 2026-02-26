/**
 * Página: Login
 * Página de inicio de sesión con Google OAuth
 * Fondo oscuro con diseño centrado
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// URL de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

/**
 * Componente de la página de login
 * Muestra el botón de inicio de sesión con Google
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/session`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data.authenticated) {
            // Ya está autenticado, redirigir al dashboard
            window.location.href = redirectPath;
            return;
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [redirectPath]);

  // Manejar inicio de sesión con Google
  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Guardar redirect path para después del login
    sessionStorage.setItem('redirectAfterLogin', redirectPath);
    
    // Redirigir a la API de autenticación
    window.location.href = `${API_URL}/auth/google`;
  };

  // Mostrar loading mientras se verifica la sesión
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verificando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con gradiente */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        aria-hidden="true"
      />
      
      {/* Patrón de puntos */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Card de login */}
      <main className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-slate-400">
              Inicia sesión para gestionar tus menús digitales
            </p>
          </div>

          {/* Botón de Google */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium border-gray-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                {/* Logo de Google SVG */}
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Iniciar sesión con Google
              </>
            )}
          </Button>

          {/* Términos */}
          <p className="text-center text-slate-500 text-sm mt-8">
            Al iniciar sesión, aceptas nuestros{' '}
            <a href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors underline">
              Términos de servicio
            </a>{' '}
            y{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors underline">
              Política de privacidad
            </a>
          </p>
        </div>

        {/* Link al sitio público */}
        <p className="text-center text-slate-500 text-sm mt-6">
          <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Volver al inicio
          </a>
        </p>
      </main>
    </div>
  );
}
