import { createRootRouteWithContext, Outlet, Link } from '@tanstack/react-router'
import type { RouterContext } from '../main'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-semibold">
            Turbo Template
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
