/**
 * Cliente de base de datos Turso/LibSQL
 * Maneja la conexión y operaciones CRUD para usuarios
 */

import { createClient, Client } from '@libsql/client';
import type { User } from '../types';

// Instancia del cliente (singleton por request)
let client: Client | null = null;

/**
 * Inicializa el cliente de Turso con las credenciales del entorno
 */
export function initDb(databaseUrl: string, authToken: string): Client {
  if (!client) {
    client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });
  }
  return client;
}

/**
 * Cierra la conexión de la base de datos
 */
export function closeDb(): void {
  if (client) {
    client.close();
    client = null;
  }
}

/**
 * Busca un usuario por su Google ID
 */
export async function findUserByGoogleId(
  db: Client,
  googleId: string
): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM User WHERE googleId = ?',
    args: [googleId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return rowToUser(result.rows[0]);
}

/**
 * Busca un usuario por su email
 */
export async function findUserByEmail(
  db: Client,
  email: string
): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM User WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return rowToUser(result.rows[0]);
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(
  db: Client,
  data: {
    email: string;
    name: string | null;
    picture: string | null;
    googleId: string;
  }
): Promise<User> {
  const id = generateCUID();
  const now = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO User (id, email, name, picture, googleId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, data.email, data.name, data.picture, data.googleId, now, now],
  });

  return {
    id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    googleId: data.googleId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(
  db: Client,
  id: string,
  data: {
    name?: string | null;
    picture?: string | null;
  }
): Promise<User> {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const args: (string | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    args.push(data.name);
  }

  if (data.picture !== undefined) {
    updates.push('picture = ?');
    args.push(data.picture);
  }

  updates.push('updatedAt = ?');
  args.push(now);
  args.push(id);

  await db.execute({
    sql: `UPDATE User SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  const result = await db.execute({
    sql: 'SELECT * FROM User WHERE id = ?',
    args: [id],
  });

  return rowToUser(result.rows[0]);
}

/**
 * Crea o actualiza un usuario basado en datos de Google
 */
export async function upsertUserFromGoogle(
  db: Client,
  profile: {
    sub: string;
    email: string;
    name: string;
    picture: string;
  }
): Promise<User> {
  // Buscar usuario existente
  const existingUser = await findUserByGoogleId(db, profile.sub);

  if (existingUser) {
    // Actualizar datos si han cambiado
    if (
      existingUser.name !== profile.name ||
      existingUser.picture !== profile.picture
    ) {
      return updateUser(db, existingUser.id, {
        name: profile.name,
        picture: profile.picture,
      });
    }
    return existingUser;
  }

  // Crear nuevo usuario
  return createUser(db, {
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    googleId: profile.sub,
  });
}

/**
 * Convierte una fila de la base de datos a objeto User
 */
function rowToUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    picture: row.picture ? String(row.picture) : null,
    googleId: String(row.googleId),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

/**
 * Genera un CUID simple (para IDs únicos)
 */
function generateCUID(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const counter = (globalThis.__cuidCounter = (globalThis.__cuidCounter || 0) + 1)
    .toString(36)
    .padStart(4, '0');
  return `c${timestamp}${random}${counter}`;
}

// Extensión global para el contador de CUID
declare global {
  var __cuidCounter: number | undefined;
}
