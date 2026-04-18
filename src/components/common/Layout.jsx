import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBriefcase, FaRocket, FaHome, FaGraduationCap, FaCode, FaChartLine, FaUsers, FaStar } from 'react-icons/fa'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'

// Lightweight CTA - no animations, minimal CPU usage
function SimpleCTA() {
  return (
    <Link
      to="/hire-me"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-600 text-xs"
    >
      <FaRocket className="w-3 h-3 text-blue-400" style={{ width: '12px', height: '12px' }} />
      <span className="text-slate-300 whitespace-nowrap">Need help?</span>
    </Link>
  )
}

// Mobile Bottom Navigation - Always visible on small screens
function MobileBottomNav() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/academic', label: 'Academic', icon: FaGraduationCap },
    { path: '/projects', label: 'Projects', icon: FaCode },
    { path: '/trading', label: 'Trading', icon: FaChartLine },
    { path: '/community', label: 'Community', icon: FaUsers },
  ]
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} style={{ width: '20px', height: '20px' }} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function Layout({ children }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    // Force scroll to top on mount
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 relative md:pb-8 pb-20">
        {/* Hire Me Section - Top Right on Every Page except Home */}
        {!isHomePage && (
          <div className="flex justify-end items-center gap-3 mb-4">
            <SimpleCTA />
            <Link
              to="/hire-me"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FaBriefcase className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
              <span>Hire Me</span>
            </Link>
          </div>
        )}
        {children}
      </main>
      <Footer className="md:block hidden" />
      
      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <MobileBottomNav />
      
      {/* WhatsApp Floating Button - Visible on all pages */}
      <WhatsAppButton 
        phoneNumber="0794144738" // Replace with your number (e.g., "1234567890")
        message="Hello! I visited your website and would like to connect."
      />
    </div>
  )
}