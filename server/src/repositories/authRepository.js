import { randomUUID } from 'node:crypto'
import { getPool } from '../db/pool.js'

const demoUsers = []
const demoWorkspaces = []

export const findUserByEmail = async (email) => {
  const pool = getPool()

  if (!pool) {
    return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
  }

  const result = await pool.query(
    'SELECT id, full_name, email, password_hash, role, created_at FROM users WHERE email = $1 LIMIT 1',
    [email],
  )

  return result.rows[0] || null
}

export const findUserById = async (id) => {
  const pool = getPool()

  if (!pool) {
    return demoUsers.find((user) => user.id === id) || null
  }

  const result = await pool.query(
    'SELECT id, full_name, email, password_hash, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id],
  )

  return result.rows[0] || null
}

export const createUserWithWorkspace = async ({ fullName, email, passwordHash }) => {
  const pool = getPool()
  const workspaceSlug = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-5)}`

  if (!pool) {
    const user = {
      id: randomUUID(),
      full_name: fullName,
      email,
      password_hash: passwordHash,
      role: 'owner',
      created_at: new Date().toISOString(),
    }

    const workspace = {
      id: randomUUID(),
      owner_user_id: user.id,
      name: `${fullName.split(' ')[0] || 'DataLens'} Workspace`,
      slug: workspaceSlug,
      plan: 'starter',
      created_at: new Date().toISOString(),
    }

    demoUsers.push(user)
    demoWorkspaces.push(workspace)

    return {
      user,
      workspace,
    }
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const userResult = await client.query(
      `
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, full_name, email, password_hash, role, created_at
      `,
      [fullName, email, passwordHash],
    )

    const user = userResult.rows[0]

    const workspaceResult = await client.query(
      `
        INSERT INTO workspaces (owner_user_id, name, slug)
        VALUES ($1, $2, $3)
        RETURNING id, owner_user_id, name, slug, plan, created_at
      `,
      [user.id, `${fullName.split(' ')[0] || 'DataLens'} Workspace`, workspaceSlug],
    )

    await client.query('COMMIT')

    return {
      user,
      workspace: workspaceResult.rows[0],
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const findWorkspaceForUser = async (userId) => {
  const pool = getPool()

  if (!pool) {
    return demoWorkspaces.find((workspace) => workspace.owner_user_id === userId) || null
  }

  const result = await pool.query(
    `
      SELECT id, owner_user_id, name, slug, plan, created_at
      FROM workspaces
      WHERE owner_user_id = $1
      LIMIT 1
    `,
    [userId],
  )

  return result.rows[0] || null
}
