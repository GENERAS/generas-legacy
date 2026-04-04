import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaGraduationCap, FaCode, FaChartLine, FaCoffee, FaUsers, FaCalendar, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import SkillsMatrix from '../components/skills/SkillsMatrix'  // ← ADD THIS IMPORT

export default function HomePage() {
  const [stats, setStats] = useState({
    academic_levels: 0,
    projects: 0,
    trades: 0,
    supporters: 0,
    followers: 0,
    days_active: 365
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [academic, projects, trades, supporters, followers] = await Promise.all([
        supabase.from('academic_levels').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('trades').select('*', { count: 'exact', head: true }),
        supabase.from('coffee_supporters').select('*', { count: 'exact', head: true }),
        supabase.from('followers').select('*', { count: 'exact', head: true })
      ])

      setStats({
        academic_levels: academic.count || 0,
        projects: projects.count || 0,
        trades: trades.count || 0,
        supporters: supporters.count || 0,
        followers: followers.count || 0,
        days_active: 365
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { value: stats.academic_levels, label: 'Academic Levels', icon: FaGraduationCap, color: 'text-blue-500', desc: 'From Nursery to PhD' },
    { value: stats.projects, label: 'Projects Built', icon: FaCode, color: 'text-green-500', desc: 'Web, Mobile, Blockchain' },
    { value: stats.trades, label: 'Trades Logged', icon: FaChartLine, color: 'text-purple-500', desc: 'Binance, MT4, MT5' },
    { value: stats.supporters, label: 'Supporters', icon: FaCoffee, color: 'text-amber-500', desc: 'Coffee buyers' },
    { value: stats.followers, label: 'Followers', icon: FaUsers, color: 'text-cyan-500', desc: 'Newsletter subscribers' },
    { value: stats.days_active + '+', label: 'Days Active', icon: FaCalendar, color: 'text-white', desc: 'Building legacy' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Kagiraneza Generas
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
         FullStack Developer | Crypto& Forex Trader | Entrepreneur
        </p>
        <p className="text-lg text-gray-500 mt-2">
          Tracking my journey from Nursery School to Infinity
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link to="/academic" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition">
            Explore My Journey <FaArrowRight />
          </Link>
          <button className="bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg flex items-center gap-2 transition">
            Support Me <FaCoffee />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-slate-800/30 rounded-xl p-4 text-center hover:bg-slate-800/50 transition border border-slate-700/50">
              <Icon className={`text-2xl mx-auto mb-2 ${card.color}`} />
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-gray-400 mt-1">{card.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{card.desc}</div>
            </div>
          )
        })}
      </div>

      {/* SKILLS MATRIX - ADD THIS SECTION */}
      <div className="mt-8">
        <SkillsMatrix />
      </div>

      {/* Coming Soon Sections (Optional - you can remove these if you want) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap />
            </div>
            <h2 className="text-2xl font-bold">Academic Journey</h2>
          </div>
          <p className="text-gray-400 mb-4">
            From Nursery School to PhD. View my complete education timeline, certificates, grades, and achievements.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">{stats.academic_levels} Levels</span>
            <Link to="/academic" className="bg-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-700">View →</Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FaCode />
            </div>
            <h2 className="text-2xl font-bold">Project Portfolio</h2>
          </div>
          <p className="text-gray-400 mb-4">
            See my work: Legacy Platform, Trading Journal, E-commerce System, and more. Live demos and GitHub links.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">{stats.projects} Projects</span>
            <Link to="/projects" className="bg-green-600 px-3 py-1 rounded-full text-sm hover:bg-green-700">View →</Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <FaChartLine />
            </div>
            <h2 className="text-2xl font-bold">Trading Dashboard</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Real trading history, P&L charts, win rate, strategies, and lessons learned from {stats.trades} trades.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">{stats.trades} Trades</span>
            <Link to="/trading" className="bg-purple-600 px-3 py-1 rounded-full text-sm hover:bg-purple-700">View →</Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <FaUsers />
            </div>
            <h2 className="text-2xl font-bold">Community</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Join the community! Read blogs, watch videos, view photos, and become a supporter.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">{stats.supporters} Supporters</span>
            <Link to="/community" className="bg-amber-600 px-3 py-1 rounded-full text-sm hover:bg-amber-700">Visit →</Link>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-green-500/30">
        <p className="text-green-400 text-sm">✅ Database Connected | 36 Tables Ready | {stats.academic_levels} Academic Levels, {stats.projects} Projects, {stats.trades} Trades</p>
        <p className="text-gray-500 text-xs mt-1">Skills Matrix shows your current skills with progress bars</p>
      </div>
    </div>
  )
}