import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { RPCHandler } from '@orpc/server/fetch'
import { onError } from '@orpc/server'
import { router } from './router'
import { createContext } from './context'
import { runMigrations } from './migrate'

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('[oRPC Error]', error)
    }),
  ],
})

const app = new Hono()

// oRPC is mounted under /rpc/*. Hono owns everything else (static files below,
// plus any plain REST routes you add).
app.use('/rpc/*', cors())
app.use('/rpc/*', async (c, next) => {
  const context = await createContext({
    'remote-user': c.req.header('remote-user'),
    'remote-groups': c.req.header('remote-groups'),
  })

  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/rpc',
    context,
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  return next()
})

// In production, serve the built web app from the same origin (single-container
// deploy). In development, Vite serves the frontend and proxies /rpc here.
if (process.env.NODE_ENV === 'production') {
  const root = process.env.WEB_DIST_PATH || './web-dist'
  app.use('/*', serveStatic({ root }))
  // SPA fallback — serve index.html for client-side routes.
  app.get('/*', serveStatic({ path: 'index.html', root }))
}

const port = Number(process.env.PORT) || 3001

// Run migrations before accepting traffic, then start the server.
try {
  await runMigrations()
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`API server running on http://localhost:${info.port}`)
  })
} catch (error) {
  console.error('Failed to start server:', error)
  process.exit(1)
}
