import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { user, loading, isAdmin } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Wait for auth state to be determined
      if (loading) return

      if (user) {
        // User successfully authenticated
        toast.success(`Welcome, ${user.email}!`)
        
        // Redirect based on user role
        if (isAdmin()) {
          navigate('/admin/dashboard')
        } else {
          navigate('/customer/dashboard')
        }
      } else {
        // Authentication failed or was cancelled
        toast.error('Authentication failed. Please try again.')
        navigate('/login')
      }
    }

    // Add a small delay to ensure auth state is properly set
    const timer = setTimeout(handleAuthCallback, 1000)
    
    return () => clearTimeout(timer)
  }, [user, loading, navigate, isAdmin])

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">Completing Sign In...</h1>
              <p className="auth-subtitle">Please wait while we finish setting up your account</p>
            </div>
            
            <div className="loading-container">
              <div className="loading-spinner large"></div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem' }}>
                Processing authentication...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthCallback
