import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Share2, CreditCard, User, Mail, Phone, Building, MapPin, Globe } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../lib/supabase'

function VCardGenerator() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    note: ''
  })

  const [qrSettings, setQrSettings] = useState({
    size: 256,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'M'
  })

  const qrRef = useRef(null)

  const generateVCard = () => {
    let vcard = 'BEGIN:VCARD\n'
    vcard += 'VERSION:3.0\n'
    
    if (formData.firstName || formData.lastName) {
      vcard += `FN:${formData.firstName} ${formData.lastName}\n`
      vcard += `N:${formData.lastName};${formData.firstName};;;\n`
    }
    
    if (formData.organization) {
      vcard += `ORG:${formData.organization}\n`
    }
    
    if (formData.title) {
      vcard += `TITLE:${formData.title}\n`
    }
    
    if (formData.phone) {
      vcard += `TEL:${formData.phone}\n`
    }
    
    if (formData.email) {
      vcard += `EMAIL:${formData.email}\n`
    }
    
    if (formData.website) {
      vcard += `URL:${formData.website}\n`
    }
    
    if (formData.address || formData.city || formData.state || formData.zipCode || formData.country) {
      vcard += `ADR:;;${formData.address};${formData.city};${formData.state};${formData.zipCode};${formData.country}\n`
    }
    
    if (formData.note) {
      vcard += `NOTE:${formData.note}\n`
    }
    
    vcard += 'END:VCARD'
    
    return vcard
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQrSettingChange = (e) => {
    const { name, value } = e.target
    setQrSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Save vCard QR generation to database
  const saveVCardQRGeneration = async () => {
    if (!user) return // Only save for authenticated users

    try {
      const vcardData = generateVCard()
      const settings = {
        size: qrSettings.size,
        colors: { foreground: qrSettings.fgColor, background: qrSettings.bgColor },
        format: 'png',
        level: qrSettings.level,
        contactInfo: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          organization: formData.organization,
          title: formData.title,
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        }
      }

      await dbHelpers.saveQRHistory(user.id, vcardData, 'vcard', settings)
    } catch (error) {
      console.error('Error saving vCard QR generation:', error)
    }
  }

  const downloadQR = () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to download QR codes')
      window.location.href = '/login'
      return
    }

    const svg = qrRef.current.querySelector('svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = document.createElement('img')

    canvas.width = qrSettings.size
    canvas.height = qrSettings.size

    img.onload = async () => {
      ctx.fillStyle = qrSettings.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = `vcard-${formData.firstName || 'contact'}-${formData.lastName || 'qr'}.png`
      link.href = canvas.toDataURL()
      link.click()

      // Save to database
      await saveVCardQRGeneration()

      toast.success('vCard QR code downloaded successfully!')
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateVCard())
      toast.success('vCard data copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'vCard QR Code',
          text: `Contact: ${formData.firstName} ${formData.lastName}`,
          url: window.location.href
        })
      } catch (err) {
        toast.error('Failed to share')
      }
    } else {
      copyToClipboard()
    }
  }

  const vCardData = generateVCard()
  const hasRequiredData = formData.firstName || formData.lastName || formData.email || formData.phone

  return (
    <div className="generator-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>vCard QR Code Generator</h1>
            <p>Create QR codes for contact information that can be easily scanned and saved to address books. Perfect for business cards, networking, and contact sharing.</p>
          </div>
        </div>

        <div className="generator-layout">
          {/* Input Panel */}
          <div className="input-panel">
            <div className="panel-header">
              <CreditCard size={24} />
              <h2>Contact Information</h2>
            </div>

            <div className="form-grid">
              {/* Personal Information */}
              <div className="form-section">
                <h3>Personal Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="organization">Organization</label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">Job Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="form-section">
                <h3>Address</h3>
                
                <div className="form-group">
                  <label htmlFor="address">Street Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="United States"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="note">Note</label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Additional notes or information"
                    rows="3"
                  />
                </div>
              </div>

              {/* QR Code Settings */}
              <div className="form-section">
                <h3>QR Code Settings</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="size">Size (px)</label>
                    <input
                      type="range"
                      id="size"
                      name="size"
                      min="128"
                      max="512"
                      value={qrSettings.size}
                      onChange={handleQrSettingChange}
                      className="range-slider"
                    />
                    <small>{qrSettings.size}px</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="level">Error Correction</label>
                    <select
                      id="level"
                      name="level"
                      value={qrSettings.level}
                      onChange={handleQrSettingChange}
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fgColor">Foreground Color</label>
                    <input
                      type="color"
                      id="fgColor"
                      name="fgColor"
                      value={qrSettings.fgColor}
                      onChange={handleQrSettingChange}
                      className="color-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bgColor">Background Color</label>
                    <input
                      type="color"
                      id="bgColor"
                      name="bgColor"
                      value={qrSettings.bgColor}
                      onChange={handleQrSettingChange}
                      className="color-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="panel-header">
              <User size={24} />
              <h2>vCard QR Preview</h2>
            </div>

            {hasRequiredData ? (
              <div className="qr-preview">
                <div className="qr-container" ref={qrRef}>
                  <QRCodeSVG
                    value={vCardData}
                    size={qrSettings.size}
                    bgColor={qrSettings.bgColor}
                    fgColor={qrSettings.fgColor}
                    level={qrSettings.level}
                    includeMargin={true}
                  />
                </div>

                <div className="qr-actions">
                  <button onClick={downloadQR} className="btn btn-primary">
                    <Download size={20} />
                    Download
                  </button>
                  <button onClick={copyToClipboard} className="btn btn-secondary">
                    <Copy size={20} />
                    Copy vCard
                  </button>
                  <button onClick={shareQR} className="btn btn-secondary">
                    <Share2 size={20} />
                    Share
                  </button>
                </div>

                {/* Contact Preview */}
                <div className="contact-preview">
                  <h3>Contact Information</h3>
                  {(formData.firstName || formData.lastName) && (
                    <div className="detail-item">
                      <strong>Name:</strong>
                      <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                  )}
                  {formData.organization && (
                    <div className="detail-item">
                      <strong>Organization:</strong>
                      <span>{formData.organization}</span>
                    </div>
                  )}
                  {formData.title && (
                    <div className="detail-item">
                      <strong>Title:</strong>
                      <span>{formData.title}</span>
                    </div>
                  )}
                  {formData.phone && (
                    <div className="detail-item">
                      <strong>Phone:</strong>
                      <span>{formData.phone}</span>
                    </div>
                  )}
                  {formData.email && (
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{formData.email}</span>
                    </div>
                  )}
                  {formData.website && (
                    <div className="detail-item">
                      <strong>Website:</strong>
                      <span>{formData.website}</span>
                    </div>
                  )}
                </div>

                <div className="qr-info">
                  <p><strong>Format:</strong> vCard 3.0 standard</p>
                  <p><strong>Compatible:</strong> All smartphones and contact apps</p>
                  <p><strong>Use Cases:</strong> Business cards, networking events, contact sharing</p>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <CreditCard size={64} />
                <h3>Enter Contact Details</h3>
                <p>Fill in at least a name, email, or phone number to generate your vCard QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VCardGenerator
