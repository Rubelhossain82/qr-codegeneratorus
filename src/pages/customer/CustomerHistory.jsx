import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  QrCode,
  Calendar,
  Eye,
  Download,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Share2,
  Trash2,
  ExternalLink,
  BarChart3
} from 'lucide-react'
import './CustomerHistory.css'

const CustomerHistory = () => {
  const { user } = useAuth()
  const [qrHistory, setQrHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [stats, setStats] = useState({
    totalGenerated: 0,
    totalScans: 0,
    totalDownloads: 0,
    mostUsedType: '',
    thisWeekGenerated: 0
  })

  useEffect(() => {
    if (user) {
      loadQRHistory()
    }
  }, [user])

  const loadQRHistory = async () => {
    setLoading(true)
    try {
      console.log('Loading QR history for user:', user?.id)

      const { data, error } = await supabase
        .from('qr_history')
        .select('*')
        .eq('user_id', user.id)
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (error) {
        console.error('Error loading QR history:', error)
        // Show empty state on error
        setQrHistory([])
        calculateStats([])
      } else {
        console.log('QR history loaded:', data)
        setQrHistory(data || [])
        calculateStats(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setQrHistory([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const thisWeekData = data.filter(item => 
      new Date(item.created_at) >= weekAgo
    )

    // Count QR types
    const typeCounts = data.reduce((acc, item) => {
      const type = item.qr_type || item.type || 'text'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const mostUsedType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'text'
    )

    setStats({
      totalGenerated: data.length,
      totalScans: data.reduce((sum, item) => sum + (item.scan_count || 0), 0),
      totalDownloads: data.reduce((sum, item) => sum + (item.download_count || 0), 0),
      mostUsedType: mostUsedType || 'text',
      thisWeekGenerated: thisWeekData.length
    })
  }

  const filteredHistory = qrHistory.filter(item => {
    const matchesSearch = !searchTerm || 
      (item.qr_data || item.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.qr_type || item.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
      (item.qr_type || item.type) === filterType

    return matchesSearch && matchesFilter
  })

  const getQRTypeIcon = (type) => {
    switch (type) {
      case 'barcode':
        return BarChart3
      default:
        return QrCode
    }
  }

  const getQRTypeColor = (type) => {
    const colors = {
      'text': 'blue',
      'url': 'green',
      'email': 'red',
      'phone': 'purple',
      'sms': 'orange',
      'wifi': 'teal',
      'vcard': 'indigo',
      'barcode': 'gray'
    }
    return colors[type] || 'blue'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Add demo QR code for testing
  const addDemoQRCode = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('qr_history')
        .insert([
          {
            user_id: user.id,
            content: 'https://www.example.com',
            type: 'url',
            format: 'png',
            size: 256,
            foreground_color: '#000000',
            background_color: '#ffffff',
            download_count: Math.floor(Math.random() * 10) + 1,
            scan_count: Math.floor(Math.random() * 50) + 1,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Error adding demo QR:', error)
      } else {
        console.log('Demo QR added:', data)
        loadQRHistory() // Reload the history
      }
    } catch (error) {
      console.error('Error adding demo QR:', error)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading QR history...</p>
      </div>
    )
  }

  return (
    <div className="customer-history">
      {/* Header */}
      <div className="history-header">
        <div className="header-content">
          <h1 className="page-title">QR Code History</h1>
          <p className="page-subtitle">
            Track and manage all your generated QR codes and barcodes
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon blue">
            <QrCode size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalGenerated}</div>
            <div className="stat-label">Total Generated</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalScans}</div>
            <div className="stat-label">Total Scans</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple">
            <Download size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDownloads}</div>
            <div className="stat-label">Total Downloads</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orange">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.thisWeekGenerated}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="history-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search QR codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
            <option value="wifi">WiFi</option>
            <option value="vcard">vCard</option>
            <option value="barcode">Barcode</option>
          </select>
        </div>
        
        <div className="sort-container">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="sort-select"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="scan_count-desc">Most Scanned</option>
            <option value="download_count-desc">Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* QR History List */}
      <div className="history-content">
        {filteredHistory.length > 0 ? (
          <div className="history-grid">
            {filteredHistory.map((item) => {
              const Icon = getQRTypeIcon(item.qr_type || item.type)
              const color = getQRTypeColor(item.qr_type || item.type)
              
              return (
                <div key={item.id} className={`history-item ${color}`}>
                  <div className="item-header">
                    <div className="item-icon">
                      <Icon size={24} />
                    </div>
                    <div className="item-type">
                      {(item.qr_type || item.type || 'text').toUpperCase()}
                    </div>
                    <button className="item-menu">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="item-content">
                    <div className="item-data">
                      {(item.qr_data || item.content || '').substring(0, 100)}
                      {(item.qr_data || item.content || '').length > 100 && '...'}
                    </div>
                    <div className="item-date">
                      <Calendar size={14} />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  
                  <div className="item-stats">
                    <div className="stat-item">
                      <Eye size={14} />
                      <span>{item.scan_count || 0}</span>
                    </div>
                    <div className="stat-item">
                      <Download size={14} />
                      <span>{item.download_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      onClick={() => copyToClipboard(item.qr_data || item.content)}
                      className="action-btn"
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                    <button className="action-btn" title="Share">
                      <Share2 size={16} />
                    </button>
                    <button className="action-btn" title="View">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <QrCode size={64} />
            <h3>No QR codes found</h3>
            <p>
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start generating QR codes to see them here'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <div className="empty-actions">
                <button
                  onClick={addDemoQRCode}
                  className="demo-btn"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginTop: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.2)'
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.1)'
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  Add Demo QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerHistory
