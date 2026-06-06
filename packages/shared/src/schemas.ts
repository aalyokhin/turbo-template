import { z } from 'zod'

/**
 * Shared schemas and types live here so both the API and the web app can
 * import a single source of truth. Define a type here whenever it crosses the
 * api <-> web boundary (e.g. enum values, input shapes) to avoid duplicate
 * definitions and TypeScript inference drift.
 */

// User roles — referenced by the db schema (packages/db) and the auth
// middleware (apps/api). Add roles here and they flow everywhere.
export const USER_ROLES = ['user', 'admin', 'superadmin'] as const
export type UserRole = (typeof USER_ROLES)[number]

// Input schema for creating/updating a note. The API validates against this,
// and the web form can reuse it for client-side validation.
export const NoteInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().max(10_000).default(''),
})
export type NoteInput = z.infer<typeof NoteInputSchema>
