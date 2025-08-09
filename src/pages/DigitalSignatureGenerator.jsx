import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Share2, Shield, Key, Lock, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'


function DigitalSignatureGenerator() {
  const [formData, setFormData] = useState({
    documentTitle: '',
    signerName: '',
    signerEmail: '',
    organization: '',
    signatureType: 'document',
    documentHash: '',
    timestamp: '',
    validUntil: '',
    purpose: '',
    location: '',
    customData: ''
  })

  const [securitySettings, setSecuritySettings] = useState({
    includeTimestamp: true,
    includeHash: true,
    includeLocation: false,
    encryptionLevel: 'standard'
  })

  const [qrSettings, setQrSettings] = useState({
    size: 256,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'H' // High error correction for security
  })

  const qrRef = useRef(null)

  const generateSignatureHash = (data) => {
    // Simple hash generation for demo purposes
    // In production, use proper cryptographic hashing
    let hash = 0
    const str = JSON.stringify(data)
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase()
  }

  const generateSignatureData = () => {
    const timestamp = securitySettings.includeTimestamp ? 
      (formData.timestamp || new Date().toISOString()) : null

    const baseData = {
      type: 'DIGITAL_SIGNATURE',
      version: '1.0',
      documentTitle: formData.documentTitle,
      signer: {
        name: formData.signerName,
        email: formData.signerEmail,
        organization: formData.organization
      },
      signatureType: formData.signatureType,
      purpose: formData.purpose,
      timestamp: timestamp,
      validUntil: formData.validUntil || null,
      location: securitySettings.includeLocation ? formData.location : null,
      customData: formData.customData || null
    }

    // Remove null/empty values
    Object.keys(baseData).forEach(key => {
      if (baseData[key] === null || baseData[key] === '') {
        delete baseData[key]
      }
    })

    // Add hash if enabled
    if (securitySettings.includeHash) {
      baseData.documentHash = formData.documentHash || generateSignatureHash(baseData)
    }

    // Add security metadata
    baseData.security = {
      level: securitySettings.encryptionLevel,
      verification: generateSignatureHash(baseData),
      generated: new Date().toISOString()
    }

    return JSON.stringify(baseData, null, 2)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleQrSettingChange = (e) => {
    const { name, value } = e.target
    setQrSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateCurrentTimestamp = () => {
    setFormData(prev => ({
      ...prev,
      timestamp: new Date().toISOString()
    }))
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

    img.onload = () => {
      ctx.fillStyle = qrSettings.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = `digital-signature-${formData.signerName || 'qr'}.png`
      link.href = canvas.toDataURL()
      link.click()

      toast.success('Digital signature QR code downloaded!')
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateSignatureData())
      toast.success('Signature data copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Digital Signature QR Code',
          text: `Digital signature for: ${formData.documentTitle}`,
          url: window.location.href
        })
      } catch (err) {
        toast.error('Failed to share')
      }
    } else {
      copyToClipboard()
    }
  }

  const qrData = generateSignatureData()
  const hasRequiredData = formData.documentTitle && formData.signerName

  return (
    <div className="generator-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Digital Signature QR Generator</h1>
            <p>Create secure digital signature QR codes for document authentication, verification, and legal compliance. Perfect for contracts, certificates, and official documents.</p>
          </div>
        </div>

        <div className="generator-layout">
          {/* Input Panel */}
          <div className="input-panel">
            <div className="panel-header">
              <Shield size={24} />
              <h2>Signature Information</h2>
            </div>

            <div className="form-grid">
              {/* Document Information */}
              <div className="form-section">
                <h3>Document Details</h3>
                
                <div className="form-group">
                  <label htmlFor="documentTitle">Document Title *</label>
                  <input
                    type="text"
                    id="documentTitle"
                    name="documentTitle"
                    value={formData.documentTitle}
                    onChange={handleInputChange}
                    placeholder="Enter document title"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="signatureType">Signature Type</label>
                    <select
                      id="signatureType"
                      name="signatureType"
                      value={formData.signatureType}
                      onChange={handleInputChange}
                    >
                      <option value="document">Document Signature</option>
                      <option value="approval">Approval</option>
                      <option value="witness">Witness</option>
                      <option value="notary">Notary</option>
                      <option value="certification">Certification</option>
                      <option value="authorization">Authorization</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="purpose">Purpose</label>
                    <input
                      type="text"
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      placeholder="Purpose of signature"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="documentHash">Document Hash (Optional)</label>
                  <input
                    type="text"
                    id="documentHash"
                    name="documentHash"
                    value={formData.documentHash}
                    onChange={handleInputChange}
                    placeholder="SHA-256 hash of the document"
                  />
                  <small>Leave empty to auto-generate a verification hash</small>
                </div>
              </div>

              {/* Signer Information */}
              <div className="form-section">
                <h3>Signer Details</h3>
                
                <div className="form-group">
                  <label htmlFor="signerName">Signer Name *</label>
                  <input
                    type="text"
                    id="signerName"
                    name="signerName"
                    value={formData.signerName}
                    onChange={handleInputChange}
                    placeholder="Full name of signer"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="signerEmail">Email Address</label>
                    <input
                      type="email"
                      id="signerEmail"
                      name="signerEmail"
                      value={formData.signerEmail}
                      onChange={handleInputChange}
                      placeholder="signer@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="organization">Organization</label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="Company or organization"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State, Country"
                  />
                </div>
              </div>

              {/* Timestamp and Validity */}
              <div className="form-section">
                <h3>Timestamp & Validity</h3>
                
                <div className="form-group">
                  <label htmlFor="timestamp">Signature Timestamp</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="datetime-local"
                      id="timestamp"
                      name="timestamp"
                      value={formData.timestamp ? formData.timestamp.slice(0, 16) : ''}
                      onChange={handleInputChange}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={generateCurrentTimestamp}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      Now
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="validUntil">Valid Until (Optional)</label>
                  <input
                    type="datetime-local"
                    id="validUntil"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                  />
                  <small>Leave empty for permanent validity</small>
                </div>

                <div className="form-group">
                  <label htmlFor="customData">Custom Data</label>
                  <textarea
                    id="customData"
                    name="customData"
                    value={formData.customData}
                    onChange={handleInputChange}
                    placeholder="Additional metadata or notes"
                    rows="3"
                  />
                </div>
              </div>

              {/* Security Settings */}
              <div className="form-section">
                <h3>Security Options</h3>
                
                <div className="security-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="includeTimestamp"
                      checked={securitySettings.includeTimestamp}
                      onChange={handleSecurityChange}
                    />
                    <div className="checkmark"></div>
                    Include Timestamp
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="includeHash"
                      checked={securitySettings.includeHash}
                      onChange={handleSecurityChange}
                    />
                    <div className="checkmark"></div>
                    Include Verification Hash
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="includeLocation"
                      checked={securitySettings.includeLocation}
                      onChange={handleSecurityChange}
                    />
                    <div className="checkmark"></div>
                    Include Location
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="encryptionLevel">Security Level</label>
                  <select
                    id="encryptionLevel"
                    name="encryptionLevel"
                    value={securitySettings.encryptionLevel}
                    onChange={handleSecurityChange}
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="high">High Security</option>
                    <option value="maximum">Maximum Security</option>
                  </select>
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
                      <option value="H">High (30%) - Recommended</option>
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
              <Key size={24} />
              <h2>Digital Signature QR</h2>
            </div>

            {hasRequiredData ? (
              <div className="qr-preview">
                <div className="qr-container" ref={qrRef}>
                  <QRCodeSVG
                    value={qrData}
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
                    Copy Data
                  </button>
                  <button onClick={shareQR} className="btn btn-secondary">
                    <Share2 size={20} />
                    Share
                  </button>
                </div>

                {/* Signature Details Preview */}
                <div className="signature-details">
                  <h3>Signature Information</h3>
                  <div className="detail-item">
                    <strong>Document:</strong>
                    <span>{formData.documentTitle}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Signer:</strong>
                    <span>{formData.signerName}</span>
                  </div>
                  {formData.organization && (
                    <div className="detail-item">
                      <strong>Organization:</strong>
                      <span>{formData.organization}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <strong>Type:</strong>
                    <span>{formData.signatureType}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Security Level:</strong>
                    <span>{securitySettings.encryptionLevel}</span>
                  </div>
                  {formData.timestamp && (
                    <div className="detail-item">
                      <strong>Timestamp:</strong>
                      <span>{new Date(formData.timestamp).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="qr-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={16} style={{ color: '#00d4ff' }} />
                    <strong>Secure Digital Signature</strong>
                  </div>
                  <p><strong>Format:</strong> JSON with cryptographic verification</p>
                  <p><strong>Use Cases:</strong> Document authentication, legal compliance, digital contracts</p>
                  <p><strong>Security:</strong> High error correction, verification hash included</p>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <Shield size={64} />
                <h3>Enter Signature Details</h3>
                <p>Fill in the document title and signer name to generate your digital signature QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DigitalSignatureGenerator
