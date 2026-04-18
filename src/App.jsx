import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import ScrollToTop from './components/common/ScrollToTop'

// Lazy load all pages for code splitting - reduces initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AcademicPage = lazy(() => import('./pages/AcademicPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const TradingPage = lazy(() => import('./pages/TradingPage'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const HiringPage = lazy(() => import('./pages/HiringPage'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))

// Simple loading fallback - minimal HTML/CSS for fast render
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-pulse text-blue-400 text-sm">Loading...</div>
  </div>
)

// Component to handle scroll on route change
function ScrollHandler() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Immediate scroll
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Delayed scroll to ensure it works
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 100)

    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}

function App() {
  // Disable browser scroll restoration
  if (window.history && window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual'
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="*" element={<ScrollHandler />} />
          {/* Public routes */}
          <Route path="/" element={<Layout><Suspense fallback={<PageLoader />}><HomePage /></Suspense></Layout>} />
          <Route path="/academic" element={<Layout><Suspense fallback={<PageLoader />}><AcademicPage /></Suspense></Layout>} />
          <Route path="/projects" element={<Layout><Suspense fallback={<PageLoader />}><ProjectsPage /></Suspense></Layout>} />
          <Route path="/trading" element={<Layout><Suspense fallback={<PageLoader />}><TradingPage /></Suspense></Layout>} />
          <Route path="/community" element={<Layout><Suspense fallback={<PageLoader />}><CommunityPage /></Suspense></Layout>} />
          <Route path="/blog" element={<Layout><Suspense fallback={<PageLoader />}><BlogPage /></Suspense></Layout>} />
          <Route path="/blog/:slug" element={<Layout><Suspense fallback={<PageLoader />}><BlogPostPage /></Suspense></Layout>} />
          <Route path="/mentorship" element={<Navigate to="/service" replace />} />
          <Route path="/services" element={<Navigate to="/service" replace />} />
          <Route path="/services/:slug" element={<Layout><Suspense fallback={<PageLoader />}><ServiceDetailPage /></Suspense></Layout>} />
          <Route path="/service" element={<Layout><Suspense fallback={<PageLoader />}><ServicePage /></Suspense></Layout>} />
          <Route path="/hire-me" element={<Layout><Suspense fallback={<PageLoader />}><HiringPage /></Suspense></Layout>} />
          <Route path="/testimonials" element={<Layout><Suspense fallback={<PageLoader />}><TestimonialsPage /></Suspense></Layout>} />

          {/* Admin routes */}
          <Route path="/admin-login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}><AdminPage /></Suspense>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App