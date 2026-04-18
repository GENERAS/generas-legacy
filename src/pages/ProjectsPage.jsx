import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Force scroll to top on mount
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])
}

import { 
  FaGithub, FaExternalLinkAlt, FaCode, FaEye, FaCalendar, 
  FaReact, FaNodeJs, FaDatabase, FaCss3Alt, FaHtml5,
  FaJs, FaPython, FaJava, FaPhp, FaSwift, FaDocker,
  FaAws, FaVuejs, FaAngular,
  FaFigma, FaFigma as FaSketch, FaServer, FaCloud,
  FaMobileAlt, FaDesktop, FaGlobe, FaShieldAlt
} from 'react-icons/fa'
import { 
  SiTailwindcss, SiSupabase, SiTypescript, SiNextdotjs,
  SiMongodb, SiPostgresql, SiGraphql, SiRedux,
  SiJest, SiWebpack, SiNginx, SiLinux,
  SiFlutter, SiFirebase
} from 'react-icons/si'
import CommentsSection from '../components/comments/CommentsSection'

// Tech stack icon mapping
const getTechIcon = (tech) => {
  const techLower = tech.toLowerCase()
  
  // React ecosystem
  if (techLower.includes('react')) return <FaReact className="text-cyan-400" />
  if (techLower.includes('next')) return <SiNextdotjs className="text-white" />
  if (techLower.includes('vue')) return <FaVuejs className="text-green-500" />
  if (techLower.includes('angular')) return <FaAngular className="text-red-500" />
  
  // JavaScript/TypeScript
  if (techLower.includes('javascript') || techLower === 'js') return <FaJs className="text-yellow-400" />
  if (techLower.includes('typescript') || techLower === 'ts') return <SiTypescript className="text-blue-500" />
  
  // CSS/Frontend
  if (techLower.includes('tailwind')) return <SiTailwindcss className="text-cyan-400" />
  if (techLower.includes('css')) return <FaCss3Alt className="text-blue-500" />
  if (techLower.includes('html')) return <FaHtml5 className="text-orange-500" />
  
  // Backend
  if (techLower.includes('node')) return <FaNodeJs className="text-green-600" />
  if (techLower.includes('python')) return <FaPython className="text-blue-400" />
  if (techLower.includes('java')) return <FaJava className="text-red-600" />
  if (techLower.includes('php')) return <FaPhp className="text-purple-500" />
  if (techLower.includes('swift')) return <FaSwift className="text-orange-500" />
  
  // Database
  if (techLower.includes('mysql') || techLower.includes('postgres')) return <FaDatabase className="text-blue-400" />
  if (techLower.includes('mongodb')) return <SiMongodb className="text-green-600" />
  if (techLower.includes('supabase')) return <SiSupabase className="text-green-500" />
  if (techLower.includes('firebase')) return <SiFirebase className="text-yellow-500" />
  
  // Mobile
  if (techLower.includes('flutter')) return <SiFlutter className="text-blue-400" />
  if (techLower.includes('react native')) return <FaReact className="text-cyan-400" />
  if (techLower.includes('mobile')) return <FaMobileAlt className="text-gray-400" />
  
  // DevOps/Cloud
  if (techLower.includes('docker')) return <FaDocker className="text-blue-500" />
  if (techLower.includes('aws')) return <FaAws className="text-yellow-500" />
  if (techLower.includes('nginx')) return <SiNginx className="text-green-600" />
  if (techLower.includes('linux')) return <SiLinux className="text-white" />
  
  // Design
  if (techLower.includes('figma')) return <FaFigma className="text-purple-500" />
  
  // Default
  return <FaCode className="text-gray-400" />
}

// Get color class for tech badge
const getTechColor = (tech) => {
  const techLower = tech.toLowerCase()
  
  if (techLower.includes('react')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  if (techLower.includes('next')) return 'bg-white/10 text-white border-white/20'
  if (techLower.includes('tailwind')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  if (techLower.includes('node')) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (techLower.includes('python')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (techLower.includes('database') || techLower.includes('sql')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (techLower.includes('mongodb')) return 'bg-green-600/20 text-green-400 border-green-600/30'
  if (techLower.includes('flutter')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (techLower.includes('docker')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (techLower.includes('aws')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  
  return 'bg-slate-700/50 text-gray-300 border-slate-600'
}

export default function ProjectsPage() {
  useScrollToTop() // Force scroll to top on page load

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadProjects()
    
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        () => loadProjects()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('display_order')
      
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(projects.map(p => p.category))]

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory)

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-green-600', text: 'Completed', icon: '✓' },
      building: { bg: 'bg-amber-600', text: 'In Progress', icon: '🚧' },
      planned: { bg: 'bg-blue-600', text: 'Planned', icon: '📅' }
    }
    const s = badges[status] || badges.planned
    return (
      <span className={`${s.bg} text-white text-xs px-3 py-1 rounded-full flex items-center gap-1`}>
        <span>{s.icon}</span> {s.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Project Portfolio
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          A showcase of my work - web applications, mobile apps, and blockchain projects
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-sm">💻 24 Projects</span>
          <span className="px-3 py-1 bg-slate-800 rounded-full text-sm">🚀 12 Live Demos</span>
          <span className="px-3 py-1 bg-slate-800 rounded-full text-sm">⭐ 15+ Tech Stack</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
            }`}
          >
            {cat === 'all' ? '✨ All Projects' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map(project => (
          <div 
            key={project.id} 
            className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
          >
            {/* Image Section with Overlay */}
            <div className="relative overflow-hidden">
              {project.image_url ? (
                <>
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                  <FaCode className="text-5xl text-gray-600 group-hover:text-blue-500 transition-colors duration-500" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {getStatusBadge(project.status)}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors duration-300">
                {project.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {project.description}
              </p>
              
              {/* Tech Stack - VISUAL BADGES WITH ICONS */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Technologies Used</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, i) => {
                      const Icon = getTechIcon(tech)
                      const colorClass = getTechColor(tech)
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} transition-all hover:scale-105`}
                        >
                          {Icon}
                          <span>{tech}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-4 mb-4 pt-2">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 group/link"
                  >
                    <FaGithub className="text-lg group-hover/link:scale-110 transition-transform" />
                    <span>GitHub</span>
                  </a>
                )}
                {project.live_demo_url && (
                  <a
                    href={project.live_demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 group/link"
                  >
                    <FaExternalLinkAlt className="text-lg group-hover/link:scale-110 transition-transform" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
              
              {/* Divider */}
              <div className="border-t border-slate-700 my-4"></div>
              
              {/* Comments Section */}
              <CommentsSection contentType="project" contentId={project.id} />
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FaCode className="text-5xl mx-auto mb-4 opacity-50" />
          <p className="text-lg">No projects found in this category.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-4 text-blue-400 hover:text-blue-300 transition"
          >
            View all projects →
          </button>
        </div>
      )}
    </div>
  )
}