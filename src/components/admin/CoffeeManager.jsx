import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaCoffee } from 'react-icons/fa'

export default function CoffeeManager() {
  const [supporters, setSupporters] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    cups: 1, 
    message: '', 
    show_in_hall: true 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    loadSupporters()
  }, [])

  const loadSupporters = async () => {
    const { data, error } = await supabase
      .from('coffee_supporters')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error loading supporters:', error)
    } else {
      setSupporters(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editing && editing !== 'new') {
        const { error } = await supabase
          .from('coffee_supporters')
          .update(form)
          .eq('id', editing)
        if (error) throw error
        alert('Supporter updated!')
      } else {
        const { error } = await supabase
          .from('coffee_supporters')
          .insert([{ ...form, created_at: new Date().toISOString() }])
        if (error) throw error
        alert('Supporter added!')
      }
      resetForm()
      loadSupporters()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (supporter) => {
    setEditing(supporter.id)
    setForm(supporter)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this supporter?')) return
    
    try {
      const { error } = await supabase
        .from('coffee_supporters')
        .delete()
        .eq('id', id)
      if (error) throw error
      loadSupporters()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', email: '', cups: 1, message: '', show_in_hall: true })
  }

  if (loading) return <div>Loading supporters...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Coffee Supporters Manager</h2>

      <button 
        onClick={() => setEditing('new')} 
        className="bg-green-600 px-4 py-2 rounded flex items-center gap-2 mb-4"
      >
        <FaPlus /> Add Supporter
      </button>

      {/* Form */}
      {(editing === 'new' || editing) && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg mb-6 space-y-4 border border-slate-600">
          <h3 className="text-xl font-bold">
            {editing === 'new' ? 'Add New Supporter' : 'Edit Supporter'}
          </h3>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="w-full bg-slate-700 rounded px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              className="w-full bg-slate-700 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Cups of Coffee</label>
            <input 
              type="number" 
              min="1"
              value={form.cups} 
              onChange={e => setForm({...form, cups: parseInt(e.target.value)})} 
              className="w-full bg-slate-700 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Message</label>
            <textarea 
              value={form.message} 
              onChange={e => setForm({...form, message: e.target.value})} 
              className="w-full bg-slate-700 rounded px-4 py-2"
              rows="2"
            />
          </div>

          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={form.show_in_hall} 
              onChange={e => setForm({...form, show_in_hall: e.target.checked})}
            />
            Show in Supporters Hall
          </label>

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2">
              <FaSave /> {editing === 'new' ? 'Add' : 'Update'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid gap-4">
        {supporters.map(supporter => (
          <div key={supporter.id} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCoffee className="text-amber-500 text-2xl" />
              <div>
                <h3 className="font-bold">{supporter.name}</h3>
                <p className="text-sm text-gray-400">{supporter.cups} cups • {supporter.email || 'No email'}</p>
                {supporter.message && <p className="text-sm text-gray-500 italic">"{supporter.message}"</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(supporter)} className="bg-blue-600 p-2 rounded">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(supporter.id)} className="bg-red-600 p-2 rounded">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
        {supporters.length === 0 && (
          <p className="text-gray-400 text-center py-8">No supporters yet</p>
        )}
      </div>
    </div>
  )
}
