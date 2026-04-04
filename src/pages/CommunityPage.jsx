import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FaNewspaper, FaVideo, FaImages, FaCrown, FaUsers, FaShareAlt, 
  FaEye, FaCalendar, FaPlay, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight, 
  FaTimes, FaComment, FaUserPlus, FaArrowRight, FaClock, FaTag,
  FaRegComment
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import LikeButton from '../components/likes/LikeButton'
import CommentsSection from '../components/comments/CommentsSection'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('blogs')
  const [blogs, setBlogs] = useState([])
  const [videos, setVideos] = useState([])
  const [photos, setPhotos] = useState([])
  const [supporters, setSupporters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [hoveredPost, setHoveredPost] = useState(null)
  const [emailForFollow, setEmailForFollow] = useState('')
  const [nameForFollow, setNameForFollow] = useState('')
  const [followSuccess, setFollowSuccess] = useState(false)

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

  const loadAllContent = async () => {
    try {
      const [blogsRes, videosRes, photosRes, supportersRes] = await Promise.all([
        supabase.from('blog_posts').select('*').eq('status', 'published').order('created_at', { ascending: false }),
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('photos').select('*').eq('is_premium', false).order('created_at', { ascending: false }),
        supabase.from('coffee_supporters').select('*').eq('show_in_hall', true).order('cups', { ascending: false })
      ])

      setBlogs(blogsRes.data || [])
      setVideos(videosRes.data || [])
      setPhotos(photosRes.data || [])
      setSupporters(supportersRes.data || [])
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
    if (!emailForFollow) return
    
    const { error } = await supabase
      .from('followers')
      .insert([{ email: emailForFollow, name: nameForFollow || null, interests: ['general'] }])
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setFollowSuccess(true)
      setTimeout(() => setFollowSuccess(false), 3000)
      setEmailForFollow('')
      setNameForFollow('')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
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

  const tabs = [
    { id: 'blogs', label: 'Blog Posts', icon: FaNewspaper, count: blogs.length, color: 'from-blue-600 to-blue-500' },
    { id: 'videos', label: 'Videos', icon: FaVideo, count: videos.length, color: 'from-red-600 to-red-500' },
    { id: 'photos', label: 'Gallery', icon: FaImages, count: photos.length, color: 'from-green-600 to-green-500' },
    { id: 'supporters', label: 'Supporters', icon: FaCrown, count: supporters.length, color: 'from-amber-600 to-amber-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Community
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Join my journey - explore content, engage, and become part of something special
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* BLOGS TAB */}
      {activeTab === 'blogs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <Link
              key={blog.id}
              to={`/blog/${blog.slug}`}
              onMouseEnter={() => setHoveredPost(blog.id)}
              onMouseLeave={() => setHoveredPost(null)}
              className="group bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              {blog.featured_image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {blog.category}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <FaCalendar className="text-amber-500" size={12} />
                    {formatDate(blog.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye className="text-blue-500" size={12} />
                    {blog.views || 0} views
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-400 transition">
                  {blog.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {blog.excerpt || blog.content?.substring(0, 120)}...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-blue-400">
                    Read more <FaArrowRight size={12} />
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <FaTag size={10} /> {blog.tags[0]}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {blogs.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-500">
              <FaNewspaper className="text-5xl mx-auto mb-3 opacity-50" />
              <p>No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      )}

      {/* VIDEOS TAB */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <a
              key={video.id}
              href={video.platform === 'youtube' ? `https://youtube.com/watch?v=${video.video_id}` : `https://vimeo.com/${video.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={getVideoThumbnail(video)}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                    <FaPlay className="text-white text-xl ml-1" />
                  </div>
                </div>
                {video.duration > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <FaClock size={10} /> {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{video.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-2">{video.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{video.category}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FaEye size={10} /> {video.views || 0} views
                  </span>
                </div>
              </div>
            </a>
          ))}
          {videos.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-500">
              <FaVideo className="text-5xl mx-auto mb-3 opacity-50" />
              <p>No videos yet. Check back soon!</p>
            </div>
          )}
        </div>
      )}

      {/* PHOTOS TAB - Grid */}
      {activeTab === 'photos' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo, index)}
                className="group relative aspect-square bg-slate-800 rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || 'Photo'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-sm">Click to view</span>
                </div>
                {photo.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm truncate">{photo.title}</p>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 z-10">
                  <LikeButton contentType="photo" contentId={photo.id} initialLikes={photo.likes || 0} />
                </div>
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FaImages className="text-5xl mx-auto mb-3 opacity-50" />
              <p>No photos yet. Check back soon!</p>
            </div>
          )}
        </>
      )}

      {/* SUPPORTERS TAB */}
      {activeTab === 'supporters' && (
        <div className="space-y-8">
          {supporters.filter(s => s.cups >= 21).length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
                <span className="text-3xl">👑</span> Gold Supporters
                <span className="text-sm text-gray-500 font-normal">(21+ coffees)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supporters.filter(s => s.cups >= 21).map(s => (
                  <div key={s.id} className="bg-gradient-to-r from-amber-600/10 to-amber-600/5 rounded-xl p-4 border border-amber-600/30">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {s.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{s.name}</h4>
                        <p className="text-amber-400 flex items-center gap-1">
                          <FaCrown size={14} /> {s.cups} coffees
                        </p>
                      </div>
                    </div>
                    {s.message && (
                      <p className="mt-3 text-gray-300 italic text-sm pl-2 border-l-2 border-amber-500">
                        "{s.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {supporters.filter(s => s.cups >= 6 && s.cups < 21).length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
                <span className="text-3xl">⭐</span> Silver Supporters
                <span className="text-sm text-gray-500 font-normal">(6-20 coffees)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {supporters.filter(s => s.cups >= 6 && s.cups < 21).map(s => (
                  <div key={s.id} className="bg-slate-800/30 rounded-lg p-3 text-center hover:bg-slate-700/30 transition">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2">
                      {s.name?.charAt(0) || '?'}
                    </div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.cups} ☕</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {supporters.filter(s => s.cups < 6).length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
                <span className="text-3xl">☕</span> Bronze Supporters
                <span className="text-sm text-gray-500 font-normal">(1-5 coffees)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {supporters.filter(s => s.cups < 6).map(s => (
                  <span key={s.id} className="bg-slate-800 px-3 py-1.5 rounded-full text-sm hover:bg-slate-700 transition">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center p-6 bg-gradient-to-r from-amber-600/10 to-blue-600/10 rounded-xl border border-amber-500/20">
            <h3 className="text-xl font-bold mb-2">Support This Journey</h3>
            <p className="text-gray-400 mb-4">Buy a coffee and get featured in the Hall of Fame</p>
            <button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 px-6 py-2 rounded-full transition flex items-center gap-2 mx-auto">
              <FaCrown /> Become a Supporter
            </button>
          </div>

          {supporters.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FaCrown className="text-5xl mx-auto mb-3 opacity-50" />
              <p>Be the first to become a supporter!</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* INSTAGRAM-STYLE PHOTO LIGHTBOX MODAL */}
      {/* ========================================== */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 z-50 flex">
          {/* Close button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition z-20"
          >
            <FaTimes />
          </button>

          {/* LEFT SIDE: IMAGE with navigation */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Previous button */}
            {selectedPhotoIndex > 0 && (
              <button 
                onClick={prevPhoto}
                className="absolute left-4 text-white text-3xl hover:text-gray-300 bg-black/50 rounded-full p-2 transition z-10"
              >
                <FaChevronLeft />
              </button>
            )}
            
            {/* Image */}
            <img 
              src={selectedPhoto.image_url} 
              alt={selectedPhoto.title || 'Photo'}
              className="max-w-full max-h-screen object-contain"
            />
            
            {/* Next button */}
            {selectedPhotoIndex < photos.length - 1 && (
              <button 
                onClick={nextPhoto}
                className="absolute right-4 text-white text-3xl hover:text-gray-300 bg-black/50 rounded-full p-2 transition z-10"
              >
                <FaChevronRight />
              </button>
            )}
          </div>

          {/* RIGHT SIDE: Instagram-style Comments Panel */}
          <div className="w-96 bg-black/80 flex flex-col border-l border-gray-800">
            {/* Header with photo info */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaCrown className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-semibold text-white">BTC GUY</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedPhoto.created_at)}</p>
                </div>
              </div>
              {selectedPhoto.title && (
                <p className="text-white text-sm mt-3">{selectedPhoto.title}</p>
              )}
              {selectedPhoto.description && (
                <p className="text-gray-400 text-sm mt-1">{selectedPhoto.description}</p>
              )}
            </div>

            {/* Like Button Section */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <LikeButton contentType="photo" contentId={selectedPhoto.id} initialLikes={selectedPhoto.likes || 0} />
                <button className="text-white hover:text-gray-300 transition">
                  <FaRegComment className="text-xl" />
                </button>
              </div>
              <p className="text-white text-sm font-semibold mt-2">
                {selectedPhoto.likes || 0} likes
              </p>
            </div>

            {/* Comments Section - Scrollable with Reply Support */}
            <div className="flex-1 overflow-y-auto">
              <CommentsSection contentType="photo" contentId={selectedPhoto.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}