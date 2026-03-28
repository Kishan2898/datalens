import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (isRegister) {
        await register({ fullName, email, password })
      } else {
        await login({ email, password })
      }

      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-mist bg-grid px-4 py-10 font-body text-slate-900">
      <div className="mx-auto max-w-md">
        <section className="rounded-[24px] border border-slate-200/70 bg-white/95 p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">DataLens</p>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">{isRegister ? 'Create account' : 'Welcome back'}</p>
          <h2 className="mt-2 font-display text-3xl text-slate-900">
            {isRegister ? 'Start your DataLens workspace' : 'Sign in to your workspace'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Keep it simple: sign in, upload a CSV, explore the data, and ask the AI assistant for insights.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isRegister && (
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white"
              />
            )}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Work email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white"
            />

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Please wait...' : isRegister ? 'Create Workspace' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : 'Need a new workspace?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-sky-600">
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default AuthPage
