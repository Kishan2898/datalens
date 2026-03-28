import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { findUserById, findWorkspaceForUser } from '../repositories/authRepository.js'

const getTokenFromHeader = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

export const authenticateRequest = async (request, response, next) => {
  try {
    const token = getTokenFromHeader(request.headers.authorization)

    if (!token) {
      response.status(401).json({ message: 'Authentication required.' })
      return
    }

    const payload = jwt.verify(token, env.jwtSecret)
    const user = await findUserById(payload.sub)

    if (!user) {
      response.status(401).json({ message: 'Invalid session.' })
      return
    }

    const workspace = await findWorkspaceForUser(user.id)

    request.auth = {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            plan: workspace.plan,
          }
        : null,
    }

    next()
  } catch (error) {
    response.status(401).json({ message: 'Authentication required.' })
  }
}
