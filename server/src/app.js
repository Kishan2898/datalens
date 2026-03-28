import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import datasetRoutes from './routes/datasetRoutes.js'
import aiRoutes from './routes/aiRoutes.js'

const app = express()

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true)
        return
      }

      const isLocalhost =
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')

      if (origin === env.clientUrl || isLocalhost) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed by CORS'))
    },
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/', (request, response) => {
  response.json({
    name: 'DataLens API',
    status: 'running',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/datasets', datasetRoutes)
app.use('/api/ai', aiRoutes)

app.use((error, request, response, next) => {
  response.status(500).json({
    message: error.message || 'Unexpected server error.',
  })
})

export default app
