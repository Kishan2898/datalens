import { NavLink, Outlet } from 'react-router-dom'
import { useAsyncResource } from '../hooks/useAsyncResource'
import { fetchPlatformHealth } from '../api/platformApi'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { to: '/analysis', label: 'Analysis' },
  { to: '/assistant', label: 'AI Assistant' },
]

const linkClasses = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

function AppShell() {
  const { user, workspace, logout } = useAuth()
  const { data: health, loading, error } = useAsyncResource(fetchPlatformHealth)

  return (
    <div className="min-h-screen bg-mist bg-grid font-body text-slate-900">
      <div className="mx-auto max-w-[1400px] px-4 py-4 lg:px-6 lg:py-6">
        <header className="rounded-[24px] border border-slate-200/70 bg-white/90 p-4 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">DataLens</p>
              <h1 className="mt-2 font-display text-2xl text-slate-900">Simple AI data analysis workspace</h1>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClasses}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-2">
                {loading ? 'Checking API...' : error ? 'API offline' : `API ${health.mode}`}
              </span>
              <span>{workspace?.name || 'Workspace'}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 px-4 py-2 font-semibold transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
