/**
 * Componente: DashboardShell
 * Shell del dashboard con sidebar, header y navegación
 * Client component para manejar estado de UI
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Menu as MenuIcon,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

// URL de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

/**
 * Tipo de usuario
 */
interface User {
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
}

/**
 * Props del DashboardShell
 */
interface DashboardShellProps {
  children: React.ReactNode;
  user: User;
}

/**
 * Items de navegación
 */
const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Menú',
    href: '/dashboard/menu',
    icon: MenuIcon,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

/**
 * DashboardShell Component
 */
export function DashboardShell({ children, user }: DashboardShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Manejar logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Redirigir al login independientemente del resultado
      window.location.href = '/login';
    }
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar para desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 hidden lg:block',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="text-white font-semibold">MenuDigital</span>
            )}
          </Link>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                  isSidebarCollapsed && 'justify-center'
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
          {/* Botón colapsar/expandir */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors mb-3"
            title={isSidebarCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span className="text-sm">Colapsar</span>
              </>
            )}
          </button>

          {/* Botón logout */}
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors',
              isSidebarCollapsed && 'justify-center'
            )}
            title={isSidebarCollapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-300 lg:ml-64',
          isSidebarCollapsed && 'lg:ml-20'
        )}
      >
        {/* Header móvil */}
        <header className="lg:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
          {/* Menú móvil */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <PanelLeft className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-slate-900 border-slate-800 p-0">
              {/* Logo móvil */}
              <div className="h-16 flex items-center px-4 border-b border-slate-800">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="text-white font-semibold">MenuDigital</span>
                </Link>
              </div>

              {/* Navegación móvil */}
              <nav className="px-3 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        isActive
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout móvil */}
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Título de página móvil */}
          <span className="text-white font-semibold">
            {navigation.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.name || 'Dashboard'}
          </span>

          {/* Avatar móvil */}
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.picture || ''} alt={user.name || user.email} />
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Header desktop */}
        <header className="hidden lg:flex h-16 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {navigation.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.name || 'Dashboard'}
            </h1>
          </div>

          {/* Usuario desktop */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">
                {user.name || user.email.split('@')[0]}
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-slate-700">
              <AvatarImage src={user.picture || ''} alt={user.name || user.email} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
