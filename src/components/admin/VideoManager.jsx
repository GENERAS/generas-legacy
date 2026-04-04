import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaYoutube, FaVimeo, FaPlay } from 'react-icons/fa'

export default function VideoManager() {
  const [videos, setVideos] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    platform: 'youtube',
    video_id: '',
    category: 'trading',
    duration: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    loadVideos()
    
    // Test direct database connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('videos').select('count', { count: 'exact', head: true })
        console.log('Videos table test:', { count: data, error })
      } catch (err) {
        console.error('Videos table connection error:', err)
      }
    }
    testConnection()
    
    // Set up real-time subscription for videos
    const channel = supabase.channel('video-admin-changes')
    
    channel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'videos' },
        (payload) => {
          console.log('Video inserted:', payload)
          setVideos(prev => [payload.new, ...prev])
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'videos' },
        (payload) => {
          console.log('Video updated:', payload)
          setVideos(prev => prev.map(v => v.id === payload.new.id ? payload.new : v))
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'videos' },
        (payload) => {
          console.log('Video deleted:', payload)
          setVideos(prev => prev.filter(v => v.id !== payload.old.id))
        }
      )
      .subscribe((status) => {
        console.log('Video admin subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadVideos = async () => {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    setVideos(data || [])
    setLoading(false)
  }

  const extractVideoId = (url, platform) => {
    if (platform === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
      return match ? match[1] : url
    } else {
      const match = url.match(/vimeo\.com\/(\d+)/)
      return match ? match[1] : url
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('=== FORM SUBMIT ===')
    console.log('Form state:', form)
    console.log('Editing mode:', editing)
    
    if (!form.video_id || !form.title) {
      alert('Please fill in Video URL/ID and Title')
      return
    }
    
    const videoId = extractVideoId(form.video_id, form.platform)
    console.log('Extracted video ID:', videoId)
    
    const videoData = { 
      ...form, 
      video_id: videoId,
      created_at: new Date().toISOString()
    }
    console.log('Sending to database:', videoData)
    
    try {
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('videos').update(videoData).eq('id', editing)
        if (error) throw error
        alert('Video updated successfully!')
      } else {
        const { data, error } = await supabase.from('videos').insert([videoData]).select()
        console.log('Insert response:', { data, error })
        if (error) throw error
        alert('Video added successfully! Check Community page.')
      }
      resetForm()
      loadVideos()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (video) => { setEditing(video.id); setForm(video) }
  const handleDelete = async (id) => { if (confirm('Delete video?')) { await supabase.from('videos').delete().eq('id', id); loadVideos() } }
  const resetForm = () => { setEditing(null); setForm({ title: '', description: '', platform: 'youtube', video_id: '', category: 'trading', duration: 0 }) }

  const getThumbnail = (video) => {
    if (video.platform === 'youtube') {
      return `https://img.youtube.com/vi/${video.video_id}/0.jpg`
    }
    return `https://vumbnail.com/${video.video_id}.jpg`
  }

  if (loading) return <div>Loading videos...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Video Gallery Manager</h2>

      <button onClick={() => setEditing('new')} className="bg-green-600 px-4 py-2 rounded flex items-center gap-2 mb-4"><FaPlus /> Add Video</button>

      {(editing === 'new' || editing) && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg mb-6 space-y-4 border border-slate-600">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing === 'new' ? 'Add New Video' : 'Edit Video'}
          </h3>
          
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({...form, platform: 'youtube'})} className={`flex-1 p-3 rounded font-medium transition ${form.platform === 'youtube' ? 'bg-red-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
              <FaYoutube className="inline mr-2" /> YouTube
            </button>
            <button type="button" onClick={() => setForm({...form, platform: 'vimeo'})} className={`flex-1 p-3 rounded font-medium transition ${form.platform === 'vimeo' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
              <FaVimeo className="inline mr-2" /> Vimeo
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Video URL or ID *</label>
            <input 
              type="text" 
              placeholder="https://youtube.com/watch?v=... or video ID" 
              value={form.video_id} 
              onChange={e => { console.log('Video ID input:', e.target.value); setForm({...form, video_id: e.target.value}) }} 
              className="w-full bg-slate-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input 
              type="text" 
              placeholder="Video title" 
              value={form.title} 
              onChange={e => { console.log('Title input:', e.target.value); setForm({...form, title: e.target.value}) }} 
              className="w-full bg-slate-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea 
              placeholder="Video description" 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              className="w-full bg-slate-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows="3"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})} 
                className="w-full bg-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="trading">Trading</option>
                <option value="coding">Coding</option>
                <option value="vlog">Vlog</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Duration (seconds)</label>
              <input 
                type="number" 
                placeholder="e.g. 300" 
                value={form.duration || ''} 
                onChange={e => setForm({...form, duration: parseInt(e.target.value) || 0})} 
                className="w-full bg-slate-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-medium transition flex items-center justify-center gap-2">
              <FaSave /> {editing === 'new' ? 'Add Video' : 'Update Video'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-medium transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map(video => (
          <div key={video.id} className="bg-slate-800/50 rounded-lg overflow-hidden">
            <img src={getThumbnail(video)} alt={video.title} className="w-full h-40 object-cover" />
            <div className="p-3">
              <h3 className="font-bold truncate">{video.title}</h3>
              <p className="text-xs text-gray-400">{video.category}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => handleEdit(video)} className="text-blue-400"><FaEdit /></button>
                <button onClick={() => handleDelete(video.id)} className="text-red-400"><FaTrash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}