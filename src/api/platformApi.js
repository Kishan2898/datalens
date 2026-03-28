import { http } from './http'

export const registerWithEmail = async (payload) => {
  const { data } = await http.post('/auth/register', payload)
  return data
}

export const loginWithEmail = async (payload) => {
  const { data } = await http.post('/auth/login', payload)
  return data
}

export const fetchCurrentSession = async () => {
  const { data } = await http.get('/auth/me')
  return data
}

export const fetchPlatformHealth = async () => {
  const { data } = await http.get('/health')
  return data
}

export const fetchDashboardOverview = async () => {
  const { data } = await http.get('/dashboard/overview')
  return data
}

export const fetchDatasets = async () => {
  const { data } = await http.get('/datasets')
  return data
}

export const requestAIInsights = async (payload) => {
  const { data } = await http.post('/ai/insights', payload)
  return data
}

export const requestAIChat = async (payload) => {
  const { data } = await http.post('/ai/chat', payload)
  return data
}
