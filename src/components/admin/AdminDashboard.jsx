import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Coffee, MessageSquare, Newspaper, Video, Image, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    supporters: 0,
    comments: 0,
    pendingComments: 0,
    blogs: 0,
    videos: 0,
    photos: 0,
    mentorshipApps: 0,
    projectInquiries: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      console.log('🔄 Loading dashboard stats...')
      
      const [coffeeSupporters, comments, pending, blogs, videos, photos, mentorship, projects] = await Promise.all([
        supabase.from('coffee_supporters').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('mentorship_applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('project_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new')
      ])

      console.log('📊 Stats loaded:', {
        comments: comments.count,
        pending: pending.count,
        coffeeSupporters: coffeeSupporters.count
      })

      setStats({
        supporters: coffeeSupporters.count || 0,
        comments: comments.count || 0,
        pendingComments: pending.count || 0,
        blogs: blogs.count || 0,
        videos: videos.count || 0,
        photos: photos.count || 0,
        mentorshipApps: mentorship.count || 0,
        projectInquiries: projects.count || 0
      })
    } catch (error) {
      console.error('❌ Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh button
  const handleRefresh = () => {
    setLoading(true)
    loadStats()
  }

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <button 
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Coffee className="w-4 h-4 text-white mx-auto mb-2" />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <Coffee className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.supporters}</div>
          <div className="text-xs text-gray-400">Supporters</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.comments}</div>
          <div className="text-xs text-gray-400">Total Comments</div>
          {stats.pendingComments > 0 && <div className="text-xs text-amber-500">{stats.pendingComments} pending approval</div>}
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <Newspaper className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.blogs}</div>
          <div className="text-xs text-gray-400">Blog Posts</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <Video className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.videos}</div>
          <div className="text-xs text-gray-400">Videos</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <Image className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.photos}</div>
          <div className="text-xs text-gray-400">Photos</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.mentorshipApps}</div>
          <div className="text-xs text-gray-400">Mentorship Apps</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.projectInquiries}</div>
          <div className="text-xs text-gray-400">Project Inquiries</div>
        </div>
      </div>
    </div>
  )
}