import { Router } from 'express'
import { generateChatAnswer, generateInsights } from '../services/aiService.js'
import { env } from '../config/env.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/insights', authenticateRequest, (request, response) => {
  const { intent = 'summary', question = '', context = {} } = request.body || {}

  const insights = generateInsights({ intent, question, context })

  response.json({
    mode: env.demoMode ? 'demo' : 'database',
    insights,
  })
})

router.post('/chat', authenticateRequest, (request, response) => {
  const { question = '', context = {}, history = [] } = request.body || {}

  const message = generateChatAnswer({ question, context, history })

  response.json({
    mode: env.demoMode ? 'demo' : 'database',
    message,
  })
})

export default router
