import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff, User, UserPlus, AlertCircle, CheckCircle, X } from 'lucide-react'
import GoogleSignInButton from './GoogleSignInButton'

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      const errorMsg = 'First name is required'
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }
    if (!formData.lastName.trim()) {
      const errorMsg = 'Last name is required'
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }
    if (!formData.email.trim()) {
      const errorMsg = 'Email is required'
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }
    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters long'
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match'
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`
      }

      console.log('Attempting signup with:', { email: formData.email, userData })
      const { data, error } = await signUp(formData.email, formData.password, userData)
      console.log('Signup result:', { data, error })

      if (error) {
        console.error('Signup error:', error)
        setError(error.message)
        toast.error(error.message || 'Registration failed. Please try again.')
      } else {
        const successMsg = 'Account created successfully! Please check your email to verify your account.'
        setSuccess(successMsg)
        toast.success(successMsg)

        // Show success message for 3 seconds then redirect
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      console.error('Unexpected signup error:', err)
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
              aria-label="Close signup form"
            >
              <X size={20} />
            </button>

            <div className="auth-header">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join Generatorus and start creating amazing QR codes</p>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-message">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            <div className="social-auth-section">
              <GoogleSignInButton text="Sign up with Google" />

              <div className="auth-divider">
                <span>or create account with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="input-group">
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="First name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Last name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Create a strong password"
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

              <div className="input-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                    <UserPlus size={20} />
                    Create Your Account
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
