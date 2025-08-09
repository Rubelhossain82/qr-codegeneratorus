import React, { useState, useEffect } from 'react'
import { dbHelpers } from '../../lib/supabase'
import { toast } from 'react-toastify'
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Calendar,
  DollarSign,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Image,
  Link,
  Code,
  Type
} from 'lucide-react'

const Advertisements = () => {
  const [advertisements, setAdvertisements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlacement, setFilterPlacement] = useState('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'banner',
    placement: 'header',
    is_active: true,
    start_date: '',
    end_date: '',
    target_url: '',
    image_url: '',
    priority: 1
  })

  const adTypes = [
    { value: 'banner', label: 'Banner Ad', icon: Image },
    { value: 'text', label: 'Text Ad', icon: Type },
    { value: 'popup', label: 'Popup Ad', icon: Monitor },
    { value: 'sidebar', label: 'Sidebar Ad', icon: Tablet },
    { value: 'custom', label: 'Custom Code', icon: Code }
  ]

  const placements = [
    { value: 'header', label: 'Header', description: 'Top of the page' },
    { value: 'footer', label: 'Footer', description: 'Bottom of the page' },
    { value: 'sidebar', label: 'Sidebar', description: 'Side panel' },
    { value: 'content', label: 'Content', description: 'Within content' },
    { value: 'popup', label: 'Popup', description: 'Modal overlay' },
    { value: 'custom', label: 'Custom', description: 'Custom placement' }
  ]

  useEffect(() => {
    loadAdvertisements()
  }, [])

  const loadAdvertisements = async () => {
    try {
      setLoading(true)
      const { data, error } = await dbHelpers.getAllAdvertisements()
      
      if (error) {
        toast.error('Failed to load advertisements')
        console.error('Error loading advertisements:', error)
        return
      }

      setAdvertisements(data || [])
    } catch (error) {
      toast.error('Failed to load advertisements')
      console.error('Error loading advertisements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedAd) {
        // Update existing ad
        const { error } = await dbHelpers.updateAdvertisement(selectedAd.id, formData)
        if (error) throw error
        toast.success('Advertisement updated successfully')
        setShowEditModal(false)
      } else {
        // Create new ad
        const { error } = await dbHelpers.createAdvertisement(formData)
        if (error) throw error
        toast.success('Advertisement created successfully')
        setShowAddModal(false)
      }
      
      resetForm()
      loadAdvertisements()
    } catch (error) {
      toast.error('Failed to save advertisement')
      console.error('Error saving advertisement:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedAd) return

    try {
      const { error } = await dbHelpers.deleteAdvertisement(selectedAd.id)
      if (error) throw error
      
      toast.success('Advertisement deleted successfully')
      setShowDeleteModal(false)
      setSelectedAd(null)
      loadAdvertisements()
    } catch (error) {
      toast.error('Failed to delete advertisement')
      console.error('Error deleting advertisement:', error)
    }
  }

  const toggleAdStatus = async (ad) => {
    try {
      const { error } = await dbHelpers.updateAdvertisement(ad.id, {
        ...ad,
        is_active: !ad.is_active
      })
      
      if (error) throw error
      
      toast.success(`Advertisement ${ad.is_active ? 'deactivated' : 'activated'}`)
      loadAdvertisements()
    } catch (error) {
      toast.error('Failed to update advertisement status')
      console.error('Error updating advertisement status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      type: 'banner',
      placement: 'header',
      is_active: true,
      start_date: '',
      end_date: '',
      target_url: '',
      image_url: '',
      priority: 1
    })
    setSelectedAd(null)
  }

  const openEditModal = (ad) => {
    setSelectedAd(ad)
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      content: ad.content || '',
      type: ad.type || 'banner',
      placement: ad.placement || 'header',
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split('T')[0] : '',
      end_date: ad.end_date ? ad.end_date.split('T')[0] : '',
      target_url: ad.target_url || '',
      image_url: ad.image_url || '',
      priority: ad.priority || 1
    })
    setShowEditModal(true)
  }

  const filteredAds = advertisements.filter(ad => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && ad.is_active) ||
                         (filterStatus === 'inactive' && !ad.is_active)
    const matchesPlacement = filterPlacement === 'all' || ad.placement === filterPlacement
    
    return matchesSearch && matchesStatus && matchesPlacement
  })

  const stats = {
    total: advertisements.length,
    active: advertisements.filter(ad => ad.is_active).length,
    inactive: advertisements.filter(ad => !ad.is_active).length,
    expiringSoon: advertisements.filter(ad => {
      if (!ad.end_date) return false
      const endDate = new Date(ad.end_date)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0
    }).length
  }

  const statCards = [
    {
      title: 'Total Ads',
      value: stats.total,
      icon: Megaphone,
      color: 'blue',
      change: `${stats.active} active`
    },
    {
      title: 'Active Ads',
      value: stats.active,
      icon: CheckCircle,
      color: 'green',
      change: 'Currently running'
    },
    {
      title: 'Inactive Ads',
      value: stats.inactive,
      icon: EyeOff,
      color: 'gray',
      change: 'Not running'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: AlertCircle,
      color: 'orange',
      change: 'Within 7 days'
    }
  ]

  if (loading) {
    return (
      <div className="advertisements-loading">
        <div className="loading-spinner large"></div>
        <p>Loading advertisements...</p>
      </div>
    )
  }

  return (
    <div className="advertisements-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Advertisement Management</h1>
          <p>Manage ad campaigns, placements, and performance</p>
        </div>
        <div className="header-actions">
          <button onClick={loadAdvertisements} className="btn btn-secondary">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Create Ad
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-header">
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div className="stat-value">{stat.value}</div>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <p className="stat-change">{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="ads-controls">
        <div className="search-section">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search advertisements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-wrapper">
            <Filter size={20} className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="filter-wrapper">
            <Target size={20} className="filter-icon" />
            <select
              value={filterPlacement}
              onChange={(e) => setFilterPlacement(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Placements</option>
              {placements.map(placement => (
                <option key={placement.value} value={placement.value}>
                  {placement.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advertisements Grid */}
      <div className="ads-grid">
        {filteredAds.length > 0 ? (
          filteredAds.map((ad) => (
            <div key={ad.id} className={`ad-card ${ad.is_active ? 'active' : 'inactive'}`}>
              <div className="ad-header">
                <div className="ad-info">
                  <h3 className="ad-title">{ad.title}</h3>
                  <p className="ad-description">{ad.description}</p>
                </div>
                <div className="ad-status">
                  <span className={`status-badge ${ad.is_active ? 'active' : 'inactive'}`}>
                    {ad.is_active ? <CheckCircle size={14} /> : <EyeOff size={14} />}
                    {ad.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="ad-details">
                <div className="ad-meta">
                  <div className="meta-item">
                    <Target size={16} />
                    <span>{placements.find(p => p.value === ad.placement)?.label || ad.placement}</span>
                  </div>
                  <div className="meta-item">
                    <Globe size={16} />
                    <span className="ad-type">{ad.type}</span>
                  </div>
                  {ad.start_date && (
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>{new Date(ad.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {ad.image_url && (
                  <div className="ad-preview">
                    <img src={ad.image_url} alt={ad.title} />
                  </div>
                )}

                {ad.content && ad.type === 'text' && (
                  <div className="ad-content">
                    <p>{ad.content.substring(0, 100)}...</p>
                  </div>
                )}
              </div>

              <div className="ad-actions">
                <button
                  onClick={() => toggleAdStatus(ad)}
                  className={`action-btn ${ad.is_active ? 'deactivate' : 'activate'}`}
                  title={ad.is_active ? 'Deactivate' : 'Activate'}
                >
                  {ad.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => openEditModal(ad)}
                  className="action-btn edit"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    setSelectedAd(ad)
                    setShowDeleteModal(true)
                  }}
                  className="action-btn delete"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Megaphone size={64} />
            </div>
            <div className="empty-content">
              <h3>No Advertisements Found</h3>
              <p>
                {searchTerm || filterStatus !== 'all' || filterPlacement !== 'all'
                  ? 'No advertisements match your current filters.'
                  : 'Create your first advertisement to get started.'
                }
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus size={18} />
                Create Advertisement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>
                {selectedAd ? <Edit size={20} /> : <Plus size={20} />}
                {selectedAd ? 'Edit Advertisement' : 'Create Advertisement'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="form-input"
                    placeholder="Advertisement title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="form-select"
                    required
                  >
                    {adTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="placement">Placement *</label>
                  <select
                    id="placement"
                    value={formData.placement}
                    onChange={(e) => setFormData({...formData, placement: e.target.value})}
                    className="form-select"
                    required
                  >
                    {placements.map(placement => (
                      <option key={placement.value} value={placement.value}>
                        {placement.label} - {placement.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="form-textarea"
                    rows="3"
                    placeholder="Brief description of the advertisement"
                  />
                </div>

                {(formData.type === 'banner' || formData.type === 'sidebar') && (
                  <div className="form-group full-width">
                    <label htmlFor="image_url">Image URL</label>
                    <input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                <div className="form-group full-width">
                  <label htmlFor="target_url">Target URL</label>
                  <input
                    id="target_url"
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                    className="form-input"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="form-textarea"
                    rows="6"
                    placeholder={formData.type === 'custom' ? 'HTML/JavaScript code' : 'Advertisement content'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="start_date">Start Date</label>
                  <input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">End Date</label>
                  <input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="checkbox-text">Active (advertisement will be displayed)</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                {selectedAd ? 'Update Advertisement' : 'Create Advertisement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h3>
                <AlertCircle size={20} />
                Confirm Delete
              </h3>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete the advertisement <strong>{selectedAd?.title}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                Delete Advertisement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Advertisements
