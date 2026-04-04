import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { FaComment, FaStar, FaHeart, FaUser, FaAward } from 'react-icons/fa'
import StarRating from '../components/ratings/StarRating'
import Layout from '../components/common/Layout'

export default function UserDashboard() {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserActivity()
    }
  }, [user])

  const loadUserActivity = async () => {
    try {
      const [commentsRes, likesRes] = await Promise.all([
        supabase
          .from('comments')
          .select('*')
          .eq('visitor_email', user.email)
          .order('created_at', { ascending: false }),
        supabase
          .from('certificate_likes')
          .select('*, certificates(*)')
          .eq('user_id', user.id)
      ])

      setComments(commentsRes.data || [])
      setLikes(likesRes.data || [])
    } catch (error) {
      console.error('Error loading user activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to view your dashboard</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
            Sign In →
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            My Dashboard
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Welcome back, {profile?.full_name || user.email?.split('@')[0]}! Track your activity and engagement.
          </p>
        </div>

        {/* Stats Grid - Like Homepage */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700 hover:border-blue-500/50 transition">
            <FaComment className="text-3xl text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold">{comments.length}</div>
            <div className="text-sm text-gray-400 mt-1">Comments Posted</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700 hover:border-amber-500/50 transition">
            <FaStar className="text-3xl text-amber-500 mx-auto mb-3" />
            <div className="text-3xl font-bold">{comments.filter(c => c.rating).length}</div>
            <div className="text-sm text-gray-400 mt-1">Ratings Given</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700 hover:border-red-500/50 transition">
            <FaHeart className="text-3xl text-red-500 mx-auto mb-3" />
            <div className="text-3xl font-bold">{likes.length}</div>
            <div className="text-sm text-gray-400 mt-1">Likes Given</div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Comments */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaComment className="text-blue-500" />
              My Comments
            </h2>
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No comments yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-300">{comment.comment_text}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        On {comment.content_type} #{comment.content_id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {comment.rating > 0 && (
                      <div className="mt-2">
                        <StarRating rating={comment.rating} readonly size="text-sm" />
                      </div>
                    )}
                    {comment.admin_reply && (
                      <div className="mt-3 pl-3 border-l-2 border-blue-500">
                        <p className="text-sm text-blue-400">Admin replied:</p>
                        <p className="text-sm text-gray-400">{comment.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Likes */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaHeart className="text-red-500" />
              My Likes
            </h2>
            {likes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No likes yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {likes.map(like => (
                  <div key={like.id} className="bg-slate-700/30 rounded-lg p-4 flex items-center gap-3">
                    <FaAward className="text-amber-500 text-xl" />
                    <div>
                      <p className="font-medium">{like.certificates?.title || 'Certificate'}</p>
                      <p className="text-xs text-gray-500">
                        Liked on {new Date(like.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}