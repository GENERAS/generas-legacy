import { Link } from 'react-router-dom'
import { FaCrown, FaHome, FaGraduationCap, FaCode, FaChartLine, FaUsers, FaCoffee, FaUser } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { user, profile, signOut } = useAuth()

  const navLinks = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/academic', label: 'Academic', icon: FaGraduationCap },
    { path: '/projects', label: 'Projects', icon: FaCode },
    { path: '/trading', label: 'Trading', icon: FaChartLine },
    { path: '/community', label: 'Community', icon: FaUsers },
  ]

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <FaCrown className="text-2xl text-amber-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
              GENERAS Legacy
            </h1>
          </Link>
          
          <nav className="hidden md:flex gap-1">
            {navLinks.map(link => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
                >
                  <Icon />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Coffee Button - Visible to EVERYONE */}
            <button className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <FaCoffee />
              <span className="hidden sm:inline">Buy Me Coffee</span>
            </button>
            
            {/* User Menu - Only visible when logged in (admin) */}
            {user && (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
                  <FaUser />
                  <span className="hidden sm:inline">{profile?.full_name || user.email?.split('@')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg overflow-hidden hidden group-hover:block">
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-slate-700">Admin Panel</Link>
                  )}
                  <button onClick={signOut} className="block w-full text-left px-4 py-2 hover:bg-slate-700">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}