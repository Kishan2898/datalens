import { Router } from 'express'
import { env } from '../config/env.js'

const router = Router()

router.get('/', (request, response) => {
  response.json({
    status: 'ok',
    mode: env.demoMode ? 'demo' : 'database',
    timestamp: new Date().toISOString(),
  })
})

export default router
