import { os } from '@orpc/server'
import { z } from 'zod'
import { NoteInputSchema } from '@repo/shared'
import { notes, eq, desc } from '@repo/db'
import type { AppContext } from '../context'

const base = os.$context<AppContext>()

// Every handler requires an authenticated user. `context.user` is populated by
// the forward-auth middleware (see middleware/auth.ts).
function requireUser(user: AppContext['user']) {
  if (!user) throw new Error('Unauthorized')
  return user
}

export const list = base.handler(async ({ context }) => {
  requireUser(context.user)
  const rows = await context.db.query.notes.findMany({
    orderBy: [desc(notes.updatedAt)],
  })
  return { notes: rows }
})

export const get = base
  .input(z.object({ id: z.number().int().positive() }))
  .handler(async ({ input, context }) => {
    requireUser(context.user)
    const note = await context.db.query.notes.findFirst({
      where: eq(notes.id, input.id),
    })
    return note ?? null
  })

export const create = base
  .input(NoteInputSchema)
  .handler(async ({ input, context }) => {
    const user = requireUser(context.user)
    const [note] = await context.db
      .insert(notes)
      .values({ title: input.title, body: input.body, authorId: user.id })
      .returning()
    return note
  })

export const update = base
  .input(z.object({ id: z.number().int().positive() }).extend(NoteInputSchema.partial().shape))
  .handler(async ({ input, context }) => {
    requireUser(context.user)
    const { id, ...patch } = input
    const [note] = await context.db
      .update(notes)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning()
    return note ?? null
  })

export const remove = base
  .input(z.object({ id: z.number().int().positive() }))
  .handler(async ({ input, context }) => {
    requireUser(context.user)
    await context.db.delete(notes).where(eq(notes.id, input.id))
    return { success: true }
  })

export const notesRouter = {
  list,
  get,
  create,
  update,
  remove,
}
