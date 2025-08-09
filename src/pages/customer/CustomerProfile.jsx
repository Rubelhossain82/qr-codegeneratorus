import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, dbHelpers } from '../../lib/supabase'
import { cloudinaryHelpers, testCloudinaryConfig } from '../../lib/cloudinary'
import { uploadToCloudinary } from '../../lib/cloudinary-simple'
import { toast } from 'react-toastify'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Edit3,
  Shield,
  Bell,
  Globe,
  Eye,
  EyeOff,
  Upload,
  X
} from 'lucide-react'
import './CustomerProfile.css'

const CustomerProfile = () => {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '',
    date_of_birth: '',
    gender: '',
    timezone: 'UTC'
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: User,
      description: 'Basic personal information'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Mail,
      description: 'Contact information'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Password and security settings'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Bell,
      description: 'Notification and app preferences'
    }
  ]

  useEffect(() => {
    // Test Cloudinary configuration on component mount
    const isConfigValid = testCloudinaryConfig()
    if (!isConfigValid) {
      console.warn('Cloudinary configuration is incomplete')
      toast.warning('Image upload service not properly configured')
    }

    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Add minimum loading time for better UX
      const loadingPromise = new Promise(resolve => setTimeout(resolve, 800))

      // Get profile data from user_profiles table
      const dataPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const [, { data: profile, error }] = await Promise.all([loadingPromise, dataPromise])

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
        return
      }

      // Merge user auth data with profile data
      const mergedData = {
        first_name: profile?.first_name || user.user_metadata?.first_name || '',
        last_name: profile?.last_name || user.user_metadata?.last_name || '',
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: profile?.phone || user.user_metadata?.phone || '',
        bio: profile?.bio || '',
        location: profile?.location || '',
        website: profile?.website || '',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
        date_of_birth: profile?.date_of_birth || '',
        gender: profile?.gender || '',
        timezone: profile?.timezone || 'UTC'
      }

      setProfileData(mergedData)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target.result)
    }
    reader.readAsDataURL(file)
    setShowAvatarUpload(true)
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null

    try {
      console.log('=== Starting avatar upload to Cloudinary ===')
      console.log('File:', avatarFile.name, 'Size:', avatarFile.size)

      // Use simple Cloudinary upload with unsigned preset
      const result = await uploadToCloudinary(avatarFile, {
        folder: 'generatorus/avatars',
        public_id: `avatar-${user.id}-${Date.now()}`,
        width: 400,
        height: 400,
        crop: 'fill',
        quality: 'auto'
      })

      console.log('Cloudinary upload result:', result)

      if (result.success) {
        console.log('Avatar uploaded successfully to Cloudinary:', result.data.secure_url)
        toast.success('Profile picture uploaded successfully!')
        return result.data.secure_url
      } else {
        throw new Error(result.error || 'Cloudinary upload failed')
      }

    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError)
      toast.error(`Upload failed: ${cloudinaryError.message}`)
      return null
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      let avatarUrl = profileData.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        console.log('Uploading new avatar...')
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
          console.log('New avatar URL:', avatarUrl)
        } else {
          toast.error('Failed to upload avatar')
          setSaving(false)
          return
        }
      }

      const updatedData = {
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        avatar_url: avatarUrl,
        role: profileData.role || 'customer',
        phone: profileData.phone || null,
        bio: profileData.bio || null,
        location: profileData.location || null,
        website: profileData.website || null,
        date_of_birth: profileData.date_of_birth || null,
        gender: profileData.gender || null,
        timezone: profileData.timezone || 'UTC'
      }

      console.log('Updating profile data:', updatedData)

      // Update user_profiles table
      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .select()

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(`Database error: ${profileError.message}`)
      }

      console.log('Profile updated in database:', profileResult)

      // Update auth user metadata (optional, don't fail if this fails)
      try {
        const { error: authError } = await updateProfile({
          first_name: updatedData.first_name,
          last_name: updatedData.last_name,
          full_name: updatedData.full_name,
          avatar_url: avatarUrl
        })

        if (authError) {
          console.warn('Auth metadata update failed:', authError)
          // Don't throw error, just log warning
        }
      } catch (authError) {
        console.warn('Auth update failed:', authError)
        // Continue anyway
      }

      setProfileData(updatedData)
      setAvatarFile(null)
      setAvatarPreview(null)
      setShowAvatarUpload(false)

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(`Failed to update profile: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const renderPersonalTab = () => (
    <div className="tab-content">
      <div className="profile-section">
        <h3>Basic Information</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={profileData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={profileData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Enter your last name"
            />
          </div>

          <div className="form-group full-width">
            <label>Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={profileData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              value={profileData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContactTab = () => (
    <div className="tab-content">
      <div className="profile-section">
        <h3>Contact Information</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="disabled"
            />
            <small>Email cannot be changed. Contact support if needed.</small>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select
              value={profileData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Dhaka">Dhaka</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="customer-profile">
        <div className="profile-loading">
          <div className="loading-skeleton">
            {/* Header Skeleton */}
            <div className="profile-header-skeleton">
              <div className="avatar-skeleton"></div>
              <div className="info-skeleton">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line subtitle"></div>
                <div className="skeleton-line small"></div>
              </div>
              <div className="actions-skeleton">
                <div className="skeleton-button"></div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="tabs-skeleton">
              <div className="tab-skeleton active"></div>
              <div className="tab-skeleton"></div>
              <div className="tab-skeleton"></div>
              <div className="tab-skeleton"></div>
            </div>

            {/* Content Skeleton */}
            <div className="content-skeleton">
              <div className="form-skeleton">
                <div className="field-skeleton">
                  <div className="skeleton-line label"></div>
                  <div className="skeleton-input"></div>
                </div>
                <div className="field-skeleton">
                  <div className="skeleton-line label"></div>
                  <div className="skeleton-input"></div>
                </div>
                <div className="field-skeleton">
                  <div className="skeleton-line label"></div>
                  <div className="skeleton-input large"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-profile fade-in">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <div className="avatar-wrapper">
              {profileData.avatar_url || avatarPreview ? (
                <img 
                  src={avatarPreview || profileData.avatar_url} 
                  alt="Profile" 
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <User size={40} />
                </div>
              )}
              <button 
                className="avatar-edit-btn"
                onClick={() => document.getElementById('avatar-input').click()}
              >
                <Camera size={16} />
              </button>
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              style={{ display: 'none' }}
            />
          </div>
          
          {showAvatarUpload && (
            <div className="avatar-upload-actions">
              <button
                className="btn-primary"
                onClick={saveProfile}
                disabled={saving || !avatarFile}
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Avatar
                  </>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowAvatarUpload(false)
                  setAvatarFile(null)
                  setAvatarPreview(null)
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1>{profileData.full_name || 'Your Profile'}</h1>
          <p className="profile-email">{profileData.email}</p>
          <p className="profile-role">Customer</p>
        </div>

        <div className="profile-actions">
          <button 
            className="btn-primary"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <nav className="tabs-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <div className="tab-content">
                    <span className="tab-label">{tab.label}</span>
                    <span className="tab-description">{tab.description}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="tab-panels">
          {activeTab === 'personal' && renderPersonalTab()}
          {activeTab === 'contact' && renderContactTab()}
          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="coming-soon">
                <Shield size={48} />
                <h3>Security Settings</h3>
                <p>Password change and security options coming soon!</p>
              </div>
            </div>
          )}
          {activeTab === 'preferences' && (
            <div className="tab-content">
              <div className="coming-soon">
                <Bell size={48} />
                <h3>Preferences</h3>
                <p>Notification and app preferences coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerProfile
