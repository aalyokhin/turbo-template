# Turbo Template

An opinionated, end-to-end type-safe Turborepo starter for full-stack TypeScript apps — built for fast, AI-assisted development and single-container self-hosting.

## Stack

| Layer | Choice |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Server | [Hono](https://hono.dev) on `@hono/node-server` |
| API / contract | [oRPC](https://orpc.dev) — end-to-end typed, typed errors, OpenAPI-ready |
| Frontend | React 19 + Vite + TanStack Router + TanStack Query |
| UI | Tailwind CSS + shadcn/ui |
| ORM | [Drizzle](https://orm.drizzle.team) + drizzle-kit migrations |
| Database | SQLite via [libSQL](https://github.com/tursodatabase/libsql) (local file or remote Turso) |
| Validation | Zod (shared package) |
| Lint | oxlint (`--type-aware`, strict) |
| Tests | Vitest |

End-to-end type safety means the web app **infers its API types from the server** (`@repo/api/router`) — you never hand-write request/response types.

## Quick start

```bash
pnpm dlx create-turbo@latest --example https://github.com/<you>/turbo-template
cd <your-app>
pnpm setup                # rename the project (optional)
pnpm install
pnpm dev                  # api on :3001, web on :3000
```

In development the API auto-creates a `dev` superadmin user (forward-auth has no proxy locally) and runs migrations on startup.

## Commands

```bash
pnpm dev          # run api + web dev servers
pnpm build        # build everything
pnpm check        # lint + typecheck
pnpm test         # run tests
pnpm db:generate --name=<desc>   # create a migration from schema changes
pnpm db:migrate   # apply pending migrations (also runs on API startup)
pnpm db:studio    # open Drizzle Studio
pnpm setup [name] # rename the project from the template placeholder
```

## Structure

```
apps/
  api/   # Hono server, oRPC router, forward-auth, migrate-on-startup
  web/   # React SPA, TanStack Router/Query, shadcn/ui
packages/
  db/      # Drizzle schema + migrations (libSQL)
  shared/  # Zod schemas & types shared across api/web
```

## The example slice

A `notes` feature is wired end-to-end as a reference pattern — copy it, then delete it:

- `packages/db/src/schema.ts` — `notes` table
- `packages/shared/src/schemas.ts` — `NoteInputSchema`
- `apps/api/src/routers/notes.ts` (+ `notes.test.ts`) — oRPC CRUD, auth-gated
- `apps/web/src/routes/index.tsx` — list + create + delete, fully typed

## Auth

Forward-auth: the app expects a reverse proxy (Authelia / Authentik / oauth2-proxy, …) to authenticate requests and forward identity via `Remote-User` / `Remote-Groups` headers. Users are provisioned on first request. Adjust `apps/api/src/middleware/auth.ts` for your proxy, or replace it with your own auth.

## Database / Turso

Local development uses a SQLite file (`apps/api/app.db`). To use a remote [Turso](https://turso.tech) database, set `DATABASE_URL` (e.g. `libsql://...`) and `DATABASE_AUTH_TOKEN` — no code changes needed.

## Deploy

A single container serves both the API and the built web app:

```bash
docker compose up --build
```

The Dockerfile builds both apps, runs `pnpm deploy` for a lean runtime, copies the web `dist` and migration files in, and serves everything on port 3001. The included GitHub Actions workflow runs lint/typecheck/test on every PR and pushes an image on `main` (set `REGISTRY_URL` to enable).
