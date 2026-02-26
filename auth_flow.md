# Flujo de Autenticación - Diagrama Completo

Este documento describe el flujo completo de autenticación con Google OAuth 2.0 implementado en este sistema.

## 🔄 Diagrama de Secuencia

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │   Astro/    │     │   Hono.js   │     │ Google  │     │  Turso  │
│ (Browser)│     │   Next.js   │     │    API      │     │  OAuth  │     │   DB    │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └────┬────┘     └────┬────┘
     │                 │                   │                 │               │
     │ 1. Click "Login │                   │                 │               │
     │    con Google"  │                   │                 │               │
     │────────────────>│                   │                 │               │
     │                 │                   │                 │               │
     │                 │ 2. GET /auth/google│                 │               │
     │                 │──────────────────>│                 │               │
     │                 │                   │                 │               │
     │                 │ 3. 302 Redirect    │                 │               │
     │                 │   (accounts.google.com)
     │                 │<──────────────────│                 │               │
     │                 │                   │                 │               │
     │ 4. Redirect to  │                   │                 │               │
     │    Google OAuth │                   │                 │               │
     │<────────────────│                   │                 │               │
     │                 │                   │                 │               │
     │ 5. User autoriza│                   │                 │               │
     │    en Google    │                   │                 │               │
     │─────────────────────────────────────────────────────>│               │
     │                 │                   │                 │               │
     │                 │                   │                 │               │
     │                 │                   │ 6. 302 Redirect │               │
     │                 │                   │    con code     │               │
     │                 │                   │<────────────────│               │
     │                 │                   │                 │               │
     │                 │ 7. GET /auth/google/callback?code=xxx               │
     │                 │                   │                 │               │
     │                 │                   │ 8. POST oauth2.googleapis.com/token
     │                 │                   │─────────────────────────────────>│
     │                 │                   │                 │               │
     │                 │                   │ 9. Access Token + ID Token       │
     │                 │                   │<─────────────────────────────────│
     │                 │                   │                 │               │
     │                 │                   │ 10. GET userinfo (con token)     │
     │                 │                   │─────────────────────────────────>│
     │                 │                   │                 │               │
     │                 │                   │ 11. User Profile (email, name, picture)
     │                 │                   │<─────────────────────────────────│
     │                 │                   │                 │               │
     │                 │                   │ 12. SELECT User WHERE googleId=?│
     │                 │                   │─────────────────────────────────>│
     │                 │                   │                 │               │
     │                 │                   │ 13. User o null │               │
     │                 │                   │<─────────────────────────────────│
     │                 │                   │                 │               │
     │                 │                   │ 14. INSERT/UPDATE User          │
     │                 │                   │─────────────────────────────────>│
     │                 │                   │                 │               │
     │                 │                   │ 15. OK          │               │
     │                 │                   │<─────────────────────────────────│
     │                 │                   │                 │               │
     │                 │                   │ 16. Generar JWT │               │
     │                 │                   │     {userId, email, name}       │
     │                 │                   │                 │               │
     │                 │                   │ 17. Set-Cookie: auth=JWT        │
     │                 │ 18. 302 Redirect   │                 │               │
     │                 │    /dashboard      │                 │               │
     │                 │<──────────────────│                 │               │
     │                 │                   │                 │               │
     │ 19. Redirect to │                   │                 │               │
     │     /dashboard  │                   │                 │               │
     │<────────────────│                   │                 │               │
     │                 │                   │                 │               │
     │ 20. GET /auth/me│                   │                 │               │
     │    (con cookie) │                   │                 │               │
     │─────────────────────────────────────>│                 │               │
     │                 │                   │                 │               │
     │                 │                   │ 21. Verificar JWT              │
     │                 │                   │                 │               │
     │ 22. {user}      │                   │                 │               │
     │<─────────────────────────────────────│                 │               │
     │                 │                   │                 │               │
     │ 23. Mostrar     │                   │                 │               │
     │     Dashboard   │                   │                 │               │
     │                 │                   │                 │               │
