import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  FaChartLine, FaGraduationCap, FaBrain, FaCode, FaChartLine as FaTrading, 
  FaCoffee, FaNewspaper, FaVideo, FaImages, FaCrown, FaUsers, FaEnvelope, 
  FaShareAlt, FaComments, FaCog, FaAward 
} from 'react-icons/fa'
import AdminDashboard from '../components/admin/AdminDashboard'
import AcademicManager from '../components/admin/AcademicManager'
import ProjectsManager from '../components/admin/ProjectsManager'
import TradingManager from '../components/admin/TradingManager'
import SkillsManager from '../components/admin/SkillsManager'
import BlogManager from '../components/admin/BlogManager'
import VideoManager from '../components/admin/VideoManager'
import PhotoManager from '../components/admin/PhotoManager'
import SupporterManager from '../components/admin/SupporterManager'
import CoffeeManager from '../components/admin/CoffeeManager'
import FollowerManager from '../components/admin/FollowerManager'
import CommentModerator from '../components/admin/CommentModerator'
import CertificatesManager from '../components/admin/CertificatesManager'

export default function AdminPage() {
  const { user, profile, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Redirect if not authenticated or not admin
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    navigate('/admin-login')
    return null
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
    { id: 'academic', label: 'Academic', icon: FaGraduationCap },
    { id: 'skills', label: 'Skills', icon: FaBrain },
    { id: 'projects', label: 'Projects', icon: FaCode },
    { id: 'trading', label: 'Trading', icon: FaTrading },
    { id: 'coffee', label: 'Coffee', icon: FaCoffee },
    { id: 'blogs', label: 'Blogs', icon: FaNewspaper },
    { id: 'videos', label: 'Videos', icon: FaVideo },
    { id: 'photos', label: 'Photos', icon: FaImages },
    { id: 'supporters', label: 'Supporters', icon: FaCrown },
    { id: 'followers', label: 'Followers', icon: FaUsers },
    { id: 'comments', label: 'Comments', icon: FaComments },
    { id: 'settings', label: 'Settings', icon: FaCog },
    { id: 'certificates', label: 'Certificates', icon: FaAward },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Control Center</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 pb-2 border-b border-slate-700">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeTab === tab.id ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <Icon /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-slate-800/30 rounded-xl p-6">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'academic' && <AcademicManager />}
        {activeTab === 'skills' && <SkillsManager />}
        {activeTab === 'projects' && <ProjectsManager />}
        {activeTab === 'trading' && <TradingManager />}
        {activeTab === 'coffee' && <CoffeeManager />}
        {activeTab === 'blogs' && <BlogManager />}
        {activeTab === 'videos' && <VideoManager />}
        {activeTab === 'photos' && <PhotoManager />}
        {activeTab === 'supporters' && <SupporterManager />}
        {activeTab === 'followers' && <FollowerManager />}
        {activeTab === 'comments' && <CommentModerator />}
        {activeTab === 'settings' && <div className="text-center py-12 text-gray-400">Settings coming soon</div>}
        {activeTab === 'certificates' && <CertificatesManager />}
      </div>
    </div>
  )
}