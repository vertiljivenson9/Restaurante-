/**
 * Tipos globales para la API de autenticación
 * Define las interfaces de usuario, variables de entorno y contexto
 */

// Tipo de usuario en la base de datos
export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  googleId: string;
  createdAt: string;
  updatedAt: string;
}

// Payload del JWT generado por nuestra API
export interface JWTPayload {
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
  iat: number;
  exp: number;
}

// Respuesta de Google OAuth token endpoint
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

// Perfil de usuario de Google
export interface GoogleUserProfile {
  sub: string;        // Google ID único
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

// Variables de entorno del Cloudflare Worker
export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  ADMIN_URL: string;
}

// Contexto extendido de Hono con variables
export type Variables = {
  user: JWTPayload;
};
