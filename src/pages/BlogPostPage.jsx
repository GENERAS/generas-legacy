import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  FaCalendar, FaEye, FaTag, FaArrowLeft, FaUser, 
  FaHeart, FaRegHeart, FaShare, FaTwitter, FaFacebook, 
  FaLinkedin, FaLink, FaBookmark, FaRegBookmark
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import CommentsSection from '../components/comments/CommentsSection'
import LikeButton from '../components/likes/LikeButton'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    loadPost()
    // Check if post is bookmarked in localStorage
    const saved = localStorage.getItem(`bookmarked_${slug}`)
    if (saved === 'true') setBookmarked(true)
  }, [slug])

  const loadPost = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      
      setPost(data)
      
      // Increment view count
      if (data) {
        await supabase
          .from('blog_posts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', data.id)
      }
    } catch (error) {
      console.error('Error loading blog post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = () => {
    const newState = !bookmarked
    setBookmarked(newState)
    localStorage.setItem(`bookmarked_${slug}`, newState.toString())
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const text = post?.title || 'Check out this post'
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
        break
    }
    setShowShareMenu(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getReadingTime = (content) => {
    if (!content) return '1 min read'
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Link to="/community" className="text-blue-400 hover:text-blue-300">← Back to Community</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-8 py-4 border-b border-slate-800">
        <Link to="/community" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition">
          <FaArrowLeft /> Back to Community
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Bookmark Button */}
          <button 
            onClick={handleBookmark}
            className="text-gray-400 hover:text-yellow-500 transition"
            title={bookmarked ? 'Remove bookmark' : 'Save for later'}
          >
            {bookmarked ? <FaBookmark className="text-yellow-500" /> : <FaRegBookmark />}
          </button>
          
          {/* Share Button */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="text-gray-400 hover:text-white transition"
              title="Share"
            >
              <FaShare />
            </button>
            
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg overflow-hidden z-10">
                <button 
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2"
                >
                  <FaTwitter className="text-blue-400" /> Twitter
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2"
                >
                  <FaFacebook className="text-blue-600" /> Facebook
                </button>
                <button 
                  onClick={() => handleShare('linkedin')}
                  className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2"
                >
                  <FaLinkedin className="text-blue-500" /> LinkedIn
                </button>
                <button 
                  onClick={() => handleShare('copy')}
                  className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2"
                >
                  <FaLink /> Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img 
            src={post.featured_image} 
            alt={post.title} 
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      {/* Category Badge */}
      <div className="mb-4">
        <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>
      
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        {post.title}
      </h1>
      
      {/* Author and Meta Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <FaUser />
            <span>BTC GUY</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-2 text-gray-400">
            <FaCalendar />
            <span>{formatDate(post.created_at)}</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-2 text-gray-400">
            <FaEye />
            <span>{post.views || 0} views</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="text-gray-400">
            {getReadingTime(post.content)}
          </div>
        </div>
        
        {/* Like Button for Blog Post */}
        <div className="flex items-center gap-2">
          <LikeButton contentType="blog" contentId={post.id} initialLikes={post.likes || 0} />
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none mb-12">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-8 pb-8 border-b border-slate-800">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FaTag /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="bg-slate-800 px-3 py-1 rounded-full text-sm hover:bg-slate-700 transition cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8">
        <CommentsSection contentType="blog" contentId={post.id} />
      </div>
    </div>
  )
}