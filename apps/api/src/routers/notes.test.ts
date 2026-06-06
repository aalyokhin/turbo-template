import { describe, it, expect } from 'vitest'
import { call } from '@orpc/server'
import { create, list, update, remove } from './notes'
import { createTestContext } from '../test-helpers'

describe('notes router', () => {
  it('creates and lists a note', async () => {
    const context = await createTestContext()

    const created = await call(create, { title: 'Hello', body: 'World' }, { context })
    expect(created.id).toBeGreaterThan(0)
    expect(created.title).toBe('Hello')

    const { notes } = await call(list, {}, { context })
    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('Hello')
  })

  it('updates a note', async () => {
    const context = await createTestContext()
    const created = await call(create, { title: 'Draft', body: '' }, { context })

    const updated = await call(update, { id: created.id, title: 'Final' }, { context })
    expect(updated?.title).toBe('Final')
  })

  it('deletes a note', async () => {
    const context = await createTestContext()
    const created = await call(create, { title: 'Temp', body: '' }, { context })

    await call(remove, { id: created.id }, { context })
    const { notes } = await call(list, {}, { context })
    expect(notes).toHaveLength(0)
  })

  it('rejects unauthenticated callers', async () => {
    const context = await createTestContext(null)
    await expect(call(list, {}, { context })).rejects.toThrow('Unauthorized')
  })
})
