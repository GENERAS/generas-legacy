import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaCheck, FaTimes, FaReply, FaTrash, FaStar, FaRegStar } from 'react-icons/fa'

export default function CommentModerator() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState({})

  useEffect(() => { loadComments() }, [])

  const loadComments = async () => {
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false })
    setComments(data || [])
    setLoading(false)
  }

  const handleApprove = async (id) => {
    await supabase.from('comments').update({ is_approved: true }).eq('id', id)
    loadComments()
  }

  const handleDelete = async (id) => {
    if (confirm('Delete comment?')) {
      await supabase.from('comments').delete().eq('id', id)
      loadComments()
    }
  }

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return
    await supabase.from('comments').update({ admin_reply: replyText[id] }).eq('id', id)
    setReplyText({})
    loadComments()
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? <FaStar key={i} className="text-amber-500" /> : <FaRegStar key={i} className="text-amber-500" />)
    }
    return stars
  }

  if (loading) return <div>Loading comments...</div>

  const pending = comments.filter(c => !c.is_approved)
  const approved = comments.filter(c => c.is_approved)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comment Moderator</h2>

      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Pending Approval ({pending.length})</h3>
          {pending.map(c => (
            <div key={c.id} className="bg-slate-800/50 rounded-lg p-3 mb-3">
              <div className="flex justify-between">
                <div>
                  <span className="font-bold">{c.visitor_name}</span>
                  <div className="flex gap-1 text-sm">{renderStars(c.rating)}</div>
                  <p className="text-gray-300 mt-1">{c.comment_text}</p>
                  <div className="text-xs text-gray-500 mt-1">On: {c.content_type} #{c.content_id}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(c.id)} className="bg-green-600 p-2 rounded"><FaCheck /></button>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-600 p-2 rounded"><FaTrash /></button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" value={replyText[c.id] || ''} onChange={e => setReplyText({...replyText, [c.id]: e.target.value})} placeholder="Write a reply..." className="flex-1 bg-slate-700 rounded px-3 py-1 text-sm" />
                <button onClick={() => handleReply(c.id)} className="bg-blue-600 px-3 py-1 rounded text-sm"><FaReply /> Reply</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-green-400 mb-3">Approved Comments</h3>
        {approved.map(c => (
          <div key={c.id} className="bg-slate-800/30 rounded-lg p-3 mb-2">
            <div className="flex justify-between">
              <div>
                <span className="font-bold">{c.visitor_name}</span>
                <div className="flex gap-1 text-sm">{renderStars(c.rating)}</div>
                <p className="text-gray-300">{c.comment_text}</p>
                {c.admin_reply && <div className="mt-2 pl-3 border-l-2 border-blue-500"><p className="text-sm text-blue-400">Admin: {c.admin_reply}</p></div>}
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-red-400"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}