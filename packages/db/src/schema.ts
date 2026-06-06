import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { USER_ROLES } from '@repo/shared'

/**
 * Drizzle schema — the single source of truth for the database. Edit a table
 * here, then run `pnpm db:generate --name=<desc>` to emit a SQL migration.
 * Migrations apply automatically on API startup (see apps/api/src/migrate.ts).
 */

// `users` backs the forward-auth middleware: users are provisioned from the
// reverse proxy's `Remote-User` / `Remote-Groups` headers on first request.
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  role: text('role', { enum: USER_ROLES }).notNull().default('user'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// `notes` is the example vertical slice: db -> shared schema -> oRPC router ->
// web page, fully type-inferred. Replace it with your own domain tables.
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  authorId: integer('authorId').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
