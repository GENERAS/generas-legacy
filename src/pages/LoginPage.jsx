import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaGoogle, FaGithub, FaCrown } from 'react-icons/fa'

export default function LoginPage() {
  const { signInWithGoogle, signInWithGithub, user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔐 LoginPage - user:', user?.email, 'isAdmin:', isAdmin, 'loading:', loading)
    
    if (!loading && user && isAdmin) {
      console.log('✅ Admin detected, navigating to /admin')
      navigate('/admin')
    } else if (!loading && user && !isAdmin) {
      console.log('⚠️ User but not admin, navigating to /')
      navigate('/')
    }
  }, [user, isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <FaCrown className="text-5xl text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold"> GENERAS Legacy</h1>
          <p className="text-gray-400 mt-2">Admin Access Only</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-center">Sign in to continue</h2>
          
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition"
            >
              <FaGoogle className="text-red-500" /> Continue with Google
            </button>
            <button
              onClick={signInWithGithub}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition"
            >
              <FaGithub /> Continue with GitHub
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            🔒 Secure admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}