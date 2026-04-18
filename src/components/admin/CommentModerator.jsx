import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FaCheck, FaTimes, FaReply, FaTrash, FaStar, FaRegStar,
  FaNewspaper, FaCode, FaChartLine, FaImage, FaAward,
  FaExclamationTriangle, FaBell, FaChevronDown, FaChevronUp,
  FaEye, FaEyeSlash, FaSync
} from 'react-icons/fa'

export default function CommentModerator() {
  const [comments, setComments] = useState([])
  const [systemComments, setSystemComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('blog')
  const [replyText, setReplyText] = useState({})
  const [showReply, setShowReply] = useState({})
  const [visibleCount, setVisibleCount] = useState(10)
  const [showSystemBell, setShowSystemBell] = useState(false)
  const [newComments, setNewComments] = useState({})
  const [lastCheckTime, setLastCheckTime] = useState(new Date())

  useEffect(() => {
    loadComments()
    
    // Set up real-time subscription for new comments
    const channel = supabase
      .channel('comments-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const newComment = payload.new
          if (newComment.created_at > lastCheckTime.toISOString()) {
            setNewComments(prev => ({
              ...prev,
              [newComment.content_type]: (prev[newComment.content_type] || 0) + 1
            }))
          }
          loadComments()
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadComments = async () => {
    try {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        // Separate system/test comments
        const system = data.filter(c => 
          c.visitor_name === 'Test User' || 
          c.visitor_name === 'Policy Test' ||
          c.comment_text?.toLowerCase().includes('test')
        )
        
        const real = data.filter(c => 
          c.visitor_name !== 'Test User' && 
          c.visitor_name !== 'Policy Test' &&
          !c.comment_text?.toLowerCase().includes('test')
        )
        
        setSystemComments(system)
        setComments(real)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
      setLastCheckTime(new Date())
    }
  }

  const handleApprove = async (id) => {
    await supabase.from('comments').update({ is_approved: true }).eq('id', id)
    loadComments()
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this comment?')) {
      await supabase.from('comments').delete().eq('id', id)
      loadComments()
    }
  }

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return
    
    await supabase
      .from('comments')
      .update({ admin_reply: replyText[id] })
      .eq('id', id)
    
    setReplyText({})
    setShowReply({})
    loadComments()
  }

  const deleteSystemComment = async (id) => {
    if (confirm('Delete this test comment?')) {
      await supabase.from('comments').delete().eq('id', id)
      loadComments()
    }
  }

  const deleteAllSystemComments = async () => {
    if (confirm(`Delete all ${systemComments.length} test comments?`)) {
      for (const comment of systemComments) {
        await supabase.from('comments').delete().eq('id', comment.id)
      }
      loadComments()
    }
  }

  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'blog': return <FaNewspaper className="text-blue-500" />
      case 'project': return <FaCode className="text-green-500" />
      case 'trade': return <FaChartLine className="text-purple-500" />
      case 'photo': return <FaImage className="text-pink-500" />
      case 'certificate': return <FaAward className="text-amber-500" />
      default: return <FaNewspaper className="text-gray-500" />
    }
  }

  const getContentTypeLabel = (type) => {
    switch(type) {
      case 'blog': return 'Blog'
      case 'project': return 'Project'
      case 'trade': return 'Trade'
      case 'photo': return 'Photo'
      case 'certificate': return 'Certificate'
      default: return type
    }
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? 
          <FaStar key={i} className="text-amber-500 text-xs" /> : 
          <FaRegStar key={i} className="text-amber-500 text-xs" />
      )
    }
    return stars
  }

  const tabs = [
    { id: 'blog', label: 'Blog', icon: FaNewspaper, bgColor: 'bg-blue-600', hoverBg: 'bg-blue-700', count: comments.filter(c => c.content_type === 'blog').length },
    { id: 'project', label: 'Projects', icon: FaCode, bgColor: 'bg-green-600', hoverBg: 'bg-green-700', count: comments.filter(c => c.content_type === 'project').length },
    { id: 'trade', label: 'Trades', icon: FaChartLine, bgColor: 'bg-purple-600', hoverBg: 'bg-purple-700', count: comments.filter(c => c.content_type === 'trade').length },
    { id: 'photo', label: 'Photos', icon: FaImage, bgColor: 'bg-pink-600', hoverBg: 'bg-pink-700', count: comments.filter(c => c.content_type === 'photo').length },
    { id: 'certificate', label: 'Certificates', icon: FaAward, bgColor: 'bg-amber-600', hoverBg: 'bg-amber-700', count: comments.filter(c => c.content_type === 'certificate').length }
  ]

  const filteredComments = comments.filter(c => c.content_type === activeTab)
  const visibleComments = filteredComments.slice(0, visibleCount)
  const hasMore = filteredComments.length > visibleCount
  const pendingCount = filteredComments.filter(c => !c.is_approved).length

  const clearNewBadge = (tabId) => {
    setNewComments(prev => ({ ...prev, [tabId]: 0 }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats and Notification Bell */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Comments</h2>
          <p className="text-gray-400 text-sm">Manage and moderate user feedback</p>
        </div>
        
        {/* Notification Bell for System Comments */}
        <div className="relative">
          <button
            onClick={() => setShowSystemBell(!showSystemBell)}
            className="relative p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <FaExclamationTriangle className="text-amber-500" />
            {systemComments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {systemComments.length}
              </span>
            )}
          </button>
          
          {/* System Comments Popup */}
          {showSystemBell && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700 z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold">Test Comments ({systemComments.length})</h3>
                {systemComments.length > 0 && (
                  <button
                    onClick={deleteAllSystemComments}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {systemComments.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    <FaCheck className="mx-auto mb-2 text-green-500" />
                    No test comments found
                  </div>
                ) : (
                  systemComments.map(comment => (
                    <div key={comment.id} className="p-3 border-b border-slate-700 hover:bg-slate-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{comment.visitor_name}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{comment.comment_text}</p>
                        </div>
                        <button
                          onClick={() => deleteSystemComment(comment.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs with Counts and New Badges */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          const hasNew = newComments[tab.id] > 0
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                clearNewBadge(tab.id)
                setVisibleCount(10)
              }}
              className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? `${tab.bgColor} text-white`
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <Icon />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
              {hasNew && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </button>
          )
        })}
      </div>

      {/* Pending Count Indicator */}
      {pendingCount > 0 && (
        <div className="bg-amber-600/20 border border-amber-600/30 rounded-lg p-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-amber-400">
            {pendingCount} comment{pendingCount !== 1 ? 's' : ''} pending approval
          </span>
          <button
            onClick={() => setActiveTab(activeTab)}
            className="text-xs text-amber-400 hover:text-amber-300 ml-auto"
          >
            Review now →
          </button>
        </div>
      )}

      {/* Comments List - Compact */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {visibleComments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaNewspaper className="text-4xl mx-auto mb-3 opacity-50" />
            <p>No comments yet</p>
          </div>
        ) : (
          visibleComments.map(comment => {
            const isPending = !comment.is_approved
            const hasReply = comment.admin_reply
            const isExpanded = showReply[comment.id]

            return (
              <div 
                key={comment.id} 
                className={`bg-slate-800/50 rounded-lg p-3 transition ${
                  isPending ? 'border-l-4 border-l-amber-500' : ''
                }`}
              >
                {/* Comment Header - Compact */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isPending ? 'bg-amber-600' : 'bg-slate-600'
                    }`}>
                      {comment.visitor_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{comment.visitor_name}</span>
                        {isPending && (
                          <span className="text-xs bg-amber-600 px-1.5 py-0.5 rounded-full">Pending</span>
                        )}
                        <div className="flex gap-0.5">
                          {renderStars(comment.rating)}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{comment.comment_text}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          {getContentTypeIcon(comment.content_type)}
                          {getContentTypeLabel(comment.content_type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Compact */}
                  <div className="flex gap-1">
                    {isPending && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="p-1.5 bg-green-600/80 hover:bg-green-600 rounded transition"
                        title="Approve"
                      >
                        <FaCheck size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => setShowReply({...showReply, [comment.id]: !isExpanded})}
                      className="p-1.5 bg-blue-600/80 hover:bg-blue-600 rounded transition"
                      title="Reply"
                    >
                      <FaReply size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded transition"
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>

                {/* Existing Reply */}
                {hasReply && !isExpanded && (
                  <div className="ml-10 mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <span className="text-blue-400">↳ Replied:</span>
                    <span className="truncate">{comment.admin_reply}</span>
                  </div>
                )}

                {/* Reply Form - Collapsible */}
                {isExpanded && (
                  <div className="ml-10 mt-3 p-3 bg-slate-700/30 rounded-lg">
                    <textarea
                      value={replyText[comment.id] || ''}
                      onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                      placeholder="Write your reply..."
                      className="w-full bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows="2"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReply(comment.id)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs transition"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => setShowReply({...showReply, [comment.id]: false})}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="w-full py-2 text-center text-sm text-blue-400 hover:text-blue-300 transition flex items-center justify-center gap-2"
          >
            <FaChevronDown size={12} />
            Load more ({filteredComments.length - visibleCount} remaining)
          </button>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadComments}
          className="text-xs text-gray-500 hover:text-gray-400 flex items-center gap-1 transition"
        >
          <FaSync size={10} />
          Refresh
        </button>
      </div>
    </div>
  )
}