import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctqqcsqakogvjfuymael.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cXFjc3Fha29ndmpmdXltYWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzE5NDEsImV4cCI6MjA5MDMwNzk0MX0.svwq7diwntl9NPMDEIuxb9xOsMBzCucHl0-oFdN9mpk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableSchema() {
  console.log('Checking projects table schema...')
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error checking schema:', error)
      return
    }
    
    if (data.length > 0) {
      console.log('✅ Projects table columns found:')
      console.log('Available columns:', Object.keys(data[0]))
    } else {
      console.log('ℹ️ Projects table is empty, but accessible')
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

async function addSampleProject() {
  console.log('Adding sample project to database...')
  
  // Try with minimal columns first
  const newProject = {
    title: 'BTC Guy Legacy Platform',
    description: 'A comprehensive personal portfolio and trading journal platform built with React and Supabase. Features real-time data synchronization between admin and public interfaces.',
    status: 'completed',
    created_at: new Date().toISOString()
  }
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
    
    if (error) {
      console.error('Error adding project:', error)
      return false
    }
    
    console.log('✅ Project added successfully!')
    console.log('Project ID:', data[0].id)
    console.log('Project Title:', data[0].title)
    return true
  } catch (err) {
    console.error('Unexpected error:', err)
    return false
  }
}

// First check schema, then add project
checkTableSchema().then(() => {
  addSampleProject().then(success => {
    if (success) {
      console.log('🎉 SUCCESS: Project added to database!')
      console.log('📱 Now visit http://localhost:5174/projects to see it live!')
    } else {
      console.log('❌ FAILED: Could not add project')
    }
  })
})
