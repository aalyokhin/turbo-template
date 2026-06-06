import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  // libSQL uses the 'turso' dialect even for a local file: database.
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./app.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
})
