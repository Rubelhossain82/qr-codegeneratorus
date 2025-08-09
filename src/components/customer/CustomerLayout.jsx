import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  User,
  History,
  Settings,
  QrCode,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react'
import './CustomerLayout.css'

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const location = useLocation()

  // Remove loading screen from CustomerLayout since ProtectedRoute handles it
  // if (loading) {
  //   return (
  //     <div className="auth-loading">
  //       <div className="loading-container">
  //         <div className="loading-content">
  //           <div className="loading-spinner"></div>
  //           <p>Loading Dashboard...</p>
  //           <div className="loading-progress">
  //             <div className="progress-bar"></div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/customer/dashboard-customer',
      icon: LayoutDashboard,
      description: 'Overview and statistics'
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: User,
      description: 'Manage your profile'
    },
    {
      name: 'QR History',
      href: '/customer/history',
      icon: History,
      description: 'Your generated QR codes'
    }
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="customer-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/" className="mobile-logo">
            <QrCode size={24} />
          </Link>

          <div className="mobile-actions">
            <button className="notification-btn">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <QrCode size={28} />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Main</h3>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <div className="nav-content">
                    <span className="nav-label">{item.name}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Quick Actions</h3>
            <Link
              to="/qr-generator"
              className="nav-item quick-action"
              onClick={() => setSidebarOpen(false)}
            >
              <QrCode size={20} />
              <div className="nav-content">
                <span className="nav-label">Generate QR</span>
                <span className="nav-description">Create new QR code</span>
              </div>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="avatar-image"
                />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="user-details">
              <p className="user-name">
                {user?.user_metadata?.full_name || 'Customer'}
              </p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="sign-out-btn"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default CustomerLayout
