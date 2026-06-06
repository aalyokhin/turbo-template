import { migrate } from 'drizzle-orm/libsql/migrator'
import { join } from 'node:path'
import { db } from '@repo/db'

// Applies any pending Drizzle migrations. Runs automatically on API startup
// (see index.ts) and is idempotent — already-applied migrations are skipped.
export async function runMigrations() {
  const migrationsFolder =
    process.env.MIGRATIONS_PATH || join(import.meta.dirname, '../../../packages/db/drizzle')

  console.log('Running database migrations...')
  await migrate(db, { migrationsFolder })
  console.log('Migrations up to date')
}
