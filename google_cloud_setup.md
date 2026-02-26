# Guía de Configuración - Google Cloud Console

Esta guía detalla paso a paso cómo configurar las credenciales de Google OAuth 2.0 para el sistema de autenticación.

## 📋 Requisitos Previos

- Cuenta de Google (Gmail)
- Acceso a [Google Cloud Console](https://console.cloud.google.com)

---

## 🚀 Paso 1: Crear un Proyecto

1. **Ir a Google Cloud Console**
   - Abre [console.cloud.google.com](https://console.cloud.google.com) en tu navegador
   - Inicia sesión con tu cuenta de Google

2. **Crear Nuevo Proyecto**
   - En la barra superior, haz click en el selector de proyectos
   - Click en **"New Project"** (Nuevo proyecto)
   
   ![Crear proyecto](https://i.imgur.com/placeholder1.png)

3. **Configurar Proyecto**
   - **Project name**: `MenuDigital Auth` (o el nombre que prefieras)
   - **Location**: Selecciona tu organización o "No organization"
   - Click en **"Create"** (Crear)

4. **Esperar la creación**
   - Google creará el proyecto (toma unos segundos)
   - El selector de proyectos mostrará tu nuevo proyecto automáticamente

---

## ⚙️ Paso 2: Configurar Pantalla de Consentimiento OAuth

1. **Navegar a OAuth Consent Screen**
   - En el menú lateral, ve a **"APIs & Services"** > **"OAuth consent screen"**
   
2. **Seleccionar Tipo de Usuario**
   - Selecciona **"External"** (para usuarios externos a tu organización)
   - Click en **"Create"**

3. **Información de la App (Paso 1)**
   
   | Campo | Valor |
   |-------|-------|
   | App name | `Menú Digital` |
   | User support email | tu-email@gmail.com |
   | App logo | (Opcional) Subir logo 120x120px |
   
   - Click en **"Save and Continue"**

4. **Scopes (Paso 2)**
   - Click en **"Add or Remove Scopes"**
   - Busca y selecciona:
     - `openid` (OpenID Connect)
     - `userinfo.email` (Ver tu dirección de correo electrónico)
     - `userinfo.profile` (Ver tu información personal)
   - Click en **"Update"**
   - Click en **"Save and Continue"**

5. **Test Users (Paso 3)**
   - Click en **"Add Users"**
   - Agrega tu email y otros emails de prueba
   - Click en **"Save and Continue"**

6. **Resumen (Paso 4)**
   - Revisa la configuración
   - Click en **"Back to Dashboard"**

---

## 🔐 Paso 3: Crear Credenciales OAuth 2.0

1. **Ir a Credentials**
   - En el menú lateral, ve a **"APIs & Services"** > **"Credentials"**

2. **Crear Credenciales**
   - Click en **"Create Credentials"** (botón azul arriba)
   - Selecciona **"OAuth client ID"**
   
   ![Crear credenciales](https://i.imgur.com/placeholder2.png)

3. **Configurar Cliente OAuth**
   
   **Application type**: `Web application`
   
   **Name**: `Menú Digital Web Client`

4. **Authorized JavaScript Origins**
   
   Agrega las URLs donde correrá tu frontend:
   
   ```
   http://localhost:4321
   http://localhost:3000
   https://tu-frontend.vercel.app        (Producción Astro)
   https://tu-admin.vercel.app           (Producción Next.js)
   ```
   
   > ⚠️ **Importante**: No incluyas barras al final de las URLs

5. **Authorized Redirect URIs**
   
   Agrega las URLs de callback:
   
   ```
   http://localhost:8787/auth/google/callback
   https://tu-api.workers.dev/auth/google/callback   (Producción)
   ```
   
   > ⚠️ **Importante**: Esta URL debe coincidir exactamente con la que usa tu API

6. **Crear**
   - Click en **"Create"**

7. **Guardar Credenciales**
   - Se mostrará un modal con **Client ID** y **Client Secret**
   - **¡IMPORTANTE!** Copia ambos valores y guárdalos en un lugar seguro
   - Click en **"OK"**
   
   ![Credenciales](https://i.imgur.com/placeholder3.png)

---

## 📋 Paso 4: Configurar Variables de Entorno

### En tu API (api-auth/.env)

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### En Cloudflare Workers (Producción)

```bash
cd api-auth
npx wrangler secret put GOOGLE_CLIENT_ID
# Pegar Client ID

npx wrangler secret put GOOGLE_CLIENT_SECRET
# Pegar Client Secret
```

---

## 🧪 Paso 5: Verificar Configuración

1. **Iniciar servicios locales**
   ```bash
   # Terminal 1 - API
   cd api-auth && npm run dev
   
   # Terminal 2 - Astro
   cd web-public && npm run dev
   ```

2. **Probar flujo OAuth**
   - Abre http://localhost:4321/login
   - Click en "Iniciar sesión con Google"
   - Deberías ver la pantalla de consentimiento de Google
   - Selecciona tu cuenta
   - Deberías ser redirigido al dashboard

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirect no coincide exactamente con la configurada.

**Solución**:
1. Ve a Credentials > tu cliente OAuth
2. Edita "Authorized redirect URIs"
3. Asegúrate de que coincida exactamente (incluyendo http/https, puerto, path)

### Error: "unauthorized_client"

**Causa**: El Client ID o Client Secret son incorrectos.

**Solución**:
1. Verifica que las credenciales estén correctamente configuradas
2. Asegúrate de usar el Client ID de tipo "Web application"
3. Verifica que no haya espacios extras

### Error: "access_denied"

**Causa**: El usuario denegó los permisos o la app no está en modo producción.

**Solución**:
1. Asegúrate de agregar tu email como "Test user"
2. O publica la app: OAuth consent screen > Publish App

### Error: "invalid_client"

**Causa**: El Client Secret es incorrecto o ha sido regenerado.

**Solución**:
1. Ve a Credentials
2. Edita tu cliente OAuth
3. Si es necesario, regenera el Client Secret

---

## 🚀 Publicar App (Producción)

Para que cualquier usuario pueda usar tu app (no solo test users):

1. Ve a **OAuth consent screen**
2. Click en **"Publish App"** (botón azul)
3. Confirma la publicación
4. La app pasará a estado "In production"

> ⚠️ **Nota**: Si cambias el logo o el nombre de la app, puede requerir verificación adicional por Google.

---

## 📚 Recursos Adicionales

- [Documentación OAuth 2.0 de Google](https://developers.google.com/identity/protocols/oauth2)
- [OpenID Connect](https://developers.google.com/identity/protocols/oauth2/openid-connect)
- [Google Cloud Console Help](https://cloud.google.com/docs)

---

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Google Cloud
- [ ] OAuth consent screen configurada
- [ ] Scopes agregados (openid, email, profile)
- [ ] Test users agregados
- [ ] OAuth 2.0 Client ID creado
- [ ] JavaScript origins configurados
- [ ] Redirect URIs configurados
- [ ] Client ID y Secret guardados
- [ ] Variables de entorno configuradas
- [ ] Flujo de login probado localmente
- [ ] App publicada (para producción)
