import React, { useState, useEffect } from 'react'
import { getAnalyticsData } from '../../services/analyticsService'
import { toast } from 'react-toastify'
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
  Activity,
  MousePointer
} from 'lucide-react'
import './CustomerAnalytics.css'

const CustomerAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    avgTimeOnSite: '0m 0s',
    bounceRate: '0%',
    topCountries: [],
    topPages: [],
    deviceBreakdown: {},
    browserBreakdown: {},
    trafficSources: {}
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
      setAnalyticsData(result.data)
      
      // Calculate comprehensive stats
      calculateStats(visitors, pageAnalytics)

    } catch (error) {
      toast.error('Failed to load analytics data')
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (visitors, pageAnalytics) => {
    // Basic stats
    const totalViews = visitors.length
    const uniqueVisitors = new Set(visitors.map(v => v.session_id || v.ip_address)).size
    
    // Average time on site
    const totalTime = pageAnalytics.reduce((sum, page) => sum + (page.time_on_page || 0), 0)
    const avgTimeSeconds = totalTime / Math.max(pageAnalytics.length, 1)
    const avgTimeOnSite = formatDuration(avgTimeSeconds)
    
    // Bounce rate (sessions with only 1 page view)
    const sessionPageCounts = {}
    pageAnalytics.forEach(page => {
      sessionPageCounts[page.session_id] = (sessionPageCounts[page.session_id] || 0) + 1
    })
    const bounces = Object.values(sessionPageCounts).filter(count => count === 1).length
    const bounceRate = `${Math.round((bounces / Math.max(uniqueVisitors, 1)) * 100)}%`
    
    // Top countries
    const countryCounts = {}
    visitors.forEach(v => {
      const country = v.country || 'Unknown'
      countryCounts[country] = (countryCounts[country] || 0) + 1
    })
    const topCountries = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }))
    
    // Top pages
    const pageCounts = {}
    visitors.forEach(v => {
      const page = new URL(v.page_url).pathname
      pageCounts[page] = (pageCounts[page] || 0) + 1
    })
    const topPages = Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }))
    
    // Device breakdown
    const deviceCounts = {}
    visitors.forEach(v => {
      const device = v.device_type || 'Unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })
    
    // Browser breakdown
    const browserCounts = {}
    visitors.forEach(v => {
      const browser = v.browser || 'Unknown'
      browserCounts[browser] = (browserCounts[browser] || 0) + 1
    })
    
    // Traffic sources
    const sourceCounts = {}
    visitors.forEach(v => {
      let source = 'Direct'
      if (v.utm_source) {
        source = v.utm_source
      } else if (v.referrer && v.referrer !== 'Direct') {
        try {
          source = new URL(v.referrer).hostname
        } catch {
          source = 'Referral'
        }
      }
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })

    setStats({
      totalViews,
      uniqueVisitors,
      avgTimeOnSite,
      bounceRate,
      topCountries,
      topPages,
      deviceBreakdown: deviceCounts,
      browserBreakdown: browserCounts,
      trafficSources: sourceCounts
    })
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const getDeviceIcon = (device) => {
    switch (device.toLowerCase()) {
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      case 'desktop': return Monitor
      default: return Monitor
    }
  }

  const statCards = [
    {
      title: 'Total Page Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Unique Visitors',
      value: stats.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Avg. Time on Site',
      value: stats.avgTimeOnSite,
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
    <div className="customer-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>Website Analytics</h1>
          <p>Comprehensive insights into your website performance</p>
        </div>
        <div className="header-actions">
          <button onClick={loadAnalytics} className="btn btn-secondary">
            <RefreshCw size={18} />
            Refresh
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

      {/* Analytics Grid */}
      <div className="analytics-grid">
        {/* Top Countries */}
        <div className="analytics-card">
          <div className="card-header">
            <h3><Globe size={20} /> Top Countries</h3>
          </div>
          <div className="countries-list">
            {stats.topCountries.map((item, index) => (
              <div key={index} className="country-item">
                <span className="country-name">{item.country}</span>
                <span className="country-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="analytics-card">
          <div className="card-header">
            <h3><Smartphone size={20} /> Device Types</h3>
          </div>
          <div className="device-list">
            {Object.entries(stats.deviceBreakdown).map(([device, count]) => {
              const Icon = getDeviceIcon(device)
              return (
                <div key={device} className="device-item">
                  <Icon size={16} />
                  <span className="device-name">{device}</span>
                  <span className="device-count">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Pages */}
        <div className="analytics-card">
          <div className="card-header">
            <h3><BarChart3 size={20} /> Top Pages</h3>
          </div>
          <div className="pages-list">
            {stats.topPages.map((item, index) => (
              <div key={index} className="page-item">
                <span className="page-name">{item.page}</span>
                <span className="page-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="analytics-card">
          <div className="card-header">
            <h3><MousePointer size={20} /> Traffic Sources</h3>
          </div>
          <div className="sources-list">
            {Object.entries(stats.trafficSources).map(([source, count]) => (
              <div key={source} className="source-item">
                <span className="source-name">{source}</span>
                <span className="source-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerAnalytics
