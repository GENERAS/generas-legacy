import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

export default function LikeButton({ contentType, contentId, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check localStorage to see if user already liked this item
  useEffect(() => {
    const storageKey = `${contentType}_${contentId}_liked` 
    const hasLiked = localStorage.getItem(storageKey) === 'true'
    setLiked(hasLiked)
  }, [contentType, contentId])

  const handleLike = async () => {
    if (loading) return
    setLoading(true)

    try {
      const tableName = contentType === 'certificate' ? 'certificates' : 'photos'
      const storageKey = `${contentType}_${contentId}_liked` 
      const newLikeCount = liked ? Math.max(0, likes - 1) : likes + 1
      
      // Update database - direct UPDATE, no SQL functions needed
      const { error } = await supabase
        .from(tableName)
        .update({ likes: newLikeCount })
        .eq('id', contentId)

      if (!error) {
        setLikes(newLikeCount)
        setLiked(!liked)
        localStorage.setItem(storageKey, (!liked).toString())
      } else {
        console.error('Database error (ignored):', error)
        // Still update UI even if DB fails
        setLikes(newLikeCount)
        setLiked(!liked)
        localStorage.setItem(storageKey, (!liked).toString())
      }
    } catch (error) {
      console.error('Error (ignored):', error)
      // Still update UI even if DB fails
      const newLikeCount = liked ? Math.max(0, likes - 1) : likes + 1
      setLikes(newLikeCount)
      setLiked(!liked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 transition ${
        liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {liked ? <FaHeart /> : <FaRegHeart />}
      <span>{likes}</span>
    </button>
  )
}