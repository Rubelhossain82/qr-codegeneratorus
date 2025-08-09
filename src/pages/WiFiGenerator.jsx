import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Share2, Wifi, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../lib/supabase'

function WiFiGenerator() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false
  })

  const [showPassword, setShowPassword] = useState(false)

  const [qrSettings, setQrSettings] = useState({
    size: 256,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'M'
  })

  const qrRef = useRef(null)

  const generateWiFiString = () => {
    const { ssid, password, security, hidden } = formData
    
    if (!ssid) return ''
    
    let wifiString = `WIFI:T:${security};S:${ssid};`
    
    if (password && security !== 'nopass') {
      wifiString += `P:${password};`
    }
    
    if (hidden) {
      wifiString += 'H:true;'
    }
    
    wifiString += ';'
    
    return wifiString
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
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

  // Save WiFi QR generation to database
  const saveWiFiQRGeneration = async () => {
    if (!user) return // Only save for authenticated users

    try {
      const wifiData = generateWiFiString()
      const settings = {
        size: qrSettings.size,
        colors: { foreground: qrSettings.fgColor, background: qrSettings.bgColor },
        format: 'png',
        level: qrSettings.level,
        ssid: formData.ssid,
        security: formData.security,
        hidden: formData.hidden
      }

      await dbHelpers.saveQRHistory(user.id, wifiData, 'wifi', settings)
    } catch (error) {
      console.error('Error saving WiFi QR generation:', error)
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
      link.download = `wifi-${formData.ssid || 'network'}-qr.png`
      link.href = canvas.toDataURL()
      link.click()

      // Save to database
      await saveWiFiQRGeneration()

      toast.success('WiFi QR code downloaded successfully!')
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateWiFiString())
      toast.success('WiFi data copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WiFi QR Code',
          text: `WiFi Network: ${formData.ssid}`,
          url: window.location.href
        })
      } catch (err) {
        toast.error('Failed to share')
      }
    } else {
      copyToClipboard()
    }
  }

  const wifiData = generateWiFiString()
  const hasRequiredData = formData.ssid

  const getSecurityIcon = () => {
    switch (formData.security) {
      case 'WPA':
      case 'WPA2':
      case 'WEP':
        return <Lock size={16} />
      default:
        return <Shield size={16} />
    }
  }

  return (
    <div className="generator-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>WiFi QR Code Generator</h1>
            <p>Create QR codes for WiFi networks that allow instant connection without typing passwords. Perfect for guests, customers, and easy network sharing.</p>
          </div>
        </div>

        <div className="generator-layout">
          {/* Input Panel */}
          <div className="input-panel">
            <div className="panel-header">
              <Wifi size={24} />
              <h2>WiFi Network Details</h2>
            </div>

            <div className="form-grid">
              {/* Network Information */}
              <div className="form-section">
                <h3>Network Configuration</h3>
                
                <div className="form-group">
                  <label htmlFor="ssid">Network Name (SSID) *</label>
                  <input
                    type="text"
                    id="ssid"
                    name="ssid"
                    value={formData.ssid}
                    onChange={handleInputChange}
                    placeholder="Enter WiFi network name"
                    required
                  />
                  <small>The name of your WiFi network as it appears in device lists</small>
                </div>

                <div className="form-group">
                  <label htmlFor="security">Security Type</label>
                  <select
                    id="security"
                    name="security"
                    value={formData.security}
                    onChange={handleInputChange}
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No Password (Open)</option>
                  </select>
                  <small>Choose the security protocol used by your network</small>
                </div>

                {formData.security !== 'nopass' && (
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter WiFi password"
                        className="password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <small>The password required to connect to your network</small>
                  </div>
                )}

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hidden"
                      checked={formData.hidden}
                      onChange={handleInputChange}
                    />
                    <div className="checkmark"></div>
                    Hidden Network
                  </label>
                  <small>Check this if your network doesn't broadcast its name (SSID)</small>
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

              {/* Usage Instructions */}
              <div className="form-section">
                <h3>How to Use</h3>
                <div className="usage-instructions">
                  <div className="instruction-item">
                    <div className="instruction-number">1</div>
                    <div className="instruction-text">
                      <strong>Generate QR Code:</strong> Fill in your WiFi network details above
                    </div>
                  </div>
                  <div className="instruction-item">
                    <div className="instruction-number">2</div>
                    <div className="instruction-text">
                      <strong>Print or Display:</strong> Download and print the QR code or display it on screen
                    </div>
                  </div>
                  <div className="instruction-item">
                    <div className="instruction-number">3</div>
                    <div className="instruction-text">
                      <strong>Scan to Connect:</strong> Guests can scan with their phone camera to connect instantly
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="panel-header">
              <Wifi size={24} />
              <h2>WiFi QR Preview</h2>
            </div>

            {hasRequiredData ? (
              <div className="qr-preview">
                <div className="qr-container" ref={qrRef}>
                  <QRCodeSVG
                    value={wifiData}
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

                {/* Network Details Preview */}
                <div className="network-details">
                  <h3>Network Information</h3>
                  <div className="detail-item">
                    <strong>Network Name:</strong>
                    <span>{formData.ssid}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Security:</strong>
                    <span className="security-type">
                      {getSecurityIcon()}
                      {formData.security === 'nopass' ? 'Open (No Password)' : formData.security}
                    </span>
                  </div>
                  {formData.password && formData.security !== 'nopass' && (
                    <div className="detail-item">
                      <strong>Password:</strong>
                      <span className="password-display">
                        {showPassword ? formData.password : '••••••••'}
                      </span>
                    </div>
                  )}
                  {formData.hidden && (
                    <div className="detail-item">
                      <strong>Visibility:</strong>
                      <span>Hidden Network</span>
                    </div>
                  )}
                </div>

                <div className="qr-info">
                  <p><strong>Compatibility:</strong> iOS 11+, Android 10+, and most modern devices</p>
                  <p><strong>Usage:</strong> Point camera at QR code and tap the WiFi notification</p>
                  <p><strong>Security:</strong> QR code contains network credentials - share responsibly</p>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <Wifi size={64} />
                <h3>Enter Network Details</h3>
                <p>Fill in your WiFi network name (SSID) to generate your WiFi QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WiFiGenerator
