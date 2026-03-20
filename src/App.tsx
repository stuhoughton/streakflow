import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import HabitsView from './pages/HabitsView'
import StatsView from './pages/StatsView'
import HabitDetailView from './pages/HabitDetailView'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationPermissionPrompt from './components/NotificationPermissionPrompt'

function App() {
  const { restoreSession, isLoading } = useAuthStore()

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-100">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <NotificationPermissionPrompt />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <HabitsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits/:id"
          element={
            <ProtectedRoute>
              <HabitDetailView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <StatsView />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
