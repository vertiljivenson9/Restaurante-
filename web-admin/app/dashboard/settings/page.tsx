/**
 * Página: Settings
 * Configuración del restaurante y cuenta de usuario
 */

import { headers } from 'next/headers';
import { User, Store, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

/**
 * Función para obtener datos del usuario desde headers
 */
function getUserFromHeaders() {
  const headersList = headers();
  return {
    name: headersList.get('x-user-name'),
    email: headersList.get('x-user-email'),
    picture: headersList.get('x-user-picture'),
  };
}

/**
 * Página de configuración
 */
export default function SettingsPage() {
  const user = getUserFromHeaders();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Configuración</h2>
        <p className="text-slate-400 mt-1">
          Personaliza tu cuenta y la configuración de tu restaurante
        </p>
      </div>

      {/* Secciones de configuración */}
      <div className="space-y-6">
        {/* Perfil de usuario */}
        <SettingsSection
          title="Perfil de usuario"
          description="Información de tu cuenta de Google"
          icon={User}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'Usuario'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">
                  {(user.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-medium">{user.name || 'Sin nombre'}</p>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            Tu perfil se sincroniza con Google. Para cambiar tu información,{' '}
            <a
              href="https://myaccount.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              visita tu cuenta de Google
            </a>
            .
          </p>
        </SettingsSection>

        <Separator className="bg-slate-800" />

        {/* Información del restaurante */}
        <SettingsSection
          title="Información del restaurante"
          description="Datos básicos de tu negocio"
          icon={Store}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre del restaurante
              </label>
              <Input
                placeholder="Ej: La Buena Mesa"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Slug (URL del menú)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
                  /menu/
                </span>
                <Input
                  placeholder="mi-restaurante"
                  className="rounded-l-none bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <Input
                placeholder="Breve descripción de tu restaurante"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número de WhatsApp
              </label>
              <Input
                placeholder="+1 234 567 890"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Moneda
              </label>
              <select className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white">
                <option value="USD">USD - Dólar estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="MXN">MXN - Peso mexicano</option>
                <option value="ARS">ARS - Peso argentino</option>
                <option value="COP">COP - Peso colombiano</option>
                <option value="CLP">CLP - Peso chileno</option>
                <option value="PEN">PEN - Sol peruano</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Guardar cambios
            </Button>
          </div>
        </SettingsSection>

        <Separator className="bg-slate-800" />

        {/* Apariencia */}
        <SettingsSection
          title="Apariencia"
          description="Personaliza los colores de tu menú"
          icon={Palette}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Color principal
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  defaultValue="#0f172a"
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <Input
                  defaultValue="#0f172a"
                  className="flex-1 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Logo del restaurante
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-600">
                  <svg
                    className="w-6 h-6 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
                  Subir imagen
                </Button>
              </div>
            </div>
          </div>
        </SettingsSection>

        <Separator className="bg-slate-800" />

        {/* Notificaciones */}
        <SettingsSection
          title="Notificaciones"
          description="Configura cómo recibir alertas"
          icon={Bell}
        >
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300">Recibir resumen semanal por email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300">Notificar cuando un menú supere 1000 vistas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300">Alertas de seguridad</span>
            </label>
          </div>
        </SettingsSection>

        <Separator className="bg-slate-800" />

        {/* Seguridad */}
        <SettingsSection
          title="Seguridad"
          description="Gestiona la seguridad de tu cuenta"
          icon={Shield}
        >
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sesión activa</p>
                <p className="text-slate-400 text-sm">
                  Iniciaste sesión con Google
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-400 text-sm">Activa</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Tu sesión expira automáticamente después de 7 días de inactividad.
            Puedes cerrar sesión en cualquier momento desde el menú lateral.
          </p>
        </SettingsSection>
      </div>
    </div>
  );
}

/**
 * Componente: SettingsSection
 * Sección de configuración con título y descripción
 */
interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: SettingsSectionProps) {
  return (
    <section>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
      <div className="ml-14">{children}</div>
    </section>
  );
}
