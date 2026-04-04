import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import StarRating from '../ratings/StarRating'
import { FaUser, FaTrash, FaReply, FaHeart, FaRegHeart, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

// Generate or get visitor ID from localStorage
const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitor_id')
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substring(2, 15) + Date.now()
    localStorage.setItem('visitor_id', visitorId)
  }
  return visitorId
}

// Format time like Instagram ("2h ago", "yesterday", "Apr 3")
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function CommentsSection({ contentType, contentId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [commentText, setCommentText] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState({})
  const [visibleComments, setVisibleComments] = useState(2)
  const [visibleReplies, setVisibleReplies] = useState({})
  const [visitorId] = useState(() => getVisitorId())
  const [likedComments, setLikedComments] = useState({})

  useEffect(() => {
    loadComments()
  }, [contentType, contentId])

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading comments:', error)
        setComments([])
      } else {
        const topLevel = data?.filter(c => !c.parent_id) || []
        const replies = data?.filter(c => c.parent_id) || []
        
        const threaded = topLevel.map(parent => ({
          ...parent,
          replies: replies.filter(r => r.parent_id === parent.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        
        setComments(threaded)
        
        const likes = {}
        threaded.forEach(comment => {
          const liked = localStorage.getItem(`liked_comment_${comment.id}`) === 'true'
          likes[comment.id] = liked
        })
        setLikedComments(likes)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (commentId) => {
    const isLiked = likedComments[commentId]
    const newLiked = !isLiked
    
    localStorage.setItem(`liked_comment_${commentId}`, newLiked.toString())
    setLikedComments(prev => ({ ...prev, [commentId]: newLiked }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !visitorName.trim()) {
      alert('Please enter your name and comment')
      return
    }

    setSubmitting(true)

    try {
      const commentData = {
        content_type: contentType,
        content_id: contentId,
        rating: replyTo ? null : rating,
        comment_text: commentText,
        visitor_name: visitorName,
        visitor_id: visitorId,
        is_approved: false
      }

      if (visitorEmail && visitorEmail.trim()) {
        commentData.visitor_email = visitorEmail
      }

      if (user) {
        commentData.user_id = user.id
      }

      if (replyTo) {
        commentData.parent_id = replyTo.id
      }

      const { error } = await supabase
        .from('comments')
        .insert([commentData])

      if (error) {
        console.error('Error posting comment:', error)
        alert('Error: ' + error.message)
      } else {
        alert(replyTo ? 'Reply submitted for approval!' : 'Comment submitted for approval!')
        loadComments()
        setCommentText('')
        setVisitorName('')
        setVisitorEmail('')
        setRating(5)
        setShowForm(false)
        setReplyTo(null)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error posting comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplySubmit = async (commentId, parentName) => {
    if (!replyText[commentId]?.trim()) return

    try {
      const replyData = {
        content_type: contentType,
        content_id: contentId,
        comment_text: replyText[commentId],
        visitor_name: visitorName || 'Anonymous',
        visitor_id: visitorId,
        parent_id: commentId,
        is_approved: false
      }

      if (user) {
        replyData.user_id = user.id
      }

      const { error } = await supabase
        .from('comments')
        .insert([replyData])

      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert('Reply submitted for approval!')
        setReplyText({})
        loadComments()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error posting reply')
    }
  }

  const loadMoreComments = () => {
    setVisibleComments(prev => prev + 5)
  }

  const loadMoreReplies = (commentId) => {
    setVisibleReplies(prev => ({ ...prev, [commentId]: (prev[commentId] || 2) + 3 }))
  }

  const cancelReply = () => {
    setReplyTo(null)
    setShowForm(false)
  }

  const startReply = (comment) => {
    setReplyTo(comment)
    setShowForm(true)
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Loading comments...</div>
  }

  const visibleCommentsList = comments.slice(0, visibleComments)
  const hasMoreComments = comments.length > visibleComments

  return (
    <div className="mt-4">
      <button
        onClick={() => {
          setReplyTo(null)
          setShowForm(!showForm)
        }}
        className="text-sm text-gray-400 hover:text-blue-400 transition"
      >
        {showForm ? 'Cancel' : 'Add a comment...'}
      </button>

      {showForm && (
        <div className="mt-3 mb-4">
          {replyTo && (
            <div className="mb-2 text-xs text-gray-500">
              Replying to <span className="text-blue-400">{replyTo.visitor_name}</span>
              <button onClick={cancelReply} className="ml-2 text-red-400 hover:text-red-300">Cancel</button>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Your name *"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="bg-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Your email (optional)"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className="bg-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? `Reply to ${replyTo.visitor_name}...` : "Add a comment..."}
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="2"
            />
            
            <div className="flex justify-between items-center">
              {!replyTo && (
                <StarRating rating={rating} onRate={setRating} size="text-sm" />
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 mt-3 max-h-[400px] overflow-y-auto pr-2">
        {visibleCommentsList.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>
        ) : (
          visibleCommentsList.map(comment => {
            const isOwner = comment.visitor_id === visitorId
            const isAdmin = user?.role === 'admin'
            const canDelete = isOwner || isAdmin
            const replyCount = comment.replies?.length || 0
            const visibleRepliesCount = visibleReplies[comment.id] || 2
            const visibleRepliesList = comment.replies?.slice(0, visibleRepliesCount) || []
            const hasMoreReplies = replyCount > visibleRepliesCount

            return (
              <div key={comment.id} className="bg-slate-800/30 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {comment.visitor_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{comment.visitor_name || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      {comment.rating > 0 && (
                        <StarRating rating={comment.rating} readonly size="text-xs" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className="text-gray-500 hover:text-red-500 transition"
                    >
                      {likedComments[comment.id] ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    </button>
                    {canDelete && (
                      <button
                        onClick={async () => {
                          if (confirm('Delete this comment?')) {
                            await supabase.from('comments').delete().eq('id', comment.id)
                            loadComments()
                          }
                        }}
                        className="text-gray-500 hover:text-red-500 transition text-xs"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mt-1 ml-10">{comment.comment_text}</p>

                <div className="flex items-center gap-3 mt-1 ml-10">
                  <button
                    onClick={() => startReply(comment)}
                    className="text-xs text-gray-500 hover:text-blue-400 transition"
                  >
                    Reply
                  </button>
                  {replyCount > 0 && (
                    <span className="text-xs text-gray-500">
                      {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>

                {replyCount > 0 && (
                  <div className="ml-8 mt-2 pl-3 border-l-2 border-slate-700 space-y-2">
                    {visibleRepliesList.map(reply => (
                      <div key={reply.id} className="bg-slate-700/20 rounded-lg p-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {reply.visitor_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <span className="font-semibold text-xs">{reply.visitor_name || 'Anonymous'}</span>
                              <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(reply.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-1 ml-8">{reply.comment_text}</p>
                      </div>
                    ))}
                    
                    {hasMoreReplies && (
                      <button
                        onClick={() => loadMoreReplies(comment.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition mt-1"
                      >
                        View more replies ({replyCount - visibleRepliesCount} left)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}

        {hasMoreComments && (
          <button
            onClick={loadMoreComments}
            className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2 transition"
          >
            View more comments ({comments.length - visibleComments} left)
          </button>
        )}
      </div>
    </div>
  )
}