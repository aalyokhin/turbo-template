import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

// libSQL reads a local file (`file:./app.db`) or a remote Turso database with
// the exact same code — set DATABASE_URL (+ DATABASE_AUTH_TOKEN for Turso) to
// switch. Queries are async (return promises).
const client = createClient({
  url: process.env.DATABASE_URL || 'file:./app.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })

export * from './schema'
export { eq, and, or, desc, asc, sql, count, gt, lt, gte, lte, isNull } from 'drizzle-orm'
