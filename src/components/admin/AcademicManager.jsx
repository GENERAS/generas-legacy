import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload } from 'react-icons/fa'

export default function AcademicManager() {
  const [levels, setLevels] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ level_name: '', school_name: '', start_year: '', end_year: '', status: 'planned', description: '', display_order: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLevels() }, [])

  const loadLevels = async () => {
    const { data } = await supabase.from('academic_levels').select('*').order('display_order')
    setLevels(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await supabase.from('academic_levels').update(form).eq('id', editing)
      alert('Level updated')
    } else {
      await supabase.from('academic_levels').insert([form])
      alert('Level added')
    }
    resetForm()
    loadLevels()
  }

  const handleEdit = (level) => {
    setEditing(level.id)
    setForm(level)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this level?')) {
      await supabase.from('academic_levels').delete().eq('id', id)
      loadLevels()
    }
  }

  const resetForm = () => {
    setEditing(null)
    setForm({ level_name: '', school_name: '', start_year: '', end_year: '', status: 'planned', description: '', display_order: 1 })
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Academic Levels</h2>
      <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-lg mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Level Name" value={form.level_name} onChange={e => setForm({...form, level_name: e.target.value})} className="bg-slate-700 rounded px-3 py-2" required />
          <input type="text" placeholder="School Name" value={form.school_name} onChange={e => setForm({...form, school_name: e.target.value})} className="bg-slate-700 rounded px-3 py-2" required />
          <input type="text" placeholder="Start Year" value={form.start_year} onChange={e => setForm({...form, start_year: e.target.value})} className="bg-slate-700 rounded px-3 py-2" />
          <input type="text" placeholder="End Year" value={form.end_year} onChange={e => setForm({...form, end_year: e.target.value})} className="bg-slate-700 rounded px-3 py-2" />
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="bg-slate-700 rounded px-3 py-2">
            <option value="completed">Completed</option><option value="building">Building</option><option value="planned">Planned</option>
          </select>
          <input type="number" placeholder="Display Order" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value)})} className="bg-slate-700 rounded px-3 py-2" />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2" rows="2"></textarea>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2"><FaSave /> {editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="space-y-2">
        {levels.map(level => (
          <div key={level.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center">
            <div><span className="font-bold">{level.level_name}</span> – {level.school_name} ({level.start_year}-{level.end_year}) <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{level.status}</span></div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(level)} className="text-blue-400"><FaEdit /></button>
              <button onClick={() => handleDelete(level.id)} className="text-red-400"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}