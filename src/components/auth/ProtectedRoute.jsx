import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, Lock } from 'lucide-react'
import './ProtectedRoute.css'

const ProtectedRoute = ({ children, requireAdmin = false, requireAuth = true }) => {
  const { user, loading, isAdmin, initialCheckDone } = useAuth()
  const location = useLocation()

  // Show minimal loading only during initial auth check
  if (loading && !initialCheckDone) {
    return (
      <div className="auth-loading-minimal">
        <div className="loading-spinner-small"></div>
      </div>
    )
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="access-denied">
        <div className="container">
          <div className="access-denied-content">
            <div className="access-denied-icon">
              <Shield size={64} />
            </div>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            <p>Admin privileges are required.</p>
            <div className="access-denied-actions">
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-secondary"
              >
                Go Back
              </button>
              <Navigate to="/" replace />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If user is logged in but trying to access auth pages
  if (!requireAuth && user) {
    const redirectPath = isAdmin() ? '/admin/dashboard' : '/customer/dashboard-customer'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

// Higher-order component for admin routes
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  )
}

// Higher-order component for customer routes
export const CustomerRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  )
}

// Higher-order component for public routes (redirect if logged in)
export const PublicRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  )
}

export default ProtectedRoute
