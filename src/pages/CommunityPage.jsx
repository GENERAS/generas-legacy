import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SupporterPaymentModal from '../components/supporters/SupporterPaymentModal'
import SupportersHall from '../components/supporters/SupportersHall'
import { 
  FaNewspaper, FaVideo, FaImages, FaCrown, FaUsers, FaShareAlt, 
  FaEye, FaCalendar, FaPlay, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight, 
  FaTimes, FaComment, FaUserPlus, FaArrowRight, FaClock, FaTag,
  FaRegComment, FaEnvelope, FaUser, FaFire, FaBolt, FaStar, FaTrophy,
  FaBell, FaBookmark, FaPaperPlane, FaHashtag, FaWhatsapp
} from 'react-icons/fa'
import { BiTrendingUp } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import LikeButton from '../components/likes/LikeButton'
import CommentsSection from '../components/comments/CommentsSection'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [blogs, setBlogs] = useState([])
  const [videos, setVideos] = useState([])
  const [photos, setPhotos] = useState([])
  const [supporters, setSupporters] = useState([])
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [hoveredPost, setHoveredPost] = useState(null)
  const [emailForFollow, setEmailForFollow] = useState('')
  const [nameForFollow, setNameForFollow] = useState('')
  const [followSuccess, setFollowSuccess] = useState(false)
  const [followError, setFollowError] = useState('')
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [activityFeed, setActivityFeed] = useState([])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notifyMessage, setNotifyMessage] = useState('')
  const [notifySuccess, setNotifySuccess] = useState(false)

  useEffect(() => {
    loadAllContent()
    
    const channel = supabase
      .channel('community-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, () => loadAllContent())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => loadAllContent())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => loadAllContent())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_supporters' }, () => loadAllContent())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Auto-rotate featured content
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadAllContent = async () => {
    try {
      const [blogsRes, videosRes, photosRes, supportersRes, followersRes] = await Promise.all([
        supabase.from('blog_posts').select('*').eq('status', 'published').order('created_at', { ascending: false }),
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('photos').select('*').eq('is_premium', false).order('created_at', { ascending: false }),
        supabase.from('coffee_supporters').select('*').eq('show_in_hall', true).order('cups', { ascending: false }),
        supabase.from('followers').select('*').order('created_at', { ascending: false })
      ])

      setBlogs(blogsRes.data || [])
      setVideos(videosRes.data || [])
      setPhotos(photosRes.data || [])
      setSupporters(supportersRes.data || [])
      setFollowers(followersRes.data || [])
      
      // Generate activity feed
      const activities = [
        ...((blogsRes.data || []).slice(0, 3).map(b => ({ type: 'blog', data: b, time: b.created_at }))),
        ...((supportersRes.data || []).slice(0, 3).map(s => ({ type: 'support', data: s, time: s.created_at }))),
        ...((followersRes.data || []).slice(0, 3).map(f => ({ type: 'follow', data: f, time: f.created_at })))
      ].sort((a, b) => new Date(b.time) - new Date(a.time))
      
      setActivityFeed(activities)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVideoThumbnail = (video) => {
    if (video.platform === 'youtube') return `https://img.youtube.com/vi/${video.video_id}/0.jpg`
    return `https://vumbnail.com/${video.video_id}.jpg`
  }

  const handleFollow = async (e) => {
    e.preventDefault()
    setFollowError('')
    
    if (!emailForFollow) {
      setFollowError('Please enter your email address')
      return
    }
    
    const { error } = await supabase
      .from('followers')
      .insert([{ email: emailForFollow, name: nameForFollow || null, interests: ['general'] }])
    
    if (error) {
      if (error.code === '23505') {
        setFollowError('This email is already subscribed!')
      } else {
        setFollowError(error.message)
      }
    } else {
      setFollowSuccess(true)
      setTimeout(() => {
        setFollowSuccess(false)
        setShowFollowModal(false)
      }, 2000)
      setEmailForFollow('')
      setNameForFollow('')
      loadAllContent()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMins = Math.floor((now - date) / (1000 * 60))
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const openLightbox = (photo, index) => {
    setSelectedPhoto(photo)
    setSelectedPhotoIndex(index)
  }

  const closeLightbox = () => setSelectedPhoto(null)
  
  const nextPhoto = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      const newIndex = selectedPhotoIndex + 1
      setSelectedPhotoIndex(newIndex)
      setSelectedPhoto(photos[newIndex])
    }
  }
  
  const prevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      const newIndex = selectedPhotoIndex - 1
      setSelectedPhotoIndex(newIndex)
      setSelectedPhoto(photos[newIndex])
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhoto, selectedPhotoIndex, photos])

  // Featured content for carousel
  const featuredItems = [
    ...(blogs.slice(0, 2).map(b => ({ type: 'blog', ...b }))),
    ...(videos.slice(0, 1).map(v => ({ type: 'video', ...v }))),
    ...(photos.slice(0, 1).map(p => ({ type: 'photo', ...p })))
  ].slice(0, 4)

  const stats = [
    { label: 'Articles', value: blogs.length, icon: FaNewspaper, color: 'blue', trend: '+12%' },
    { label: 'Videos', value: videos.length, icon: FaVideo, color: 'red', trend: '+8%' },
    { label: 'Photos', value: photos.length, icon: FaImages, color: 'green', trend: '+24%' },
    { label: 'Supporters', value: supporters.length, icon: FaCrown, color: 'amber', trend: '+5%' },
  ]

  const quickActions = [
    { icon: FaUserPlus, label: 'Follow', color: 'purple', onClick: () => setShowFollowModal(true) },
    { icon: FaCrown, label: 'Support', color: 'amber', onClick: () => setShowPaymentModal(true) },
    { icon: FaShareAlt, label: 'Share', color: 'blue', onClick: () => setShowShareModal(true) },
    { icon: FaWhatsapp, label: 'WhatsApp', color: 'green', onClick: () => window.open('https://wa.me/0794144738?text=Hello! I visited your website and would like to connect.', '_blank') },
  ]

  // Share functionality
  const handleShare = async (platform) => {
    const url = window.location.href
    const text = 'Check out this amazing Community Hub! 🚀'
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    }
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Community Hub',
          text: text,
          url: url
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  // Notify admin functionality
  const handleNotify = async (e) => {
    e.preventDefault()
    if (!notifyMessage.trim()) return
    
    const { error } = await supabase
      .from('notifications')
      .insert([{
        type: 'user_notification',
        message: notifyMessage,
        source: 'community_page',
        status: 'unread'
      }])
    
    if (error) {
      console.error('Error sending notification:', error)
    } else {
      setNotifySuccess(true)
      setTimeout(() => {
        setNotifySuccess(false)
        setShowNotifyModal(false)
        setNotifyMessage('')
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading amazing content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FaFire className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Community Hub
                </h1>
                <p className="text-xs text-gray-500">{followers.length.toLocaleString()} members</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="hidden md:flex items-center gap-6">
              {stats.slice(0, 3).map((stat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <stat.icon className={`text-${stat.color}-400`} />
                  <span className="text-gray-400">{stat.label}:</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 bg-slate-800 rounded-lg"
            >
              <FaHashtag className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Sticky Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Main Navigation */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Explore
                </h3>
                <nav className="space-y-1">
                  {[
                    { id: 'all', icon: FaFire, label: 'All Content', count: blogs.length + videos.length + photos.length },
                    { id: 'blogs', icon: FaNewspaper, label: 'Articles', count: blogs.length },
                    { id: 'videos', icon: FaVideo, label: 'Videos', count: videos.length },
                    { id: 'photos', icon: FaImages, label: 'Gallery', count: photos.length },
                    { id: 'supporters', icon: FaCrown, label: 'Supporters', count: supporters.length },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        activeTab === item.id 
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon className={activeTab === item.id ? 'text-blue-400' : ''} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && (
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className={`p-3 rounded-xl bg-gradient-to-br from-${action.color}-600/20 to-${action.color}-600/5 border border-${action.color}-500/20 hover:border-${action.color}-500/40 transition-all group`}
                    >
                      <action.icon className={`mx-auto mb-1 text-${action.color}-400 group-hover:scale-110 transition`} />
                      <span className="text-xs text-gray-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Tags */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BiTrendingUp /> Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Trading', 'Bitcoin', 'Tech', 'Academic', 'AI', 'Web3'].map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-gray-400 hover:bg-slate-700 hover:text-white cursor-pointer transition">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* FEATURED HERO CAROUSEL */}
            {featuredItems.length > 0 && (
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-red-500/80 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                    <FaFire /> FEATURED
                  </span>
                </div>
                
                <div className="relative h-64 md:h-80">
                  {featuredItems.map((item, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 ${
                        index === featuredIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                      }`}
                    >
                      {item.type === 'blog' && (
                        <Link to={`/blog/${item.slug}`} className="block h-full">
                          <div className="relative h-full">
                            {item.featured_image ? (
                              <>
                                <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                              </>
                            ) : (
                              <div className="h-full bg-gradient-to-br from-blue-900/50 to-purple-900/50" />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <span className="px-2 py-1 bg-blue-600 rounded text-xs text-white mb-2 inline-block">
                                {item.category}
                              </span>
                              <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.title}</h2>
                              <p className="text-gray-400 line-clamp-2">{item.excerpt || item.content?.substring(0, 150)}...</p>
                            </div>
                          </div>
                        </Link>
                      )}
                      {item.type === 'video' && (
                        <a 
                          href={item.platform === 'youtube' ? `https://youtube.com/watch?v=${item.video_id}` : `https://vimeo.com/${item.video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-full"
                        >
                          <div className="relative h-full">
                            <img src={getVideoThumbnail(item)} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                <FaPlay className="text-white text-xl ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <span className="px-2 py-1 bg-red-600 rounded text-xs text-white mb-2 inline-block">
                                {item.category}
                              </span>
                              <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.title}</h2>
                            </div>
                          </div>
                        </a>
                      )}
                      {item.type === 'photo' && (
                        <div 
                          onClick={() => openLightbox(item, photos.indexOf(item))}
                          className="cursor-pointer h-full"
                        >
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <span className="px-2 py-1 bg-green-600 rounded text-xs text-white mb-2 inline-block">Gallery</span>
                            <h2 className="text-2xl md:text-3xl font-bold">{item.title || 'Photo Gallery'}</h2>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {featuredItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFeaturedIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === featuredIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CONTENT FEED - Shows based on active tab */}
            {(activeTab === 'all' || activeTab === 'blogs') && blogs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaNewspaper className="text-blue-500" /> Latest Articles
                  </h2>
                  <Link to="/blog" className="text-sm text-blue-400 hover:underline">View all</Link>
                </div>
                <div className="grid gap-4">
                  {blogs.slice(0, activeTab === 'all' ? 3 : 6).map(blog => (
                    <Link
                      key={blog.id}
                      to={`/blog/${blog.slug}`}
                      className="group bg-slate-900/50 rounded-2xl p-4 border border-slate-800 hover:border-blue-500/30 transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex gap-4">
                        {blog.featured_image && (
                          <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden">
                            <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">{blog.category}</span>
                            <span className="text-xs text-gray-500">{formatDate(blog.created_at)}</span>
                          </div>
                          <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition line-clamp-2">{blog.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt || blog.content?.substring(0, 120)}...</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><FaEye /> {blog.views || 0}</span>
                            <span className="flex items-center gap-1"><FaHeart /> {blog.likes || 0}</span>
                            <span className="flex items-center gap-1"><FaComment /> {blog.comments_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* VIDEOS SECTION */}
            {(activeTab === 'all' || activeTab === 'videos') && videos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaVideo className="text-red-500" /> Latest Videos
                  </h2>
                  <a href="/videos" className="text-sm text-red-400 hover:underline">View all</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.slice(0, activeTab === 'all' ? 4 : 8).map(video => (
                    <a
                      key={video.id}
                      href={video.platform === 'youtube' ? `https://youtube.com/watch?v=${video.video_id}` : `https://vimeo.com/${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 hover:border-red-500/30 transition-all hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-video">
                        <img src={getVideoThumbnail(video)} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                            <FaPlay className="text-white ml-0.5" />
                          </div>
                        </div>
                        {video.duration > 0 && (
                          <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs">
                            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-red-400">{video.category}</span>
                        <h3 className="font-bold mt-1 line-clamp-1">{video.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{video.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* PHOTOS GRID */}
            {(activeTab === 'all' || activeTab === 'photos') && photos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaImages className="text-green-500" /> Photo Gallery
                  </h2>
                  <span className="text-sm text-gray-500">{photos.length} photos</span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {photos.slice(0, activeTab === 'all' ? 8 : 16).map((photo, index) => (
                    <div
                      key={photo.id}
                      onClick={() => openLightbox(photo, index)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group ${
                        index === 0 ? 'col-span-2 row-span-2' : ''
                      }`}
                    >
                      <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                        <FaHeart className="text-white opacity-0 group-hover:opacity-100 transition scale-0 group-hover:scale-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUPPORTERS HALL */}
            {(activeTab === 'all' || activeTab === 'supporters') && supporters.length > 0 && (
              <div className="bg-gradient-to-br from-amber-900/20 to-slate-900 rounded-2xl p-6 border border-amber-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaCrown className="text-amber-500" /> Hall of Fame
                  </h2>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-semibold transition"
                  >
                    Become a Supporter
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {supporters.slice(0, 8).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {s.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-amber-400">{s.cups || s.amount || 0} ☕</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CALL TO ACTION */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <FaUserPlus className="text-purple-400" /> Join the Community
                </h3>
                <p className="text-gray-400 text-sm mb-4">Get weekly insights on trading, tech, and academic excellence.</p>
                <button 
                  onClick={() => setShowFollowModal(true)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition"
                >
                  Subscribe Now
                </button>
              </div>
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <FaCrown className="text-amber-400" /> Support the Journey
                </h3>
                <p className="text-gray-400 text-sm mb-4">Get featured in Hall of Fame with your social links.</p>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-semibold transition"
                >
                  Buy Me Coffee
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Activity & Stats */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <div className={`w-8 h-8 rounded-lg bg-${stat.color}-600/20 flex items-center justify-center mb-2`}>
                      <stat.icon className={`text-${stat.color}-400`} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <span className={`text-xs text-green-400`}>{stat.trend}</span>
                  </div>
                ))}
              </div>

              {/* Live Activity Feed */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Activity
                </h3>
                <div className="space-y-3">
                  {activityFeed.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'blog' ? 'bg-blue-600/20' :
                        activity.type === 'support' ? 'bg-amber-600/20' : 'bg-purple-600/20'
                      }`}>
                        {activity.type === 'blog' ? <FaNewspaper className="text-blue-400 text-xs" /> :
                         activity.type === 'support' ? <FaCrown className="text-amber-400 text-xs" /> :
                         <FaUserPlus className="text-purple-400 text-xs" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 truncate">
                          {activity.type === 'blog' ? `New article: ${activity.data.title?.substring(0, 30)}...` :
                           activity.type === 'support' ? `${activity.data.name} bought ${activity.data.cups || activity.data.amount || 1} coffee${(activity.data.cups || activity.data.amount || 1) > 1 ? 's' : ''}!` :
                           `New follower joined`}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                  {activityFeed.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Top Supporters Mini */}
              {supporters.length > 0 && (
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <FaTrophy className="text-amber-400" /> Top Supporters
                  </h3>
                  <div className="space-y-2">
                    {supporters.slice(0, 3).map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3">
                        <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {s.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-amber-400">{s.cups || s.amount || 0} ☕</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Followers */}
              {followers.length > 0 && (
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <FaUsers className="text-purple-400" /> Recent Members
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {followers.slice(0, 6).map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-gray-400">
                        {f.name || f.email?.split('@')[0] || 'Anonymous'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOLLOW MODAL */}
      {showFollowModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaUserPlus className="text-purple-400" /> Subscribe
              </h3>
              <button onClick={() => setShowFollowModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            
            {followSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHeart className="text-green-400 text-2xl" />
                </div>
                <h4 className="text-xl font-bold text-green-400 mb-2">Welcome aboard!</h4>
                <p className="text-gray-400">Check your inbox for confirmation.</p>
              </div>
            ) : (
              <form onSubmit={handleFollow} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Name (optional)</label>
                  <input
                    type="text"
                    value={nameForFollow}
                    onChange={(e) => setNameForFollow(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email *</label>
                  <input
                    type="email"
                    value={emailForFollow}
                    onChange={(e) => setEmailForFollow(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {followError && (
                  <p className="text-red-400 text-sm">{followError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                >
                  Subscribe Now
                </button>
                <p className="text-xs text-gray-500 text-center">Join {followers.length.toLocaleString()}+ subscribers</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 z-50 flex">
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-20">
            <FaTimes />
          </button>
          <div className="flex-1 flex items-center justify-center relative">
            {selectedPhotoIndex > 0 && (
              <button onClick={prevPhoto} className="absolute left-4 text-white text-3xl hover:text-gray-300 bg-black/50 rounded-full p-2 z-10">
                <FaChevronLeft />
              </button>
            )}
            <img src={selectedPhoto.image_url} alt={selectedPhoto.title} className="max-w-full max-h-screen object-contain" />
            {selectedPhotoIndex < photos.length - 1 && (
              <button onClick={nextPhoto} className="absolute right-4 text-white text-3xl hover:text-gray-300 bg-black/50 rounded-full p-2 z-10">
                <FaChevronRight />
              </button>
            )}
          </div>
          <div className="w-80 bg-slate-900 flex flex-col border-l border-slate-800">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaCrown className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-semibold">BTC GUY</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedPhoto.created_at)}</p>
                </div>
              </div>
              {selectedPhoto.title && <p className="mt-3 text-sm">{selectedPhoto.title}</p>}
            </div>
            <div className="p-4 border-b border-slate-800">
              <LikeButton contentType="photo" contentId={selectedPhoto.id} initialLikes={selectedPhoto.likes || 0} />
            </div>

            <div className="flex-1 overflow-y-auto">
              <CommentsSection contentType="photo" contentId={selectedPhoto.id} />
            </div>
          </div>
        </div>
      )}

      {/* Supporter Payment Modal */}
      <SupporterPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaShareAlt className="text-blue-400" /> Share Community
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {navigator.share && (
                <button 
                  onClick={() => handleShare('native')}
                  className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-xs">Native</span>
                </button>
              )}
              <button 
                onClick={() => handleShare('whatsapp')}
                className="p-4 bg-green-900/30 border border-green-600/30 rounded-xl hover:bg-green-900/50 transition flex flex-col items-center gap-2"
              >
                <span className="text-2xl">💬</span>
                <span className="text-xs text-green-400">WhatsApp</span>
              </button>
              <button 
                onClick={() => handleShare('twitter')}
                className="p-4 bg-sky-900/30 border border-sky-600/30 rounded-xl hover:bg-sky-900/50 transition flex flex-col items-center gap-2"
              >
                <span className="text-2xl">🐦</span>
                <span className="text-xs text-sky-400">Twitter</span>
              </button>
              <button 
                onClick={() => handleShare('facebook')}
                className="p-4 bg-blue-900/30 border border-blue-600/30 rounded-xl hover:bg-blue-900/50 transition flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📘</span>
                <span className="text-xs text-blue-400">Facebook</span>
              </button>
              <button 
                onClick={() => handleShare('linkedin')}
                className="p-4 bg-indigo-900/30 border border-indigo-600/30 rounded-xl hover:bg-indigo-900/50 transition flex flex-col items-center gap-2"
              >
                <span className="text-2xl">💼</span>
                <span className="text-xs text-indigo-400">LinkedIn</span>
              </button>
              <button 
                onClick={() => handleShare('telegram')}
                className="p-4 bg-cyan-900/30 border border-cyan-600/30 rounded-xl hover:bg-cyan-900/50 transition flex flex-col items-center gap-2"
              >
                <span className="text-2xl">✈️</span>
                <span className="text-xs text-cyan-400">Telegram</span>
              </button>
            </div>
            
            <button 
              onClick={() => handleShare('copy')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <FaPaperPlane /> Copy Link
            </button>
          </div>
        </div>
      )}

      {/* NOTIFY MODAL */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaBell className="text-pink-400" /> Notify Admin
              </h3>
              <button onClick={() => setShowNotifyModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            
            {notifySuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBell className="text-green-400 text-2xl" />
                </div>
                <h4 className="text-xl font-bold text-green-400 mb-2">Message Sent!</h4>
                <p className="text-gray-400">Admin has been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleNotify} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Message for Admin</label>
                  <textarea
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 h-32 focus:outline-none focus:border-pink-500 resize-none"
                    placeholder="Enter your message, suggestion, or notification..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition flex items-center justify-center gap-2"
                >
                  <FaPaperPlane /> Send Notification
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}