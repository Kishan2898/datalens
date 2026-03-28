import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  demoMode: (process.env.DEMO_MODE || 'true').toLowerCase() === 'true',
  jwtSecret: process.env.JWT_SECRET || 'datalens-dev-secret',
}
