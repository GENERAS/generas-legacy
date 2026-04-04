import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaUsers, FaSearch, FaTrash, FaDownload } from 'react-icons/fa'

export default function FollowerManager() {
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadFollowers()
  }, [])

  const loadFollowers = async () => {
    console.log('Loading followers...')
    const { data, error } = await supabase
      .from('followers')
      .select('*')
      .order('subscribed_at', { ascending: false })  // ← FIXED: changed from 'created_at'
    
    console.log('Fetched followers:', data)
    
    if (error) {
      console.error('Error loading followers:', error)
    } else {
      setFollowers(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this follower?')) {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('Error: ' + error.message)
      } else {
        loadFollowers()
      }
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Interests', 'Date']
    const rows = followers.map(f => [
      f.name || '',
      f.email,
      (f.interests || []).join('; '),
      new Date(f.subscribed_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `followers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filtered = followers.filter(f => 
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Loading followers...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaUsers className="text-blue-500" />
          Followers ({followers.length})
        </h2>
        <button 
          onClick={exportCSV} 
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search followers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        {filtered.map(f => (
          <div key={f.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center border border-slate-700">
            <div>
              <div className="font-semibold">{f.name || 'No name'}</div>
              <div className="text-sm text-gray-400">{f.email}</div>
              {f.interests?.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Interests: {f.interests.join(', ')}
                </div>
              )}
              <div className="text-xs text-gray-500">
                Subscribed: {new Date(f.subscribed_at).toLocaleDateString()}
              </div>
            </div>
            <button 
              onClick={() => handleDelete(f.id)} 
              className="text-red-400 hover:text-red-300 transition p-2 rounded-lg hover:bg-red-900/20"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {followers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FaUsers className="text-4xl mx-auto mb-3" />
          <p>No followers yet. Share your site to get subscribers!</p>
        </div>
      )}
    </div>
  )
}