```

## 📊 Estados del Flujo

### Estado 1: Inicio de Sesión
```
Usuario ──► Frontend ──► GET /auth/google ──► API
```

### Estado 2: Redirección a Google
```
API ──► 302 Redirect ──► accounts.google.com ──► Usuario autoriza
```

### Estado 3: Callback con Código
```
Google ──► 302 Redirect ──► /auth/google/callback?code=xxx ──► API
```

### Estado 4: Intercambio de Token
```
API ──► POST oauth2.googleapis.com/token ──► Google devuelve access_token + id_token
```

### Estado 5: Obtención de Perfil
```
API ──► GET userinfo ──► Google devuelve {sub, email, name, picture}
```

### Estado 6: Base de Datos
```
API ──► SELECT/INSERT User ──► Turso ──► User creado/actualizado
```

### Estado 7: Generación JWT
```
API ──► Sign JWT ──► Cookie httpOnly ──► Redirect /dashboard
```

### Estado 8: Verificación de Sesión
```
Frontend ──► GET /auth/me ──► API verifica JWT ──► User data
```

## 🔐 Estructura del JWT

```json
{
  "userId": "cuid_xxx",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "picture": "https://lh3.googleusercontent.com/...",
  "iat": 1704067200,
  "exp": 1704672000
}
```

## 🍪 Configuración de Cookie

```
Name: auth
Value: JWT_TOKEN
HttpOnly: true
Secure: true (en producción)
SameSite: Lax
Path: /
Max-Age: 604800 (7 días)
```

## 🛡️ Seguridad Implementada

| Medida | Descripción |
|--------|-------------|
| HttpOnly | Cookie no accesible por JavaScript |
| Secure | Solo se envía por HTTPS en producción |
| SameSite=Lax | Protección contra CSRF básica |
| State Parameter | Previene ataques CSRF en OAuth |
| Email Verified | Solo acepta emails verificados por Google |
| JWT Expiration | Tokens expiran en 7 días |
| CORS | Solo orígenes permitidos |

## 📝 Endpoints Involucrados

### Frontend → API

| Endpoint | Método | Propsito |
|----------|--------|----------|
| `/auth/google` | GET | Iniciar OAuth |
| `/auth/google/callback` | GET | Recibir código |
| `/auth/me` | GET | Obtener usuario |
| `/auth/logout` | POST | Cerrar sesión |
| `/auth/session` | GET | Verificar sesión |

### API → Google

| Endpoint | Método | Propsito |
|----------|--------|----------|
| `oauth2.googleapis.com/token` | POST | Intercambiar código |
| `www.googleapis.com/oauth2/v3/userinfo` | GET | Obtener perfil |

## 🔄 Refresh Token (Futuro)

El sistema está preparado para implementar refresh tokens:

```
1. Access Token corto (15 min)
2. Refresh Token largo (30 días)
3. Endpoint /auth/refresh
4. Rotación de refresh tokens
```

## 📈 Rate Limiting

Recomendado implementar en Cloudflare:

```
/auth/google: 10 req/min por IP
/auth/google/callback: 10 req/min por IP
/auth/me: 100 req/min por IP
```

## 🧪 Testing del Flujo

### Test Manual

```bash
# 1. Iniciar sesión
curl -v http://localhost:8787/auth/google

# 2. Verificar sesión (con cookie)
curl -H "Cookie: auth=TOKEN" http://localhost:8787/auth/me

# 3. Logout
curl -X POST -H "Cookie: auth=TOKEN" http://localhost:8787/auth/logout
```

### Test Automatizado

```typescript
// tests/auth.test.ts
describe('OAuth Flow', () => {
  it('should redirect to Google', async () => {
    const res = await fetch('/auth/google');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('accounts.google.com');
  });
  
  it('should return user when authenticated', async () => {
    const res = await fetch('/auth/me', {
      headers: { Cookie: 'auth=VALID_TOKEN' }
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveProperty('data.userId');
  });
});
```

## 🚨 Manejo de Errores

| Error | Causa | Solución |
|-------|-------|----------|
| `google_auth_denied` | Usuario canceló OAuth | Redirigir a login |
| `token_exchange_failed` | Código inválido/expirado | Reintentar login |
| `email_not_verified` | Email no verificado | Mostrar mensaje |
| `invalid_token` | JWT inválido/expirado | Redirigir a login |
| `no_code` | Falta código en callback | Reintentar login |

## 📚 Recursos

- [OAuth 2.0 Flow](https://oauth.net/2/)
- [OpenID Connect](https://openid.net/connect/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [JWT.io](https://jwt.io/)
