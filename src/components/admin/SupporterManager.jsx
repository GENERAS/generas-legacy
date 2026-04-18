import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FaCrown, FaSearch, FaEdit, FaTrash, FaDownload, FaStar, 
  FaCheckCircle, FaClock, FaEye, FaImage, FaTimes 
} from 'react-icons/fa'

export default function SupporterManager() {
  const [supporters, setSupporters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedSupporter, setSelectedSupporter] = useState(null)
  const [verifyingId, setVerifyingId] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

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
    const { data } = await supabase.from('coffee_supporters').select('*').order('submitted_at', { ascending: false })
    setSupporters(data || [])
    setLoading(false)
  }

  const verifySupporter = async (id, currentCups) => {
    if (!confirm('Verify this payment and approve supporter?')) return
    
    setVerifyingId(id)
    try {
      const { error } = await supabase
        .from('coffee_supporters')
        .update({
          payment_status: 'verified',
          verified_at: new Date().toISOString(),
          cups: currentCups,
          amount: currentCups * 1,
          show_in_hall: true,
          level: currentCups >= 21 ? 'gold' : currentCups >= 6 ? 'silver' : 'bronze'
        })
        .eq('id', id)
      
      if (error) throw error
      loadSupporters()
    } catch (err) {
      alert('Error verifying: ' + err.message)
    } finally {
      setVerifyingId(null)
    }
  }

  const rejectSupporter = async (id) => {
    if (!confirm('Reject this supporter payment?')) return
    
    try {
      const { error } = await supabase
        .from('coffee_supporters')
        .update({
          payment_status: 'failed',
          show_in_hall: false
        })
        .eq('id', id)
      
      if (error) throw error
      loadSupporters()
    } catch (err) {
      alert('Error rejecting: ' + err.message)
    }
  }

  const updateAdminNotes = async (id) => {
    try {
      const { error } = await supabase
        .from('coffee_supporters')
        .update({ admin_notes: adminNotes })
        .eq('id', id)
      
      if (error) throw error
      alert('Notes saved!')
      setSelectedSupporter(null)
    } catch (err) {
      alert('Error saving notes: ' + err.message)
    }
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

  const filtered = supporters.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || 
                         s.email?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && s.payment_status !== 'verified') ||
                         (filter === 'verified' && s.payment_status === 'verified')
    return matchesSearch && matchesFilter
  })

  const getLevelBadge = (level, cups) => {
    if (cups >= 21) return <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><FaCrown /> Gold</span>
    if (cups >= 6) return <span className="bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><FaStar /> Silver</span>
    return <span className="bg-amber-800 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">☕ Bronze</span>
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified': return <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><FaCheckCircle /> Verified</span>
      case 'awaiting_verification': return <span className="bg-yellow-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><FaClock /> Pending</span>
      default: return <span className="bg-gray-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><FaClock /> Pending</span>
    }
  }

  if (loading) return <div>Loading supporters...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Supporters</h2>
        <button onClick={exportCSV} className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"><FaDownload /> Export CSV</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{supporters.filter(s => s.payment_status === 'verified').length}</p>
          <p className="text-sm text-gray-400">Verified</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-500">{supporters.filter(s => s.payment_status !== 'verified').length}</p>
          <p className="text-sm text-gray-400">Pending</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">${supporters.reduce((sum, s) => sum + (s.amount || 0), 0)}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-gray-300'}`}
        >
          Pending ({supporters.filter(s => s.payment_status !== 'verified').length})
        </button>
        <button 
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'verified' ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-300'}`}
        >
          Verified
        </button>
      </div>

      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search supporters..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-700 rounded-lg pl-10 pr-4 py-2" />
      </div>

      <div className="space-y-2">
        {filtered.map(s => (
          <div key={s.id} className={`rounded-lg p-3 ${s.payment_status === 'verified' ? 'bg-slate-800/50' : 'bg-yellow-900/20 border border-yellow-600/30'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{s.name}</span>
                  {getLevelBadge(s.level, s.cups)}
                  {getStatusBadge(s.payment_status)}
                </div>
                <div className="text-sm text-gray-400">{s.email}</div>
                <div className="text-sm text-gray-300">{s.cups} ☕ | ${s.amount} | Ref: {s.payment_reference || 'N/A'}</div>
                {s.sender_phone && <div className="text-xs text-gray-500">From: {s.sender_phone}</div>}
                {/* Social Links */}
                {(s.instagram || s.twitter || s.facebook || s.linkedin || s.website || s.phone) && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {s.instagram && <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded">IG: {s.instagram}</span>}
                    {s.twitter && <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-0.5 rounded">TW: {s.twitter}</span>}
                    {s.facebook && <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">FB: {s.facebook}</span>}
                    {s.linkedin && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">LI: {s.linkedin}</span>}
                    {s.website && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Web</span>}
                    {s.phone && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">📞 {s.phone}</span>}
                  </div>
                )}
                {s.message && (
                  <div className="mt-2 p-2 bg-slate-700/50 rounded text-sm">
                    <span className="text-gray-400">Message:</span>
                    <span className="text-gray-300 italic ml-2">"{s.message}"</span>
                  </div>
                )}
                {s.admin_notes && (
                  <div className="mt-1 text-xs text-amber-400">
                    Admin: {s.admin_notes}
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-start">
                {s.payment_status !== 'verified' && (
                  <>
                    <button 
                      onClick={() => verifySupporter(s.id, s.cups)}
                      disabled={verifyingId === s.id}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <FaCheckCircle /> {verifyingId === s.id ? '...' : 'Verify'}
                    </button>
                    <button 
                      onClick={() => rejectSupporter(s.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                {s.payment_screenshot_url && (
                  <a 
                    href={s.payment_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <FaImage />
                  </a>
                )}
                <button 
                  onClick={() => {setSelectedSupporter(s); setAdminNotes(s.admin_notes || '')}}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Notes Modal */}
      {selectedSupporter && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Admin Notes - {selectedSupporter.name}</h3>
              <button onClick={() => setSelectedSupporter(null)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add private admin notes here..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mb-4"
              rows="4"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedSupporter(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateAdminNotes(selectedSupporter.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}