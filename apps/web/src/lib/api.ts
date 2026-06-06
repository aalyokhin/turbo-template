import type { Router } from '@repo/api/router'
import type { RouterClient } from '@orpc/server'
import type { InferClientOutputs } from '@orpc/client'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

const link = new RPCLink({
  url: () => {
    // Same origin in production; the Vite dev proxy forwards /rpc in development.
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/rpc`
  },
})

export const client: RouterClient<Router> = createORPCClient(link)

// TanStack Query helpers, fully typed from the router.
export const api = createTanstackQueryUtils(client)

// Derive types from the API — never hand-write types that come from the server.
type ApiOutputs = InferClientOutputs<typeof client>
export type NotesListOutput = ApiOutputs['notes']['list']
export type Note = NotesListOutput['notes'][number]
