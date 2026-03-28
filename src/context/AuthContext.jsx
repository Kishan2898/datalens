import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCurrentSession, loginWithEmail, registerWithEmail } from '../api/platformApi'

const AuthContext = createContext(null)

const TOKEN_KEY = 'datalens_token'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const boot = async () => {
      const token = window.localStorage.getItem(TOKEN_KEY)

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const session = await fetchCurrentSession()
        setUser(session.user)
        setWorkspace(session.workspace)
      } catch (error) {
        window.localStorage.removeItem(TOKEN_KEY)
      } finally {
        setLoading(false)
      }
    }

    boot()
  }, [])

  const persistSession = (session) => {
    window.localStorage.setItem(TOKEN_KEY, session.token)
    setUser(session.user)
    setWorkspace(session.workspace)
  }

  const login = async (payload) => {
    const session = await loginWithEmail(payload)
    persistSession(session)
    return session
  }

  const register = async (payload) => {
    const session = await registerWithEmail(payload)
    persistSession(session)
    return session
  }

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setWorkspace(null)
  }

  const value = useMemo(
    () => ({
      user,
      workspace,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [loading, user, workspace],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return value
}
