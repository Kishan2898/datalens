import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-mist bg-grid px-4 py-10 font-body text-slate-900">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200/70 bg-white/90 p-10 text-center shadow-soft">
          Loading your DataLens workspace...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
