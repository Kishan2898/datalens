import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg

let pool = null

export const getPool = () => {
  if (!env.databaseUrl || env.demoMode) {
    return null
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }

  return pool
}
