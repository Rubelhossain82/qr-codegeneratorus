import React, { useState, useEffect } from 'react'
import { getAnalyticsData } from '../../services/analyticsService'
import { toast } from 'react-toastify'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Calendar,
  Clock,
  Users,
  Activity,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily')
  const [analyticsData, setAnalyticsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    avgSessionTime: '2m 34s',
    bounceRate: '45%'
  })

  const periods = [
    { value: 'daily', label: 'Today', icon: Clock },
    { value: 'weekly', label: 'This Week', icon: Calendar },
    { value: 'monthly', label: 'This Month', icon: BarChart3 },
    { value: 'yearly', label: 'This Year', icon: TrendingUp }
  ]

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      const result = await getAnalyticsData(selectedPeriod)

      if (result.error) {
        toast.error('Failed to load analytics data')
        console.error('Error loading analytics:', result.error)
        return
      }

      const { visitors = [], pageAnalytics = [] } = result.data || {}
      setAnalyticsData(visitors)

      // Calculate enhanced stats
      const totalViews = visitors.length
      const uniqueVisitors = new Set(visitors.map(v => v.session_id || v.ip_address)).size

      // Calculate average session time
      const totalTime = pageAnalytics.reduce((sum, page) => sum + (page.time_on_page || 0), 0)
      const avgTimeSeconds = totalTime / Math.max(pageAnalytics.length, 1)
      const avgSessionTime = `${Math.floor(avgTimeSeconds / 60)}m ${Math.floor(avgTimeSeconds % 60)}s`

      // Calculate bounce rate
      const sessionPageCounts = {}
      pageAnalytics.forEach(page => {
        sessionPageCounts[page.session_id] = (sessionPageCounts[page.session_id] || 0) + 1
      })
      const bounces = Object.values(sessionPageCounts).filter(count => count === 1).length
      const bounceRate = `${Math.round((bounces / Math.max(uniqueVisitors, 1)) * 100)}%`

      setStats({
        totalViews,
        uniqueVisitors,
        avgSessionTime,
        bounceRate
      })

    } catch (error) {
      toast.error('Failed to load analytics data')
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Page Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Unique Visitors',
      value: stats.uniqueVisitors,
      icon: Users,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Avg. Session Time',
      value: stats.avgSessionTime,
      icon: Clock,
      color: 'purple',
      change: '+5%'
    },
    {
      title: 'Bounce Rate',
      value: stats.bounceRate,
      icon: Activity,
      color: 'orange',
      change: '-3%'
    }
  ]

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner large"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Track visitor behavior and site performance</p>
        </div>
        <div className="header-actions">
          <button onClick={loadAnalytics} className="btn btn-secondary">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="btn btn-secondary">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="period-selector">
        <div className="period-tabs">
          {periods.map((period) => {
            const Icon = period.icon
            return (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`period-tab ${selectedPeriod === period.value ? 'active' : ''}`}
              >
                <Icon size={16} />
                {period.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change.startsWith('+')
          const isNegative = stat.change.startsWith('-')
          
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-header">
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div className="stat-change">
                  {isPositive && <ArrowUp size={14} className="change-icon positive" />}
                  {isNegative && <ArrowDown size={14} className="change-icon negative" />}
                  <span className={`change-text ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <h3 className="stat-title">{stat.title}</h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Analytics Content */}
      <div className="analytics-content">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Recent Visitors</h3>
            <p>Latest visitor activity</p>
          </div>
          <div className="visitors-list">
            {analyticsData.length > 0 ? (
              analyticsData.slice(0, 10).map((visitor, index) => (
                <div key={index} className="visitor-item">
                  <div className="visitor-info">
                    <div className="visitor-details">
                      <p className="visitor-page">
                        {visitor.page_url || 'Unknown Page'}
                      </p>
                      <p className="visitor-time">
                        {new Date(visitor.visited_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="visitor-meta">
                    <span className="visitor-ip">
                      {visitor.ip_address || 'Unknown IP'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <Users size={48} />
                <p>No visitor data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
