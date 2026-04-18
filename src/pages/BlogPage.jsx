import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FaNewspaper, FaEye, FaCalendar, FaTag, FaArrowRight, 
  FaSearch, FaFilter, FaHeart, FaComment, FaUser,
  FaFire, FaClock, FaChevronDown
} from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function BlogPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadBlogs()
  }, [])

  const loadBlogs = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      
      setBlogs(data || [])
    } catch (error) {
      console.error('Error loading blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get unique categories
  const categories = ['all', ...new Set(blogs.map(b => b.category).filter(Boolean))]

  // Filter and sort blogs
  const filteredBlogs = blogs
    .filter(blog => {
      const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.content?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0)
      if (sortBy === 'liked') return (b.likes || 0) - (a.likes || 0)
      return 0
    })

  // Featured post (most viewed)
  const featuredPost = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full text-blue-400 text-sm mb-4">
            <FaNewspaper /> Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Articles & Insights
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Explore {blogs.length}+ articles on trading, technology, academics, and more.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <FaFire className="text-red-500" />
              <span className="text-sm font-semibold text-gray-400">Featured Article</span>
            </div>
            <Link 
              to={`/blog/${featuredPost.slug}`}
              className="group block relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2">
                {featuredPost.featured_image ? (
                  <div className="relative h-64 md:h-80">
                    <img 
                      src={featuredPost.featured_image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 to-transparent md:bg-gradient-to-l" />
                  </div>
                ) : (
                  <div className="h-64 md:h-80 bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
                )}
                <div className="p-6 md:p-10 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm w-fit mb-4">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-400 transition">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-400 mb-6 line-clamp-3">
                    {featuredPost.excerpt || featuredPost.content?.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FaCalendar /> {formatDate(featuredPost.created_at)}</span>
                    <span className="flex items-center gap-1"><FaEye /> {featuredPost.views || 0} views</span>
                    <span className="flex items-center gap-1"><FaHeart /> {featuredPost.likes || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="sticky top-20 z-40 mb-8">
          <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 border border-slate-800">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder:text-gray-600"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-blue-500 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-blue-500 text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Viewed</option>
                  <option value="liked">Most Liked</option>
                </select>
                <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{filteredBlogs.length}</span> of {blogs.length} articles
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <Link
              key={blog.id}
              to={`/blog/${blog.slug}`}
              className="group bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500/30 transition-all hover:-translate-y-1"
            >
              {blog.featured_image ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-blue-600/80 text-white text-xs rounded-full">
                      {blog.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                  <FaNewspaper className="text-4xl text-blue-500/30" />
                </div>
              )}
              
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FaCalendar /> {formatDate(blog.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye /> {blog.views || 0}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-400 transition">
                  {blog.title}
                </h3>
                
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                  {blog.excerpt || blog.content?.substring(0, 120)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-blue-400 group-hover:gap-2 transition-all">
                    Read Article <FaArrowRight size={12} />
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><FaHeart /> {blog.likes || 0}</span>
                    <span className="flex items-center gap-1"><FaComment /> {blog.comments_count || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-3xl text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No articles found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('all'); setSortBy('newest')}}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Back to Community */}
        <div className="text-center mt-12 pt-8 border-t border-slate-800">
          <Link 
            to="/community" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <FaArrowRight className="rotate-180" /> Back to Community
          </Link>
        </div>
      </div>
    </div>
  )
}
