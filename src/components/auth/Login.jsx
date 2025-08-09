import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, X } from 'lucide-react'
import GoogleSignInButton from './GoogleSignInButton'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()



  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        toast.error(error.message || 'Login failed. Please try again.')
      } else if (data?.user) {
        // Success toast
        toast.success(`Welcome back, ${data.user.email}!`)

        // Check if user is admin
        const isAdmin = data.user.email === 'rubel820746@gmail.com' ||
                        data.user.user_metadata?.role === 'admin'

        // Redirect based on role
        if (isAdmin) {
          navigate('/admin/dashboard')
        } else {
          navigate('/customer/dashboard')
        }
      } else {
        const errorMsg = 'Login failed - no user data received'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <button
              className="auth-close-btn"
              onClick={() => navigate('/')}
              aria-label="Close login form"
            >
              <X size={20} />
            </button>

            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Sign in to your Generatorus account</p>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="social-auth-section">
              <GoogleSignInButton text="Sign in with Google" />

              <div className="auth-divider">
                <span>or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modern-input"
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="modern-input"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="modern-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p className="auth-footer-text">
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
