import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, authHelpers } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  useEffect(() => {
    // Get initial session immediately
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        setLoading(false)
        setInitialCheckDone(true)
      }
    }

    // Reduce loading time to minimum
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
      setInitialCheckDone(true)
    }, 200) // Reduced to 200ms for faster loading

    getInitialSession().then(() => {
      clearTimeout(loadingTimeout)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setInitialCheckDone(true)
      }
    )

    return () => {
      subscription?.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  // Sign up function
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const result = await authHelpers.signUp(email, password, userData)
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const result = await authHelpers.signIn(email, password)
      return result
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      const result = await authHelpers.signOut()
      return result
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth sign in function
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await authHelpers.signInWithGoogle()
      return result
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Check if user is admin
  const isAdmin = () => {
    return authHelpers.isAdmin(user)
  }

  // Get user role
  const getUserRole = () => {
    return authHelpers.getUserRole(user)
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })
      return { data, error }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    initialCheckDone,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    isAdmin,
    getUserRole,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
