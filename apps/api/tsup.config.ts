import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Workspace packages export raw TS (main -> ./src/index.ts), so bundle them.
  noExternal: [/@repo\//],
  // Keep runtime deps external — they're installed in the deploy output.
  external: ['@libsql/client', 'drizzle-orm'],
})
