import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { dbHelpers } from '../../lib/supabase'
import {
  Users,
  BarChart3,
  Eye,
  QrCode,
  TrendingUp,
  Calendar,
  Globe,
  Activity,
  ArrowUpRight,
  Clock,
  Zap
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    weeklyVisitors: 0,
    monthlyVisitors: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load visitor analytics for different periods
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        dbHelpers.getVisitorAnalytics('daily'),
        dbHelpers.getVisitorAnalytics('weekly'),
        dbHelpers.getVisitorAnalytics('monthly')
      ])

      setStats({
        todayVisitors: dailyResult.data?.length || 0,
        weeklyVisitors: weeklyResult.data?.length || 0,
        monthlyVisitors: monthlyResult.data?.length || 0,
        totalVisitors: monthlyResult.data?.length || 0 // For now, using monthly as total
      })

      // Set recent activity (last 10 visitors)
      if (weeklyResult.data) {
        setRecentActivity(weeklyResult.data.slice(0, 10))
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Today\'s Visitors',
      value: stats.todayVisitors,
      icon: Eye,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Weekly Visitors',
      value: stats.weeklyVisitors,
      icon: Calendar,
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Monthly Visitors',
      value: stats.monthlyVisitors,
      icon: BarChart3,
      color: 'purple',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: '1,234', // This would come from users table
      icon: Users,
      color: 'orange',
      change: '+5%',
      changeType: 'positive'
    }
  ]

  const quickActions = [
    {
      title: 'View Analytics',
      description: 'Detailed visitor analytics and reports',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      href: '/admin/users',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Code Injection',
      description: 'Manage SEO and tracking codes',
      href: '/admin/code-injection',
      icon: Globe,
      color: 'purple'
    },
    {
      title: 'Advertisements',
      description: 'Manage ad placements and campaigns',
      href: '/admin/advertisements',
      icon: Activity,
      color: 'orange'
    }
  ]

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, {user?.user_metadata?.full_name || 'Admin'}!
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your website today.
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

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-header">
                <div className="stat-icon-wrapper">
                  <div className={`stat-icon ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className={`stat-change ${stat.changeType}`}>
                  <TrendingUp size={14} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value.toLocaleString()}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
              <div className="stat-footer">
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <Zap size={20} />
            Quick Actions
          </h2>
          <p className="section-subtitle">Manage your platform efficiently</p>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.href}
                className={`quick-action-card ${action.color}`}
              >
                <div className="action-header">
                  <div className={`action-icon ${action.color}`}>
                    <Icon size={20} />
                  </div>
                  <ArrowUpRight size={16} className="action-arrow" />
                </div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <Activity size={20} />
            Recent Activity
          </h2>
          <p className="section-subtitle">Latest visitor interactions</p>
        </div>
        <div className="activity-card">
          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <Eye size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <p className="activity-text">
                        Visitor accessed <strong>{activity.page_url}</strong>
                      </p>
                      <span className="activity-badge">New</span>
                    </div>
                    <p className="activity-time">
                      {new Date(activity.visited_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length > 5 && (
                <div className="activity-footer">
                  <Link to="/admin/analytics" className="view-all-link">
                    View all activity
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="no-activity">
              <div className="no-activity-icon">
                <Activity size={48} />
              </div>
              <div className="no-activity-content">
                <h3>No recent activity</h3>
                <p>Activity will appear here as visitors interact with your site</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
