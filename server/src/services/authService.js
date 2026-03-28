import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import {
  createUserWithWorkspace,
  findUserByEmail,
  findUserById,
  findWorkspaceForUser,
} from '../repositories/authRepository.js'

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: '7d' },
  )

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
})

const sanitizeWorkspace = (workspace) =>
  workspace
    ? {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
      }
    : null

export const registerUser = async ({ fullName, email, password }) => {
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    throw new Error('An account with this email already exists.')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const { user, workspace } = await createUserWithWorkspace({
    fullName,
    email,
    passwordHash,
  })

  return {
    token: createToken(user),
    user: sanitizeUser(user),
    workspace: sanitizeWorkspace(workspace),
  }
}

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email)

  if (!user) {
    throw new Error('Invalid email or password.')
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    throw new Error('Invalid email or password.')
  }

  const workspace = await findWorkspaceForUser(user.id)

  return {
    token: createToken(user),
    user: sanitizeUser(user),
    workspace: sanitizeWorkspace(workspace),
  }
}

export const verifySession = async (token) => {
  const payload = jwt.verify(token, env.jwtSecret)
  const user = await findUserById(payload.sub)

  if (!user) {
    throw new Error('Session is no longer valid.')
  }

  const workspace = await findWorkspaceForUser(user.id)

  return {
    user: sanitizeUser(user),
    workspace: sanitizeWorkspace(workspace),
  }
}
