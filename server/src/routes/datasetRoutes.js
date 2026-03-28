import { Router } from 'express'
import { listDatasets } from '../repositories/platformRepository.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authenticateRequest, async (request, response, next) => {
  try {
    const datasets = await listDatasets(request.auth.user)
    response.json({ datasets })
  } catch (error) {
    next(error)
  }
})

export default router
