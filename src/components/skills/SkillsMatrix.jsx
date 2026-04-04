import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FaCode, FaChartLine, FaBriefcase } from 'react-icons/fa'

export default function SkillsMatrix() {
  const [skills, setSkills] = useState([])
  const [activeCategory, setActiveCategory] = useState('development')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const { data } = await supabase
        .from('skills')
        .select('*')
        .order('display_order')
      
      setSkills(data || [])
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'development', label: 'Development', icon: FaCode, color: 'text-blue-500' },
    { id: 'trading', label: 'Trading', icon: FaChartLine, color: 'text-green-500' },
    { id: 'entrepreneurial', label: 'Entrepreneurial', icon: FaBriefcase, color: 'text-purple-500' }
  ]

  const filteredSkills = skills.filter(skill => skill.category === activeCategory)

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🧠 Skills Matrix
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Icon />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Skills List */}
      {filteredSkills.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No skills added yet. Go to Admin Panel → Skills to add your skills.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map(skill => (
            <div key={skill.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{skill.skill_name}</span>
                <span className="text-sm text-gray-400">{skill.progress}%</span>
              </div>
              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}