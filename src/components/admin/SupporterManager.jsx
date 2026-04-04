import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaCrown, FaSearch, FaEdit, FaTrash, FaDownload, FaStar } from 'react-icons/fa'

export default function SupporterManager() {
  const [supporters, setSupporters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { 
    loadSupporters()
    
    // Set up real-time subscription for supporters
    const channel = supabase
      .channel('supporter-admin-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'coffee_supporters' },
        (payload) => {
          console.log('Supporters changed in admin:', payload)
          loadSupporters()
        }
      )
      .subscribe((status) => {
        console.log('Supporter admin subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadSupporters = async () => {
    const { data } = await supabase.from('coffee_supporters').select('*').order('cups', { ascending: false })
    setSupporters(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete supporter?')) {
      await supabase.from('coffee_supporters').delete().eq('id', id)
      loadSupporters()
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Cups', 'Amount', 'Level', 'Message', 'Date']
    const rows = supporters.map(s => [s.name, s.email, s.cups, s.amount, s.level, s.message, new Date(s.created_at).toLocaleDateString()])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supporters-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filtered = supporters.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))

  const getLevelBadge = (level, cups) => {
    if (cups >= 21) return <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><FaCrown /> Gold</span>
    if (cups >= 6) return <span className="bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><FaStar /> Silver</span>
    return <span className="bg-amber-800 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">☕ Bronze</span>
  }

  if (loading) return <div>Loading supporters...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Supporters</h2>
        <button onClick={exportCSV} className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"><FaDownload /> Export CSV</button>
      </div>

      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search supporters..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-700 rounded-lg pl-10 pr-4 py-2" />
      </div>

      <div className="space-y-2">
        {filtered.map(s => (
          <div key={s.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{s.name}</span>
                {getLevelBadge(s.level, s.cups)}
              </div>
              <div className="text-sm text-gray-400">{s.email}</div>
              <div className="text-sm">{s.cups} ☕ | ${s.amount}</div>
              {s.message && <div className="text-xs text-gray-400 italic mt-1">"{s.message}"</div>}
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-red-400"><FaTrash /></button>
          </div>
        ))}
      </div>
    </div>
  )
}