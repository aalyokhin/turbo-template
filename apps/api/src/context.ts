import { db } from '@repo/db'
import { resolveUser, type UserContext } from './middleware/auth'

export interface AppContext {
  db: typeof db
  user: UserContext | null
}

interface RequestHeaders {
  'remote-user'?: string
  'remote-groups'?: string
}

export async function createContext(headers: RequestHeaders): Promise<AppContext> {
  const user = await resolveUser(headers)
  return { db, user }
}
