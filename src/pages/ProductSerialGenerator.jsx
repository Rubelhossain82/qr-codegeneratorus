import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Share2, Package, Hash, Calendar, Building, MapPin, User } from 'lucide-react'
import { toast } from 'react-toastify'


function ProductSerialGenerator() {
  const [formData, setFormData] = useState({
    productName: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    category: '',
    description: '',
    website: '',
    supportEmail: '',
    warrantyPeriod: '',
    location: ''
  })

  const [qrSettings, setQrSettings] = useState({
    size: 256,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'M'
  })

  const qrRef = useRef(null)

  const generateSerialData = () => {
    const data = {
      type: 'PRODUCT_SERIAL',
      productName: formData.productName,
      serialNumber: formData.serialNumber,
      manufacturer: formData.manufacturer,
      model: formData.model,
      batchNumber: formData.batchNumber,
      manufacturingDate: formData.manufacturingDate,
      expiryDate: formData.expiryDate,
      category: formData.category,
      description: formData.description,
      website: formData.website,
      supportEmail: formData.supportEmail,
      warrantyPeriod: formData.warrantyPeriod,
      location: formData.location,
      timestamp: new Date().toISOString()
    }

    // Remove empty fields
    Object.keys(data).forEach(key => {
      if (!data[key] || data[key] === '') {
        delete data[key]
      }
    })

    return JSON.stringify(data)
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

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    canvas.width = qrSettings.size
    canvas.height = qrSettings.size
    
    img.onload = () => {
      ctx.fillStyle = qrSettings.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      const link = document.createElement('a')
      link.download = `product-serial-${formData.serialNumber || 'qr'}.png`
      link.href = canvas.toDataURL()
      link.click()
      
      toast.success('QR code downloaded successfully!')
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateSerialData())
      toast.success('Product data copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Product Serial QR Code',
          text: `Product: ${formData.productName}\nSerial: ${formData.serialNumber}`,
          url: window.location.href
        })
      } catch (err) {
        toast.error('Failed to share')
      }
    } else {
      copyToClipboard()
    }
  }

  const qrData = generateSerialData()
  const hasRequiredData = formData.productName && formData.serialNumber

  return (
    <div className="generator-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Product Serial Number QR Generator</h1>
            <p>Create QR codes for product identification, tracking, and authentication. Perfect for inventory management, warranty tracking, and anti-counterfeiting.</p>
          </div>
        </div>

        <div className="generator-layout">
          {/* Input Panel */}
          <div className="input-panel">
            <div className="panel-header">
              <Package size={24} />
              <h2>Product Information</h2>
            </div>

            <div className="form-grid">
              {/* Basic Product Info */}
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="productName">Product Name *</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number *</label>
                    <input
                      type="text"
                      id="serialNumber"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="Enter serial number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="model">Model</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Product model"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="manufacturer">Manufacturer</label>
                    <input
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="Manufacturer name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Medical">Medical</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Consumer Goods">Consumer Goods</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Pharmaceutical">Pharmaceutical</option>
                      <option value="Textile">Textile</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Manufacturing Details */}
              <div className="form-section">
                <h3>Manufacturing Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="batchNumber">Batch Number</label>
                    <input
                      type="text"
                      id="batchNumber"
                      name="batchNumber"
                      value={formData.batchNumber}
                      onChange={handleInputChange}
                      placeholder="Batch/Lot number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Manufacturing Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="manufacturingDate">Manufacturing Date</label>
                    <input
                      type="date"
                      id="manufacturingDate"
                      name="manufacturingDate"
                      value={formData.manufacturingDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section">
                <h3>Additional Information</h3>
                
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Product description or notes"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://company.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="supportEmail">Support Email</label>
                    <input
                      type="email"
                      id="supportEmail"
                      name="supportEmail"
                      value={formData.supportEmail}
                      onChange={handleInputChange}
                      placeholder="support@company.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="warrantyPeriod">Warranty Period</label>
                  <input
                    type="text"
                    id="warrantyPeriod"
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 years, 24 months"
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
              <Hash size={24} />
              <h2>QR Code Preview</h2>
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

                {/* Product Details Preview */}
                <div className="product-details">
                  <h3>Product Information</h3>
                  <div className="detail-item">
                    <strong>Product:</strong>
                    <span>{formData.productName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Serial:</strong>
                    <span>{formData.serialNumber}</span>
                  </div>
                  {formData.manufacturer && (
                    <div className="detail-item">
                      <strong>Manufacturer:</strong>
                      <span>{formData.manufacturer}</span>
                    </div>
                  )}
                  {formData.model && (
                    <div className="detail-item">
                      <strong>Model:</strong>
                      <span>{formData.model}</span>
                    </div>
                  )}
                  {formData.category && (
                    <div className="detail-item">
                      <strong>Category:</strong>
                      <span>{formData.category}</span>
                    </div>
                  )}
                  {formData.manufacturingDate && (
                    <div className="detail-item">
                      <strong>Manufactured:</strong>
                      <span>{new Date(formData.manufacturingDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="qr-info">
                  <p><strong>Data Format:</strong> JSON with product identification</p>
                  <p><strong>Use Cases:</strong> Inventory tracking, warranty verification, anti-counterfeiting</p>
                  <p><strong>Compatible:</strong> All QR code scanners and mobile apps</p>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <Package size={64} />
                <h3>Enter Product Details</h3>
                <p>Fill in the product name and serial number to generate your QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductSerialGenerator
