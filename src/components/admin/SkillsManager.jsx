import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaEdit, FaTrash, FaSave, FaPlus } from 'react-icons/fa'

export default function SkillsManager() {
  const [skills, setSkills] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ 
    category: 'development', 
    skill_name: '', 
    progress: 50, 
    display_order: 1 
  })

  useEffect(() => { 
    loadSkills() 
  }, [])

  const loadSkills = async () => {
    setLoading(true)
    const { data } = await supabase.from('skills').select('*').order('display_order')
    setSkills(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!form.skill_name.trim()) {
      alert('Please enter a skill name')
      return
    }

    try {
      if (editing && editing !== 'new') {
        // UPDATE existing skill
        const { error } = await supabase
          .from('skills')
          .update({
            category: form.category,
            skill_name: form.skill_name,
            progress: form.progress,
            display_order: form.display_order
          })
          .eq('id', editing)

        if (error) throw error
        alert('Skill updated successfully!')
      } else {
        // INSERT new skill
        const { error } = await supabase
          .from('skills')
          .insert([{
            category: form.category,
            skill_name: form.skill_name,
            progress: form.progress,
            display_order: form.display_order
          }])

        if (error) throw error
        alert('Skill added successfully!')
      }

      // Reset form and reload
      resetForm()
      await loadSkills()
    } catch (error) {
      console.error('Error saving skill:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (skill) => { 
    setEditing(skill.id)
    setForm({ 
      category: skill.category, 
      skill_name: skill.skill_name, 
      progress: skill.progress, 
      display_order: skill.display_order 
    })
  }

  const handleDelete = async (id) => { 
    if (confirm('Delete this skill?')) { 
      const { error } = await supabase.from('skills').delete().eq('id', id)
      if (error) {
        alert('Error deleting: ' + error.message)
      } else {
        await loadSkills()
      }
    } 
  }

  const resetForm = () => {
    setEditing(null)
    setForm({ 
      category: 'development', 
      skill_name: '', 
      progress: 50, 
      display_order: 1 
    })
  }

  if (loading) {
    return <div className="text-center py-12">Loading skills...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skills</h2>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-lg mb-6 flex gap-2 flex-wrap">
        <select 
          value={form.category} 
          onChange={e => setForm({...form, category: e.target.value})} 
          className="bg-slate-700 rounded px-3 py-2"
        >
          <option value="development">Development</option>
          <option value="trading">Trading</option>
          <option value="entrepreneurial">Entrepreneurial</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Skill Name" 
          value={form.skill_name} 
          onChange={e => setForm({...form, skill_name: e.target.value})} 
          className="bg-slate-700 rounded px-3 py-2 w-48" 
          required 
        />
        
        <input 
          type="number" 
          placeholder="Progress %" 
          value={form.progress} 
          onChange={e => setForm({...form, progress: parseInt(e.target.value)})} 
          className="bg-slate-700 rounded px-3 py-2 w-24" 
          min="0" 
          max="100"
        />
        
        <input 
          type="number" 
          placeholder="Order" 
          value={form.display_order} 
          onChange={e => setForm({...form, display_order: parseInt(e.target.value)})} 
          className="bg-slate-700 rounded px-3 py-2 w-20" 
          min="1"
        />
        
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2">
          <FaSave /> {editing ? 'Update' : 'Add'}
        </button>
        
        {editing && (
          <button 
            type="button" 
            onClick={resetForm} 
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Skills List */}
      <div className="space-y-2">
        {skills.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No skills yet. Add your first skill!</p>
        ) : (
          skills.map(skill => (
            <div key={skill.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{skill.skill_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700">
                    {skill.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{skill.progress}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(skill)} className="text-blue-400 hover:text-blue-300">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(skill.id)} className="text-red-400 hover:text-red-300">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}