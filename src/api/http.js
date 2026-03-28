import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const getToken = () => window.localStorage.getItem('datalens_token')

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
