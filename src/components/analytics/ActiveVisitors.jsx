import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Users, 
  Globe, 
  ExternalLink, 
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw
} from 'lucide-react'
import './ActiveVisitors.css'

const ActiveVisitors = () => {
  const [activeVisitors, setActiveVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadActiveVisitors()
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      loadActiveVisitors()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const loadActiveVisitors = async () => {
    try {
      setError(null)
      // Get visitors from last 5 minutes (considered "active")
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .gte('visited_at', fiveMinutesAgo)
        .order('visited_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error loading active visitors:', error)
        setError('Failed to load visitor data')
        setActiveVisitors([])
        return
      }

      console.log('Active visitors data:', data)
      setActiveVisitors(data || [])
      setLastUpdate(new Date())

    } catch (error) {
      console.error('Error in loadActiveVisitors:', error)
      setError('Failed to load visitor data')
      setActiveVisitors([])
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone size={16} />
      case 'tablet': return <Tablet size={16} />
      case 'desktop': return <Monitor size={16} />
      default: return <Monitor size={16} />
    }
  }

  const getTrafficSource = (visitor) => {
    if (visitor.utm_source) {
      return visitor.utm_source
    }
    if (visitor.referrer && visitor.referrer !== 'Direct') {
      try {
        return new URL(visitor.referrer).hostname
      } catch {
        return 'Referral'
      }
    }
    return 'Direct'
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const visitTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now - visitTime) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`
    }
  }

  const getPageName = (pageUrl) => {
    try {
      const url = new URL(pageUrl)
      const path = url.pathname
      
      if (path === '/') return 'Home'
      if (path === '/qr-generator') return 'QR Generator'
      if (path === '/barcode-generator') return 'Barcode Generator'
      if (path === '/pdf-editor') return 'PDF Editor'
      if (path === '/file-converter') return 'File Converter'
      if (path.startsWith('/customer')) return 'Customer Dashboard'
      if (path.startsWith('/admin')) return 'Admin Dashboard'
      
      return path.replace('/', '').replace('-', ' ').toUpperCase()
    } catch {
      return 'Unknown Page'
    }
  }

  // Group visitors by session to show unique active users
  const uniqueActiveVisitors = activeVisitors.reduce((acc, visitor) => {
    const sessionId = visitor.session_id || visitor.ip_address
    if (!acc[sessionId] || new Date(visitor.visited_at) > new Date(acc[sessionId].visited_at)) {
      acc[sessionId] = visitor
    }
    return acc
  }, {})

  const uniqueVisitorsArray = Object.values(uniqueActiveVisitors)

  // Calculate stats
  const totalActiveVisitors = uniqueVisitorsArray.length
  const countryCounts = {}
  const sourceCounts = {}

  uniqueVisitorsArray.forEach(visitor => {
    const country = visitor.country || 'Unknown'
    const source = getTrafficSource(visitor)
    
    countryCounts[country] = (countryCounts[country] || 0) + 1
    sourceCounts[source] = (sourceCounts[source] || 0) + 1
  })

  const topCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  const topSources = Object.entries(sourceCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <div className="active-visitors">
      <div className="active-visitors-header">
        <div className="header-info">
          <h3>
            <Users size={20} />
            Active Visitors
            <span className="visitor-count">{totalActiveVisitors}</span>
          </h3>
          <p>Last 5 minutes • Updated {formatTimeAgo(lastUpdate)}</p>
        </div>
        <button onClick={loadActiveVisitors} className="refresh-btn" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading active visitors...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <h4>Error Loading Visitors</h4>
          <p>{error}</p>
          <button onClick={loadActiveVisitors} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : totalActiveVisitors === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h4>No Active Visitors</h4>
          <p>No visitors in the last 5 minutes</p>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <Globe size={16} />
              <span>Countries: {Object.keys(countryCounts).length}</span>
            </div>
            <div className="stat-item">
              <ExternalLink size={16} />
              <span>Sources: {Object.keys(sourceCounts).length}</span>
            </div>
          </div>

          {/* Top Countries */}
          <div className="stats-section">
            <h4>Top Countries</h4>
            <div className="stats-list">
              {topCountries.map(([country, count]) => (
                <div key={country} className="stat-row">
                  <span className="stat-label">{country}</span>
                  <span className="stat-value">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sources */}
          <div className="stats-section">
            <h4>Traffic Sources</h4>
            <div className="stats-list">
              {topSources.map(([source, count]) => (
                <div key={source} className="stat-row">
                  <span className="stat-label">{source}</span>
                  <span className="stat-value">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Visitors List */}
          <div className="visitors-section">
            <h4>Recent Activity</h4>
            <div className="visitors-list">
              {uniqueVisitorsArray.slice(0, 10).map((visitor, index) => (
                <div key={index} className="visitor-item">
                  <div className="visitor-info">
                    <div className="visitor-location">
                      <Globe size={14} />
                      <span>{visitor.country || 'Unknown'}</span>
                      {visitor.city && <span className="city">• {visitor.city}</span>}
                    </div>
                    <div className="visitor-page">
                      {getDeviceIcon(visitor.device_type)}
                      <span>{getPageName(visitor.page_visited)}</span>
                    </div>
                  </div>
                  <div className="visitor-meta">
                    <div className="visitor-source">
                      <ExternalLink size={12} />
                      <span>{getTrafficSource(visitor)}</span>
                    </div>
                    <div className="visitor-time">
                      <Clock size={12} />
                      <span>{formatTimeAgo(visitor.visited_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ActiveVisitors
