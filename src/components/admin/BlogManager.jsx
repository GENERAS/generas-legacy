import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'

export default function BlogManager() {
  const [posts, setPosts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', category: 'trading', status: 'published' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const data = { ...form, slug, updated_at: new Date() }
    if (editing) {
      await supabase.from('blog_posts').update(data).eq('id', editing)
      alert('Post updated')
    } else {
      await supabase.from('blog_posts').insert([data])
      alert('Post created')
    }
    resetForm()
    loadPosts()
  }

  const handleEdit = (post) => { setEditing(post.id); setForm(post) }
  const handleDelete = async (id) => { if (confirm('Delete?')) { await supabase.from('blog_posts').delete().eq('id', id); loadPosts() } }
  const resetForm = () => { setEditing(null); setForm({ title: '', slug: '', content: '', excerpt: '', category: 'trading', status: 'published' }) }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Blog Posts</h2>
      <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-lg mb-6 space-y-3">
        <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2" required />
        <input type="text" placeholder="Slug (auto from title)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2" />
        <textarea placeholder="Excerpt" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2" rows="2"></textarea>
        <textarea placeholder="Content (HTML supported)" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2" rows="6"></textarea>
        <div className="flex gap-3">
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-slate-700 rounded px-3 py-2">
            <option value="trading">Trading</option><option value="coding">Coding</option><option value="personal">Personal</option><option value="business">Business</option>
          </select>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="bg-slate-700 rounded px-3 py-2">
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded"><FaSave /> {editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="space-y-2">
        {posts.map(post => (
          <div key={post.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center">
            <div><span className="font-bold">{post.title}</span> – {post.status} <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span></div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(post)} className="text-blue-400"><FaEdit /></button>
              <button onClick={() => handleDelete(post.id)} className="text-red-400"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}