import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ServiceCards from '../../components/customer/ServiceCards'
import {
  Clock
} from 'lucide-react'
import './CustomerDashboard.css'

const CustomerDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simple loading state management
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Show loading screen for initial load
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner-small"></div>
        <span>Loading Dashboard...</span>
      </div>
    )
  }

  return (
    <div className="customer-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer'}!
            </h1>
            <p className="welcome-subtitle">
              Choose from our collection of generator tools to create QR codes and barcodes for your needs.
            </p>
          </div>
          <div className="dashboard-date">
            <div className="date-badge">
              <Clock size={16} />
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <ServiceCards />
    </div>
  )
}

export default CustomerDashboard
