import React, { useState, useEffect } from 'react'
import { dbHelpers } from '../../lib/supabase'
import { toast } from 'react-toastify'
import {
  Settings as SettingsIcon,
  Globe,
  Mail,
  Shield,
  Palette,
  Database,
  Bell,
  Users,
  Code,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  Lock,
  Key,
  Server,
  Zap,
  Image,
  FileText,
  Link,
  BarChart3
} from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const [formData, setFormData] = useState({
    // General Settings
    site_name: '',
    site_description: '',
    site_url: '',
    admin_email: '',
    timezone: '',
    language: 'en',
    
    // SEO Settings
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    google_analytics_id: '',
    google_search_console: '',
    
    // Email Settings
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: '',
    from_name: '',
    
    // Security Settings
    enable_registration: true,
    require_email_verification: true,
    password_min_length: 6,
    enable_2fa: false,
    session_timeout: 24,
    max_login_attempts: 5,
    
    // Appearance Settings
    primary_color: '#00d4ff',
    secondary_color: '#ff6b9d',
    accent_color: '#c471ed',
    logo_url: '',
    favicon_url: '',
    custom_css: '',
    
    // API Settings
    enable_api: true,
    api_rate_limit: 100,
    api_key_expiry: 30,
    
    // Notification Settings
    email_notifications: true,
    browser_notifications: false,
    slack_webhook: '',
    discord_webhook: ''
  })

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: Globe,
      description: 'Basic site configuration'
    },
    {
      id: 'seo',
      label: 'SEO & Analytics',
      icon: BarChart3,
      description: 'Search engine optimization'
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      description: 'SMTP and email settings'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Authentication and security'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      description: 'Themes and customization'
    },
    {
      id: 'api',
      label: 'API',
      icon: Code,
      description: 'API configuration'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Alert and notification settings'
    }
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await dbHelpers.getSettings()
      
      if (error) {
        toast.error('Failed to load settings')
        console.error('Error loading settings:', error)
        return
      }

      // Convert settings array to object
      const settingsObj = {}
      if (data) {
        data.forEach(setting => {
          settingsObj[setting.key] = setting.value
        })
      }

      setSettings(settingsObj)
      setFormData(prev => ({ ...prev, ...settingsObj }))
    } catch (error) {
      toast.error('Failed to load settings')
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setUnsavedChanges(true)
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // Save each changed setting
      const promises = Object.entries(formData).map(async ([key, value]) => {
        if (settings[key] !== value) {
          const category = getCategoryForKey(key)
          return dbHelpers.updateSetting(key, value, category)
        }
        return Promise.resolve()
      })

      await Promise.all(promises)
      
      toast.success('Settings saved successfully')
      setUnsavedChanges(false)
      loadSettings() // Reload to get updated data
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const getCategoryForKey = (key) => {
    if (key.startsWith('site_') || key === 'admin_email' || key === 'timezone' || key === 'language') return 'general'
    if (key.startsWith('meta_') || key.includes('google_') || key.includes('analytics')) return 'seo'
    if (key.startsWith('smtp_') || key.includes('email') || key.startsWith('from_')) return 'email'
    if (key.includes('password') || key.includes('security') || key.includes('2fa') || key.includes('session') || key.includes('login')) return 'security'
    if (key.includes('color') || key.includes('logo') || key.includes('favicon') || key.includes('css')) return 'appearance'
    if (key.startsWith('api_') || key === 'enable_api') return 'api'
    if (key.includes('notification') || key.includes('webhook')) return 'notifications'
    return 'general'
  }

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setFormData({
        site_name: 'Generatorus',
        site_description: 'Free QR Code and Barcode Generator',
        site_url: 'https://generatorus.com',
        admin_email: 'admin@generatorus.com',
        timezone: 'UTC',
        language: 'en',
        meta_title: 'Generatorus - Free QR Code Generator',
        meta_description: 'Generate QR codes and barcodes for free with no expiration',
        meta_keywords: 'qr code, barcode, generator, free',
        primary_color: '#00d4ff',
        secondary_color: '#ff6b9d',
        accent_color: '#c471ed',
        enable_registration: true,
        require_email_verification: true,
        password_min_length: 6,
        enable_api: true,
        api_rate_limit: 100,
        email_notifications: true
      })
      setUnsavedChanges(true)
    }
  }

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner large"></div>
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Configure your application settings and preferences</p>
        </div>
        <div className="header-actions">
          <button onClick={resetToDefaults} className="btn btn-secondary">
            <RefreshCw size={18} />
            Reset to Defaults
          </button>
          <button 
            onClick={saveSettings}
            disabled={!unsavedChanges || saving}
            className="btn btn-primary"
          >
            {saving ? (
              <div className="loading-spinner small"></div>
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {unsavedChanges && (
        <div className="warning-banner">
          <AlertCircle size={20} />
          <span>You have unsaved changes. Don't forget to save your settings.</span>
        </div>
      )}

      <div className="settings-container">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <div className="nav-content">
                    <span className="nav-label">{tab.label}</span>
                    <span className="nav-description">{tab.description}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>General Settings</h2>
                <p>Basic configuration for your application</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="site_name">Site Name</label>
                  <input
                    id="site_name"
                    type="text"
                    value={formData.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="form-input"
                    placeholder="Your site name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin_email">Admin Email</label>
                  <input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => handleInputChange('admin_email', e.target.value)}
                    className="form-input"
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="site_description">Site Description</label>
                  <textarea
                    id="site_description"
                    value={formData.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    className="form-textarea"
                    rows="3"
                    placeholder="Brief description of your site"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="site_url">Site URL</label>
                  <input
                    id="site_url"
                    type="url"
                    value={formData.site_url}
                    onChange={(e) => handleInputChange('site_url', e.target.value)}
                    className="form-input"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <select
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="form-select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="form-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>SEO & Analytics</h2>
                <p>Search engine optimization and tracking configuration</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="meta_title">Meta Title</label>
                  <input
                    id="meta_title"
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className="form-input"
                    placeholder="Your site's meta title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="google_analytics_id">Google Analytics ID</label>
                  <input
                    id="google_analytics_id"
                    type="text"
                    value={formData.google_analytics_id}
                    onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                    className="form-input"
                    placeholder="GA-XXXXXXXXX-X"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="meta_description">Meta Description</label>
                  <textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    className="form-textarea"
                    rows="3"
                    placeholder="Brief description for search engines"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="meta_keywords">Meta Keywords</label>
                  <input
                    id="meta_keywords"
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                    className="form-input"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="google_search_console">Google Search Console Verification</label>
                  <input
                    id="google_search_console"
                    type="text"
                    value={formData.google_search_console}
                    onChange={(e) => handleInputChange('google_search_console', e.target.value)}
                    className="form-input"
                    placeholder="Verification meta tag content"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Security Settings</h2>
                <p>Authentication and security configuration</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.enable_registration}
                      onChange={(e) => handleInputChange('enable_registration', e.target.checked)}
                    />
                    <span className="checkbox-text">Enable User Registration</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.require_email_verification}
                      onChange={(e) => handleInputChange('require_email_verification', e.target.checked)}
                    />
                    <span className="checkbox-text">Require Email Verification</span>
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="password_min_length">Minimum Password Length</label>
                  <input
                    id="password_min_length"
                    type="number"
                    min="6"
                    max="50"
                    value={formData.password_min_length}
                    onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="max_login_attempts">Max Login Attempts</label>
                  <input
                    id="max_login_attempts"
                    type="number"
                    min="3"
                    max="20"
                    value={formData.max_login_attempts}
                    onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="session_timeout">Session Timeout (hours)</label>
                  <input
                    id="session_timeout"
                    type="number"
                    min="1"
                    max="168"
                    value={formData.session_timeout}
                    onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.enable_2fa}
                      onChange={(e) => handleInputChange('enable_2fa', e.target.checked)}
                    />
                    <span className="checkbox-text">Enable Two-Factor Authentication</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Appearance Settings</h2>
                <p>Customize the look and feel of your application</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="primary_color">Primary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="form-input"
                      placeholder="#00d4ff"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="secondary_color">Secondary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="form-input"
                      placeholder="#ff6b9d"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="accent_color">Accent Color</label>
                  <div className="color-input-wrapper">
                    <input
                      id="accent_color"
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="form-input"
                      placeholder="#c471ed"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="logo_url">Logo URL</label>
                  <input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    className="form-input"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="favicon_url">Favicon URL</label>
                  <input
                    id="favicon_url"
                    type="url"
                    value={formData.favicon_url}
                    onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                    className="form-input"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="custom_css">Custom CSS</label>
                  <textarea
                    id="custom_css"
                    value={formData.custom_css}
                    onChange={(e) => handleInputChange('custom_css', e.target.value)}
                    className="form-textarea code"
                    rows="10"
                    placeholder="/* Your custom CSS here */"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
