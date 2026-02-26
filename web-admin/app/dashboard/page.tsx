/**
 * Página: Dashboard Home
 * Página principal del panel de administración
 * Muestra resumen y acciones rápidas
 */

import Link from 'next/link';
import { headers } from 'next/headers';
import {
  Plus,
  Utensils,
  BarChart3,
  Settings,
  TrendingUp,
  Users,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// URL de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

/**
 * Función para obtener datos del usuario desde headers
 */
function getUserFromHeaders() {
  const headersList = headers();
  return {
    name: headersList.get('x-user-name'),
    email: headersList.get('x-user-email'),
  };
}

/**
 * Página principal del dashboard
 */
export default function DashboardPage() {
  const user = getUserFromHeaders();
  const displayName = user.name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header de bienvenida */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          ¡Hola, {displayName}! 👋
        </h2>
        <p className="text-slate-400 mt-1">
          Bienvenido de vuelta. Aquí está el resumen de tus menús.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Menús activos"
          value="0"
          icon={Utensils}
          trend="+0%"
          trendUp={true}
        />
        <StatCard
          title="Vistas hoy"
          value="0"
          icon={Eye}
          trend="+0%"
          trendUp={true}
        />
        <StatCard
          title="Visitantes únicos"
          value="0"
          icon={Users}
          trend="0%"
          trendUp={null}
        />
        <StatCard
          title="Clicks WhatsApp"
          value="0"
          icon={TrendingUp}
          trend="+0%"
          trendUp={true}
        />
      </div>

      {/* Acciones rápidas */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Crear menú */}
          <QuickActionCard
            href="/dashboard/menu/new"
            title="Crear menú"
            description="Crea un nuevo menú digital para tu restaurante"
            icon={Plus}
            color="blue"
          />

          {/* Ver analytics */}
          <QuickActionCard
            href="/dashboard/analytics"
            title="Ver analytics"
            description="Revisa las estadísticas de tus menús"
            icon={BarChart3}
            color="green"
          />

          {/* Configuración */}
          <QuickActionCard
            href="/dashboard/settings"
            title="Configuración"
            description="Personaliza tu cuenta y preferencias"
            icon={Settings}
            color="purple"
          />
        </div>
      </div>

      {/* Menús recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Tus menús</h3>
          <Link
            href="/dashboard/menu"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        {/* Estado vacío */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-slate-500" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">
            No tienes menús aún
          </h4>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Crea tu primer menú digital y empieza a compartirlo con tus clientes
          </p>
          <Link href="/dashboard/menu/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear mi primer menú
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente: StatCard
 * Tarjeta de estadística con icono y tendencia
 */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean | null;
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <span
          className={`text-sm font-medium ${
            trendUp === null
              ? 'text-slate-400'
              : trendUp
              ? 'text-green-400'
              : 'text-red-400'
          }`}
        >
          {trend}
        </span>
        <span className="text-slate-500 text-sm">vs ayer</span>
      </div>
    </div>
  );
}

/**
 * Componente: QuickActionCard
 * Tarjeta de acción rápida con icono y color
 */
interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple';
}

function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  color,
}: QuickActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30',
    green: 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30',
    purple: 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30',
  };

  return (
    <Link
      href={href}
      className="group block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${colorClasses[color]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </Link>
  );
}
