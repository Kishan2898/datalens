import { Router } from 'express'
import { loginUser, registerUser, verifySession } from '../services/authService.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', async (request, response, next) => {
  try {
    const { fullName = '', email = '', password = '' } = request.body || {}

    if (!fullName.trim() || !email.trim() || password.length < 6) {
      response.status(400).json({ message: 'Provide a name, valid email, and password with at least 6 characters.' })
      return
    }

    const session = await registerUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    })

    response.status(201).json(session)
  } catch (error) {
    response.status(409).json({ message: error.message || 'Unable to create account.' })
  }
})

router.post('/login', async (request, response, next) => {
  try {
    const { email = '', password = '' } = request.body || {}

    const session = await loginUser({
      email: email.trim().toLowerCase(),
      password,
    })

    response.json(session)
  } catch (error) {
    response.status(401).json({ message: error.message || 'Invalid email or password.' })
  }
})

router.get('/me', authenticateRequest, async (request, response, next) => {
  try {
    const token = request.headers.authorization.split(' ')[1]
    const session = await verifySession(token)
    response.json(session)
  } catch (error) {
    next(error)
  }
})

export default router
