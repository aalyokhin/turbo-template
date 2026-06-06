import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '@repo/db/schema'
import { users } from '@repo/db'
import type { AppContext } from './context'

/**
 * Creates an isolated in-memory database (fresh per call) with the schema
 * applied, plus an AppContext for invoking oRPC procedures in tests. Keep the
 * CREATE TABLE statements in sync with packages/db/src/schema.ts.
 */
export async function createTestContext(
  user: AppContext['user'] = { id: 1, username: 'tester', role: 'superadmin' },
): Promise<AppContext> {
  const client = createClient({ url: ':memory:' })
  await client.executeMultiple(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      authorId INTEGER REFERENCES users(id) ON DELETE SET NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `)

  const db = drizzle(client, { schema })

  // Seed the authenticated user so foreign keys (e.g. notes.authorId) resolve.
  if (user) {
    await db.insert(users).values({ id: user.id, username: user.username, role: user.role })
  }

  return { db, user }
}
