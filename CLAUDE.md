# Turbo Template

End-to-end type-safe Turborepo starter: Hono + oRPC + Drizzle + libSQL + React/Vite.

## Structure

```
apps/
  api/          # Hono server + oRPC (port 3001)
  web/          # React + TanStack Router (port 3000 in dev)
packages/
  db/           # Drizzle ORM + libSQL
  shared/       # Shared Zod schemas and types
```

## Commands

```bash
pnpm dev          # Start API + Web dev servers
pnpm build        # Build all packages
pnpm db:generate --name=<desc>  # Generate migration (always pass --name)
pnpm db:migrate   # Apply pending migrations (also runs on API startup)
pnpm db:studio    # Open Drizzle Studio
pnpm check        # Run lint + typecheck
pnpm test         # Run tests
```

## Key details

- oRPC is mounted on Hono at `/rpc/*`; Hono serves the static web build in production.
- Dev proxy: Vite proxies `/rpc` to the API at `localhost:3001`.
- Database: libSQL file at `apps/api/app.db` (set `DATABASE_URL`/`DATABASE_AUTH_TOKEN` for Turso).
- Forward-auth: identity comes from `Remote-User`/`Remote-Groups` headers; dev gets a `dev` superadmin.
- Docker: `docker compose up` serves API + frontend from one container.

## Database migrations

Migrations run automatically on API startup. Files live in `packages/db/drizzle/`.

1. Edit `packages/db/src/schema.ts`
2. `pnpm db:generate --name=descriptive_name`
3. Commit the generated migration files (they must be in git)
4. Deploy — migrations apply on startup

## Code guidelines

- **Never hand-write frontend types that come from the API.** Derive them via oRPC's `InferClientOutputs` — see `apps/web/src/lib/api.ts`.
- **No type assertions.** Use type guards and Zod schemas (oxlint enforces this).
- **Shared cross-boundary types** go in `packages/shared/src/schemas.ts`.
- **Use `cn()`** (from `@/lib/utils`) for conditional Tailwind classes.
- The `notes` feature is the reference vertical slice — copy its pattern for new features.
