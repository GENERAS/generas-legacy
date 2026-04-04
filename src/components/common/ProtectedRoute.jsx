import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  console.log('🛡️ ProtectedRoute - loading:', loading, 'user:', user?.email, 'isAdmin:', isAdmin)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-400">Checking authentication...</p>
      </div>
    )
  }

  if (!user) {
    console.log('🚫 No user, redirecting to admin login')
    return <Navigate to="/admin-login" replace />
  }

  if (!isAdmin) {
    console.log('🚫 User is not admin, redirecting to home')
    return <Navigate to="/" replace />
  }

  console.log('✅ Admin access granted')
  return children
}