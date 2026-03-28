import { Router } from 'express'
import { buildDashboardOverview } from '../repositories/platformRepository.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/overview', authenticateRequest, async (request, response, next) => {
  try {
    const overview = await buildDashboardOverview(request.auth.user)
    response.json(overview)
  } catch (error) {
    next(error)
  }
})

export default router
