# Sistema de Autenticación Google OAuth 2.0 - Menús Digitales

Sistema completo de autenticación con Google OAuth 2.0 para una aplicación de menús digitales. Incluye backend API, frontend público y panel de administración.

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   /web-public   │     │    /api-auth    │     │   /web-admin    │
│     Astro       │◄────│   Hono.js API   │────►│    Next.js 14   │
│  (Público)      │     │ (Cloudflare)    │     │   (Admin)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Turso (SQLite) │
                        └─────────────────┘
```

## 📁 Estructura del Proyecto

```
/
├── api-auth/           # Backend API (Hono.js + Cloudflare Workers)
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── routes/auth.ts     # Rutas OAuth
│   │   ├── middleware/auth.ts # Middleware JWT
│   │   ├── db/client.ts       # Cliente Turso
│   │   └── types/index.ts     # Tipos TypeScript
│   ├── prisma/
│   │   └── schema.prisma      # Schema de base de datos
│   ├── wrangler.toml          # Config Cloudflare
│   └── package.json
│
├── web-public/         # Frontend público (Astro)
│   ├── src/
│   │   ├── components/        # Componentes Astro
│   │   ├── pages/             # Páginas
│   │   └── stores/auth.ts     # Store de autenticación
│   ├── astro.config.mjs
│   └── package.json
│
└── web-admin/          # Panel admin (Next.js 14)
    ├── app/
    │   ├── login/             # Página login
    │   └── dashboard/         # Dashboard protegido
    ├── components/ui/         # Componentes shadcn/ui
    ├── middleware.ts          # Middleware de auth
    └── package.json
```

## 🚀 Guía de Instalación

### 1. Clonar y preparar

```bash
# Clonar el repositorio
git clone <repo-url>
cd proyecto
```

### 2. Configurar Backend API

```bash
cd api-auth

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Configurar secrets en Cloudflare
npx wrangler login
npx wrangler secret put TURSO_DATABASE_URL
npx wrangler secret put TURSO_AUTH_TOKEN
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put JWT_SECRET
```

### 3. Configurar Base de Datos

```bash
# Instalar Prisma globalmente
npm install -g prisma

# Generar cliente Prisma
npx prisma generate

# Crear migración inicial (desarrollo local)
npx prisma migrate dev --name init

# Para Turso, ejecutar el script SQL manualmente
turso db shell <tu-db> < src/db/init.sql
```

### 4. Configurar Frontend Astro

```bash
cd ../web-public

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de la API
```

### 5. Configurar Panel Admin Next.js

```bash
cd ../web-admin

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL de la API
```

## 🔧 Configuración Google Cloud Console

### Paso 1: Crear Proyecto

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear nuevo proyecto o seleccionar existente
3. Anotar el Project ID

### Paso 2: Habilitar OAuth 2.0

1. Navegar a **APIs & Services > Credentials**
2. Click en **Create Credentials > OAuth 2.0 Client ID**
3. Configurar pantalla de consentimiento:
   - User Type: **External**
   - App name: "Menú Digital"
   - User support email: tu-email
   - Developer contact: tu-email

### Paso 3: Crear Credenciales

1. **Application type**: Web application
2. **Name**: "Menú Digital Web"
3. **Authorized JavaScript origins**:
   ```
   http://localhost:4321    (Astro dev)
   http://localhost:3000    (Next.js dev)
   https://tu-dominio.com   (Producción)
   ```
4. **Authorized redirect URIs**:
   ```
   http://localhost:8787/auth/google/callback    (Wrangler dev)
   https://tu-api.workers.dev/auth/google/callback  (Producción)
   ```
5. Click **Create**
6. Copiar **Client ID** y **Client Secret**

### Paso 4: Configurar Scopes

En la pantalla de consentimiento OAuth, agregar scopes:
- `openid`
- `email`
- `profile`

## 🖥️ Desarrollo Local

### Terminal 1: API

```bash
cd api-auth
npm run dev
# API corriendo en http://localhost:8787
```

### Terminal 2: Astro

```bash
cd web-public
npm run dev
# Astro corriendo en http://localhost:4321
```

### Terminal 3: Next.js

```bash
cd web-admin
npm run dev
# Next.js corriendo en http://localhost:3000
```

## 🚀 Despliegue

### API (Cloudflare Workers)

```bash
cd api-auth
npm run deploy
```

### Astro (Cloudflare Pages / Vercel)

```bash
cd web-public
npm run build
# Subir la carpeta 'dist/' a Cloudflare Pages o Vercel
```

### Next.js (Vercel recomendado)

```bash
cd web-admin
# Deploy a Vercel
vercel --prod
```

## 🔐 Variables de Entorno

### API (.env)

```env
TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu-token
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
JWT_SECRET=tu-jwt-secret-minimo-32-caracteres
FRONTEND_URL=http://localhost:4321
ADMIN_URL=http://localhost:3000
```

### Frontends (.env)

```env
PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## 📊 Flujo de Autenticación

```
┌─────────┐    1. Click    ┌─────────┐    2. Redirect    ┌─────────┐
│  User   │───────────────►│ Frontend│──────────────────►│   API   │
└─────────┘                └─────────┘                   └────┬────┘
     ▲                                                        │
     │                                                        │ 3. Redirect
     │                                                        ▼
     │                                                   ┌─────────┐
     │                                                   │ Google  │
     │                                                   └────┬────┘
     │                                                        │
     │ 6. Set cookie &                                        │ 4. Auth
     │    redirect                                            ▼
     │                                                   ┌─────────┐
     └───────────────────────────────────────────────────│   API   │
                                                         └────┬────┘
                                                              │
                                                              │ 5. Exchange
                                                              │    code → token
                                                              ▼
                                                         ┌─────────┐
                                                         │  Create │
                                                         │  User   │
                                                         │  + JWT  │
                                                         └─────────┘
```

## 🛡️ Seguridad

- ✅ Cookies httpOnly (no accesibles por JavaScript)
- ✅ JWT con expiración de 7 días
- ✅ CORS estricto configurado
- ✅ State parameter en OAuth (CSRF protection)
- ✅ Validación de email verificado por Google
- ✅ SameSite=Lax en cookies
- ✅ Secure flag en producción (HTTPS)

## 📝 API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Health check | No |
| GET | `/auth/google` | Iniciar OAuth | No |
| GET | `/auth/google/callback` | Callback OAuth | No |
| POST | `/auth/logout` | Cerrar sesión | No |
| GET | `/auth/me` | Datos del usuario | Sí |
| GET | `/auth/session` | Verificar sesión | No |
| GET | `/api/protected` | Ejemplo protegido | Sí |

## 🧪 Testing

```bash
# Verificar endpoints
curl http://localhost:8787/

# Verificar sesión (con cookie)
curl -H "Cookie: auth=TOKEN" http://localhost:8787/auth/me
```

## 📚 Tecnologías

- **Backend**: Hono.js, Cloudflare Workers, Turso (LibSQL)
- **Frontend Público**: Astro, Tailwind CSS, Nanostores
- **Panel Admin**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Auth**: Google OAuth 2.0, JWT (jose)
- **DB**: SQLite (Turso), Prisma ORM

## 📄 Licencia

MIT License - Ver LICENSE para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.
