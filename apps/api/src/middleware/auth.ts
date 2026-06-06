import { db, users, eq } from '@repo/db'
import type { UserRole } from '@repo/shared'

/**
 * Forward-auth: the app sits behind a reverse proxy (Authelia / Authentik /
 * oauth2-proxy, etc.) that authenticates the request and forwards the identity
 * via `Remote-User` and `Remote-Groups` headers. Users are provisioned lazily
 * on first request. In development (no proxy), a `dev` superadmin is created.
 *
 * Adjust `parseGroups` / the superadmin group name to match your proxy.
 */

export interface UserContext {
  id: number
  username: string
  role: UserRole
}

export function requireAdmin(user: UserContext | null): asserts user is UserContext {
  if (!user) throw new Error('Unauthorized')
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('Forbidden')
  }
}

interface AuthHeaders {
  'remote-user'?: string
  'remote-groups'?: string
}

function parseGroups(groupsHeader: string | undefined): string[] {
  if (!groupsHeader) return []
  return groupsHeader.split(',').map((g) => g.trim().toLowerCase())
}

export async function resolveUser(headers: AuthHeaders): Promise<UserContext | null> {
  const username = headers['remote-user']

  // No header in development — use a dev superadmin user.
  if (!username) {
    if (process.env.NODE_ENV !== 'development') {
      return null
    }

    const devUsername = 'dev'
    const devUser = await db.query.users.findFirst({
      where: eq(users.username, devUsername),
    })

    if (devUser) {
      return { id: devUser.id, username: devUser.username, role: devUser.role }
    }

    const [newDevUser] = await db
      .insert(users)
      .values({ username: devUsername, role: 'superadmin' })
      .returning()

    console.log('Created dev superadmin user')
    return { id: newDevUser.id, username: newDevUser.username, role: newDevUser.role }
  }

  const groups = parseGroups(headers['remote-groups'])
  const isInSuperadminGroup = groups.includes('superadmins')

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  })

  if (existingUser) {
    // Sync superadmin status with group membership.
    let needsUpdate = false
    let newRole: UserRole = existingUser.role

    if (isInSuperadminGroup && existingUser.role !== 'superadmin') {
      newRole = 'superadmin'
      needsUpdate = true
    } else if (!isInSuperadminGroup && existingUser.role === 'superadmin') {
      newRole = 'user'
      needsUpdate = true
    }

    if (needsUpdate) {
      await db
        .update(users)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(users.id, existingUser.id))
    }

    return {
      id: existingUser.id,
      username: existingUser.username,
      role: needsUpdate ? newRole : existingUser.role,
    }
  }

  // Provision a new user.
  const newRole: UserRole = isInSuperadminGroup ? 'superadmin' : 'user'
  const [newUser] = await db.insert(users).values({ username, role: newRole }).returning()

  console.log(`Created new user: ${username} with role: ${newRole}`)

  return { id: newUser.id, username: newUser.username, role: newUser.role }
}
