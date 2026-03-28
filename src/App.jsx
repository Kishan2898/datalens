import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layout/AppShell'
import ProtectedRoute from './layout/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import AnalysisStudioPage from './pages/AnalysisStudioPage'
import AssistantPage from './pages/AssistantPage'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/analysis" replace />} />
            <Route path="analysis" element={<AnalysisStudioPage />} />
            <Route path="assistant" element={<AssistantPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
