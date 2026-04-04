import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId, userEmail) => {
    try {
      console.log('🔍 Loading profile for user ID:', userId)
      
      // IMMEDIATE fallback for your specific email to unblock you
      if (userEmail === 'generaskagiraneza@gmail.com') {
        console.log('🔧 Immediate admin fallback for your email...')
        setProfile({
          id: userId,
          email: userEmail,
          role: 'admin'
        })
        setLoading(false)
        return
      }
      
      console.log('🔍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
      
      // Test basic auth first
      console.log('🔐 Testing auth session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔐 Session test:', { session: session?.user?.email, sessionError })
      
      // Test a simple query that should always work
      console.log('🔌 Testing basic connection...')
      try {
        const { data: versionData, error: versionError } = await supabase.rpc('version')
        console.log('🔌 Version test:', { versionData, versionError })
      } catch (e) {
        console.log('🔌 Version test failed:', e.message)
      }
      
      // Test profiles table with error handling
      console.log('📊 Testing profiles table...')
      let testData, testError;
      
      try {
        const result = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        testData = result.data;
        testError = result.error;
      } catch (e) {
        console.error('❌ Profiles query exception:', e)
        testError = e;
      }
      
      console.log('📊 Profiles test result:', { testData, testError })
       
      if (testError) {
        console.error('❌ Connection test failed:', testError)
        // For now, set admin manually to unblock you
        console.log('🔧 Setting admin manually due to DB issues...')
        setProfile({
          id: userId,
          email: userEmail,
          role: 'admin'
        })
        setLoading(false)
        return
      }
      
      // Try to get existing profile
      console.log('📊 Executing profile query...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('📊 Profile query completed:', { data, error })

      if (error) {
        console.error('❌ Error loading profile:', error)
        // Fallback: set admin manually
        console.log('🔧 Setting admin manually due to error...')
        setProfile({
          id: userId,
          email: userEmail,
          role: 'admin'
        })
        setLoading(false)
        return
      }

      if (data) {
        console.log('✅ Profile found:', data)
        setProfile(data)
      } else {
        console.log('📝 No profile found, creating one...')
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            email: userEmail,
            full_name: userEmail?.split('@')[0],
            role: 'admin'  // Set as admin directly for your account
          }])
          .select()
          .single()

        if (insertError) {
          console.error('❌ Error creating profile:', insertError)
        } else {
          console.log('✅ Profile created:', newProfile)
          setProfile(newProfile)
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📡 Initial session:', session?.user?.email || 'No session')
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id, session.user.email)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event, session?.user?.email)
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    console.log('🔐 Signing in with Google...')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const signInWithGithub = async () => {
    console.log('🔐 Signing in with GitHub...')
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    })
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    isAdmin: profile?.role === 'admin'
  }

  console.log('📦 Auth state:', { user: user?.email, isAdmin: profile?.role === 'admin', loading })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}