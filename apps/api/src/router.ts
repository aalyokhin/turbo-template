import { os } from '@orpc/server'
import type { AppContext } from './context'
import { notesRouter } from './routers/notes'

const base = os.$context<AppContext>()

export const healthCheck = base.handler(async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

export const router = {
  health: healthCheck,
  notes: notesRouter,
}

// The web app imports this type (via `@repo/api/router`) to get a fully typed
// client — no hand-written API types. See apps/web/src/lib/api.ts.
export type Router = typeof router
