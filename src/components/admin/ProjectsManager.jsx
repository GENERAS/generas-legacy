import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGithub, FaExternalLinkAlt } from 'react-icons/fa'

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '',
    category: 'web',
    description: '',
    github_url: '',
    live_demo_url: '',
    tech_stack: [],
    image_url: '',
    status: 'building',
    display_order: 1
  })
  const [techInput, setTechInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadProjects() }, [])

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('display_order')
    setProjects(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const projectData = { ...form, tech_stack: form.tech_stack.filter(t => t.trim() !== '') }
    if (editing) {
      await supabase.from('projects').update(projectData).eq('id', editing)
      alert('Project updated')
    } else {
      await supabase.from('projects').insert([projectData])
      alert('Project added')
    }
    resetForm()
    loadProjects()
  }

  const handleEdit = (project) => {
    setEditing(project.id)
    setForm(project)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      await supabase.from('projects').delete().eq('id', id)
      loadProjects()
    }
  }

  const addTech = () => {
    if (techInput.trim() && !form.tech_stack.includes(techInput.trim())) {
      setForm({ ...form, tech_stack: [...form.tech_stack, techInput.trim()] })
      setTechInput('')
    }
  }

  const removeTech = (tech) => {
    setForm({ ...form, tech_stack: form.tech_stack.filter(t => t !== tech) })
  }

  const resetForm = () => {
    setEditing(null)
    setForm({
      title: '',
      category: 'web',
      description: '',
      github_url: '',
      live_demo_url: '',
      tech_stack: [],
      image_url: '',
      status: 'building',
      display_order: 1
    })
    setTechInput('')
  }

  const getStatusBadge = (status) => {
    const badges = { completed: 'bg-green-900', building: 'bg-amber-900', planned: 'bg-blue-900' }
    return `px-2 py-0.5 rounded-full text-xs ${badges[status] || 'bg-gray-900'}`
  }

  if (loading) return <div className="text-center py-8">Loading projects...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Projects Manager</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-lg mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Project Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-slate-700 rounded px-3 py-2" required />
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-slate-700 rounded px-3 py-2">
            <option value="web">Web Application</option><option value="mobile">Mobile App</option><option value="blockchain">Blockchain</option><option value="other">Other</option>
          </select>
        </div>

        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2" rows="3" required />

        <div className="grid grid-cols-2 gap-3">
          <input type="url" placeholder="GitHub URL" value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} className="bg-slate-700 rounded px-3 py-2" />
          <input type="url" placeholder="Live Demo URL" value={form.live_demo_url} onChange={e => setForm({...form, live_demo_url: e.target.value})} className="bg-slate-700 rounded px-3 py-2" />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="text-sm text-gray-400">Tech Stack</label>
          <div className="flex gap-2 mt-1">
            <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTech())} placeholder="Add technology (React, Tailwind, etc.)" className="flex-1 bg-slate-700 rounded px-3 py-2" />
            <button type="button" onClick={addTech} className="bg-blue-600 px-4 py-2 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.tech_stack.map(tech => (
              <span key={tech} className="bg-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {tech} <button type="button" onClick={() => removeTech(tech)} className="text-red-400">×</button>
              </span>
            ))}
          </div>
        </div>

        <input type="url" placeholder="Image URL (screenshot)" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2" />

        <div className="grid grid-cols-2 gap-3">
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="bg-slate-700 rounded px-3 py-2">
            <option value="building">🚧 Building</option><option value="completed">✓ Completed</option><option value="planned">📅 Planned</option>
          </select>
          <input type="number" placeholder="Display Order" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value)})} className="bg-slate-700 rounded px-3 py-2" />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2"><FaSave /> {editing ? 'Update' : 'Add Project'}</button>
          {editing && <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      {/* Projects List */}
      <div className="space-y-2">
        {projects.map(project => (
          <div key={project.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center">
            <div>
              <span className="font-bold">{project.title}</span>
              <span className={`ml-2 ${getStatusBadge(project.status)}`}>{project.status}</span>
              <div className="text-xs text-gray-400 mt-1">{project.tech_stack?.join(', ') || 'No tech stack'}</div>
              <div className="flex gap-3 mt-1">
                {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white"><FaGithub className="inline mr-1" /> GitHub</a>}
                {project.live_demo_url && <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white"><FaExternalLinkAlt className="inline mr-1" /> Demo</a>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(project)} className="text-blue-400"><FaEdit /></button>
              <button onClick={() => handleDelete(project.id)} className="text-red-400"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}