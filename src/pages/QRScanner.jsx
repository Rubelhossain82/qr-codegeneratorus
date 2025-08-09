import { useState, useRef, useCallback } from 'react'
import { Upload, Scan, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Camera, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import QrScanner from 'qr-scanner'
import { Link } from 'react-router-dom'
import './QRScanner.css'

function QRScanner() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, BMP, WebP)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError(null)
    setScanResult(null)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Auto-scan the image
    scanImage(file)
  }, [])

  // Scan QR code from image
  const scanImage = async (file) => {
    setIsScanning(true)
    setError(null)

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
        highlightScanRegion: false,
        highlightCodeOutline: false,
      })

      setScanResult({
        data: result.data,
        format: result.format || 'QR Code',
        cornerPoints: result.cornerPoints
      })

      toast.success('QR code scanned successfully!')
    } catch (err) {
      console.error('QR scan error:', err)
      setError('No QR code found in the image. Please try with a clearer image.')
      setScanResult(null)
    } finally {
      setIsScanning(false)
    }
  }

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Copy result to clipboard
  const copyToClipboard = async () => {
    if (!scanResult?.data) return

    try {
      await navigator.clipboard.writeText(scanResult.data)
      toast.success('Copied to clipboard!')
    } catch (err) {
      console.error('Copy failed:', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  // Reset scanner
  const resetScanner = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setScanResult(null)
    setError(null)
    setIsScanning(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Generate QR code from scanned result
  const generateQRFromResult = () => {
    if (!scanResult?.data) return
    
    // Navigate to QR generator with the scanned data
    const encodedData = encodeURIComponent(scanResult.data)
    window.open(`/qr-generator?data=${encodedData}`, '_blank')
  }

  return (
    <div className="generator-page qr-scanner-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              QR Code Scanner From Image
            </h1>
            <p className="page-subtitle">
              Upload an image containing a QR code and instantly decode its content.
              No registration required - scan QR codes from photos and screenshots.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="scanner-layout">
          {/* Upload Section */}
          <div className="upload-section">
            <div className="upload-card">
              <h2>Upload QR Code Image</h2>
              
              {/* Drag and Drop Zone */}
              <div
                ref={dropZoneRef}
                className={`drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />

                {!selectedFile ? (
                  <div className="drop-zone-content">
                    <Upload className="drop-icon" size={48} />
                    <h3>Drop your QR code image here</h3>
                    <p>or click to browse files</p>
                    <div className="supported-formats">
                      <span>Supports: JPG, PNG, GIF, BMP, WebP</span>
                      <span>Max size: 10MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="file-preview">
                    <img src={previewUrl} alt="QR Code Preview" className="preview-image" />
                    <div className="file-info">
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="upload-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                >
                  <ImageIcon size={16} />
                  Choose Image
                </button>
                
                {selectedFile && (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => scanImage(selectedFile)}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw size={16} className="spinning" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Scan size={16} />
                          Scan Again
                        </>
                      )}
                    </button>
                    
                    <button
                      className="btn btn-outline"
                      onClick={resetScanner}
                      disabled={isScanning}
                    >
                      <RefreshCw size={16} />
                      Reset
                    </button>
                  </>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="results-section">
            <div className="results-card">
              <h2>Scan Results</h2>
              
              {!scanResult && !isScanning && !error && (
                <div className="empty-state">
                  <Camera size={48} />
                  <h3>No QR code scanned yet</h3>
                  <p>Upload an image containing a QR code to see the decoded content here.</p>
                </div>
              )}

              {isScanning && (
                <div className="scanning-state">
                  <RefreshCw size={48} className="spinning" />
                  <h3>Scanning QR code...</h3>
                  <p>Please wait while we decode your image.</p>
                </div>
              )}

              {scanResult && (
                <div className="scan-success">
                  <div className="success-header">
                    <CheckCircle size={24} className="success-icon" />
                    <h3>QR Code Found!</h3>
                  </div>
                  
                  <div className="result-details">
                    <div className="result-item">
                      <label>Format:</label>
                      <span className="format-badge">{scanResult.format}</span>
                    </div>
                    
                    <div className="result-item">
                      <label>Content:</label>
                      <div className="content-display">
                        <textarea
                          value={scanResult.data}
                          readOnly
                          className="content-textarea"
                          rows={Math.min(Math.max(scanResult.data.split('\n').length, 3), 8)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="result-actions">
                    <button
                      className="btn btn-primary"
                      onClick={copyToClipboard}
                    >
                      <Copy size={16} />
                      Copy Content
                    </button>
                    
                    <button
                      className="btn btn-secondary"
                      onClick={generateQRFromResult}
                    >
                      <Download size={16} />
                      Generate QR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="seo-content-section">
          <div className="seo-content">
            <div className="seo-grid">
              <div className="seo-article">
                <h2>How to Use Our QR Code Scanner From Image</h2>
                <p>
                  Our free QR code scanner from image tool allows you to quickly decode QR codes from any image file.
                  Simply upload your image containing a QR code, and our advanced scanner will instantly extract and
                  display the encoded information. No registration required!
                </p>

                <h3>Step-by-Step Guide:</h3>
                <ol>
                  <li><strong>Upload Your Image:</strong> Click "Choose Image" or drag and drop your QR code image</li>
                  <li><strong>Automatic Scanning:</strong> Our tool automatically scans the uploaded image</li>
                  <li><strong>View Results:</strong> See the decoded content instantly displayed</li>
                  <li><strong>Copy or Generate:</strong> Copy the content or generate a new QR code</li>
                </ol>

                <h3>Supported Image Formats</h3>
                <p>
                  Our QR code image scanner supports all major image formats including JPG, PNG, GIF, BMP, and WebP.
                  You can upload images up to 10MB in size for optimal scanning performance.
                </p>
              </div>

              <div className="seo-article">
                <h2>Why Use Our QR Code Scanner?</h2>
                <ul>
                  <li><strong>Free & No Registration:</strong> Completely free to use with no account required</li>
                  <li><strong>Privacy Protected:</strong> Images are processed locally - never stored on our servers</li>
                  <li><strong>Fast & Accurate:</strong> Advanced scanning technology for quick results</li>
                  <li><strong>Multiple Formats:</strong> Supports QR codes, Data Matrix, and other 2D barcodes</li>
                  <li><strong>Mobile Friendly:</strong> Works perfectly on all devices and screen sizes</li>
                </ul>

                <h3>Common Use Cases</h3>
                <p>
                  Perfect for scanning QR codes from screenshots, photos, business cards, flyers, websites,
                  and any other image source. Ideal for accessing WiFi passwords, contact information,
                  website URLs, product details, and more.
                </p>

                <h3>QR Code Scanner Features</h3>
                <p>
                  Our scanner can decode various types of QR codes including URLs, text, WiFi credentials,
                  contact information (vCard), email addresses, phone numbers, SMS messages, and custom data formats.
                </p>
              </div>
            </div>

            <div className="seo-footer">
              <h2>Free QR Code Scanner - No Download Required</h2>
              <p>
                Scan QR codes from images online without downloading any software. Our web-based QR code scanner
                works directly in your browser, making it the perfect tool for quickly decoding QR codes from
                any image file. Whether you need to scan a QR code from a screenshot, photo, or saved image,
                our tool provides instant results with maximum privacy and security.
              </p>

              <div className="related-tools">
                <h3>Related Tools</h3>
                <div className="tool-links">
                  <Link to="/qr-generator" className="tool-link">QR Code Generator</Link>
                  <Link to="/barcode-generator" className="tool-link">Barcode Generator</Link>
                  <Link to="/wifi-generator" className="tool-link">WiFi QR Generator</Link>
                  <Link to="/vcard-generator" className="tool-link">vCard QR Generator</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
