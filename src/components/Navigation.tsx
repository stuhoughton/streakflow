import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function Navigation() {
  const location = useLocation()
  const { logout } = useAuthStore()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 md:static md:border-b md:border-t-0">
      <div className="flex justify-around md:justify-start md:gap-8 md:px-6 md:py-4">
        <Link
          to="/dashboard"
          className={`flex-1 md:flex-none py-3 px-4 text-center md:text-left transition-colors ${
            isActive('/dashboard')
              ? 'text-blue-500 border-t-2 md:border-t-0 md:border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
          aria-current={isActive('/dashboard') ? 'page' : undefined}
        >
          Dashboard
        </Link>
        <Link
          to="/habits"
          className={`flex-1 md:flex-none py-3 px-4 text-center md:text-left transition-colors ${
            isActive('/habits')
              ? 'text-blue-500 border-t-2 md:border-t-0 md:border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
          aria-current={isActive('/habits') ? 'page' : undefined}
        >
          Habits
        </Link>
        <Link
          to="/stats"
          className={`flex-1 md:flex-none py-3 px-4 text-center md:text-left transition-colors ${
            isActive('/stats')
              ? 'text-blue-500 border-t-2 md:border-t-0 md:border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
          aria-current={isActive('/stats') ? 'page' : undefined}
        >
          Stats
        </Link>
        <button
          onClick={handleLogout}
          className="flex-1 md:flex-none py-3 px-4 text-center md:text-left text-slate-400 hover:text-slate-300 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
