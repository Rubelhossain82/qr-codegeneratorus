import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { ChromePicker } from 'react-color'
import { Download, QrCode, Palette, Type, Image, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../lib/supabase'
import { cloudinaryHelpers, testCloudinaryConfig } from '../lib/cloudinary'
import { uploadToCloudinary } from '../lib/cloudinary-simple'
import ImageUpload from '../components/common/ImageUpload'

function QRCodeGenerator() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [qrData, setQrData] = useState('https://generatorus.com') // Default QR data
  const [qrColor, setQrColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [qrSize, setQrSize] = useState(300)
  const [customWidth, setCustomWidth] = useState(300)
  const [customHeight, setCustomHeight] = useState(300)
  const [useCustomSize, setUseCustomSize] = useState(false)
  // Default logo for testing
  const defaultLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPgo8L3N2Zz4KPC9zdmc+'

  const [logo, setLogo] = useState(defaultLogo) // Start with default logo
  const [logoUrl, setLogoUrl] = useState(null) // Cloudinary URL
  const [logoPosition, setLogoPosition] = useState('center')
  const [logoSize, setLogoSize] = useState(50) // Percentage of QR code size - default 50%
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState('png')
  const [downloadQuality, setDownloadQuality] = useState(1.0)

  const canvasRef = useRef(null)


  // Fixed preview size for consistent UI
  const PREVIEW_SIZE = 300

  const generateQRCode = async () => {
    if (!qrData?.trim()) {
      setQrCodeUrl('')
      return
    }

    try {
      console.log('Starting QR code generation...', { qrData, logo })

      // Step 1: Generate basic QR code
      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        margin: 2,
        color: { dark: qrColor, light: bgColor },
        errorCorrectionLevel: 'H'
      })

      console.log('Basic QR code generated')

      // Step 2: If no logo, just show QR code
      if (!logo) {
        console.log('No logo, showing basic QR code')
        setQrCodeUrl(qrDataURL)
        return
      }

      console.log('Adding logo to QR code...', logo)

      // Step 3: Create canvas and add logo with proper promise handling
      const canvas = document.createElement('canvas')
      canvas.width = PREVIEW_SIZE
      canvas.height = PREVIEW_SIZE
      const ctx = canvas.getContext('2d')

      // Use Promise-based approach for better error handling
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous' // Handle CORS for Cloudinary images
          img.onload = () => resolve(img)
          img.onerror = (error) => {
            console.error('Image load error:', error)
            reject(new Error(`Failed to load image: ${src}`))
          }
          img.src = src
        })
      }

      try {
        // Load QR code image
        const qrImg = await loadImage(qrDataURL)
        console.log('QR image loaded successfully')

        // Draw QR code
        ctx.drawImage(qrImg, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE)

        // Load and draw logo
        const logoImg = await loadImage(logo)
        console.log('Logo image loaded successfully')

        // Calculate logo size - use dynamic logoSize state
        const logoSizePixels = (PREVIEW_SIZE * logoSize) / 100 // Use logoSize state
        const x = (PREVIEW_SIZE - logoSizePixels) / 2
        const y = (PREVIEW_SIZE - logoSizePixels) / 2

        // Draw white background circle for logo
        const centerX = PREVIEW_SIZE / 2
        const centerY = PREVIEW_SIZE / 2
        const radius = logoSizePixels / 2 + 15 // Slightly larger padding

        ctx.fillStyle = bgColor
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fill()

        // Add border around logo background
        ctx.strokeStyle = qrColor
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw logo
        ctx.drawImage(logoImg, x, y, logoSizePixels, logoSizePixels)

        // Update preview
        const finalDataURL = canvas.toDataURL('image/png')
        console.log('QR code with logo generated successfully')
        setQrCodeUrl(finalDataURL)

      } catch (logoError) {
        console.error('Error adding logo to QR code:', logoError)
        // Fallback to QR without logo
        console.log('Falling back to QR code without logo')
        setQrCodeUrl(qrDataURL)
      }

    } catch (error) {
      console.error('Error generating QR code:', error)
      setQrCodeUrl('')
    }
  }





  // Generate QR code at actual export size for download
  const generateDownloadQRCode = async () => {
    try {
      console.log('Generating download QR code...')

      // Create a temporary canvas for download
      const downloadCanvas = document.createElement('canvas')
      const finalWidth = useCustomSize ? customWidth : qrSize
      const finalHeight = useCustomSize ? customHeight : qrSize

      downloadCanvas.width = finalWidth
      downloadCanvas.height = finalHeight

      const ctx = downloadCanvas.getContext('2d')

      // Generate QR code at actual export size
      await QRCode.toCanvas(downloadCanvas, qrData, {
        width: finalWidth,
        height: finalHeight,
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor
        },
        errorCorrectionLevel: 'H' // High error correction for logo overlay
      })

      console.log('Base QR code generated')

      // Add logo if provided
      if (logo) {
        console.log('Adding logo to download QR code...')
        return new Promise((resolve, reject) => {
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous' // Handle CORS issues

          logoImg.onload = () => {
            try {
              console.log('Logo loaded for download, processing...')

              // Calculate logo size (smaller for better QR code readability)
              const logoSizePixels = Math.min((finalWidth * logoSize) / 100, finalWidth * 0.25)

              // Position logo exactly in the center
              const logoX = (finalWidth - logoSizePixels) / 2
              const logoY = (finalHeight - logoSizePixels) / 2

              // Create a circular white background for the logo
              const centerX = finalWidth / 2
              const centerY = finalHeight / 2
              const radius = logoSizePixels / 2 + (finalWidth > 300 ? 8 : 4)

              ctx.fillStyle = bgColor
              ctx.beginPath()
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
              ctx.fill()

              // Draw the logo in the center with circular clipping
              ctx.save()
              ctx.beginPath()
              ctx.arc(centerX, centerY, logoSizePixels / 2, 0, 2 * Math.PI)
              ctx.clip()
              ctx.drawImage(logoImg, logoX, logoY, logoSizePixels, logoSizePixels)
              ctx.restore()

              console.log('Logo added successfully to download QR code')
              resolve(downloadCanvas)
            } catch (error) {
              console.error('Error adding logo to download:', error)
              resolve(downloadCanvas) // Return canvas without logo if error
            }
          }

          logoImg.onerror = (error) => {
            console.error('Error loading logo image for download:', error)
            resolve(downloadCanvas) // Return canvas without logo if error
          }

          // Handle different logo sources
          if (logo.startsWith('data:')) {
            // Base64 image
            logoImg.src = logo
          } else if (logo.startsWith('http')) {
            // URL image
            logoImg.src = logo
          } else {
            // Fallback
            console.warn('Unknown logo format, trying direct assignment')
            logoImg.src = logo
          }
        })
      }

      console.log('QR code without logo generated')
      return downloadCanvas
    } catch (error) {
      console.error('Error generating download QR code:', error)
      return null
    }
  }

  // Generate QR code when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qrData?.trim()) {
        console.log('Triggering QR code generation from useEffect')
        generateQRCode()
      } else {
        setQrCodeUrl('')
      }
    }, 100) // Small delay to prevent too frequent updates

    return () => clearTimeout(timer)
  }, [qrData, qrColor, bgColor, logo, logoSize])

  // Initial QR code generation with default data and Cloudinary test
  useEffect(() => {
    // Test Cloudinary configuration
    const isConfigValid = testCloudinaryConfig()
    if (!isConfigValid) {
      console.warn('Cloudinary configuration is incomplete for QR generator')
    }

    if (!qrData) {
      console.log('Setting default QR data')
      setQrData('https://example.com')
    }
  }, [])



  // Save QR generation to database
  const saveQRGeneration = async (format) => {
    if (!user) return // Only save for authenticated users

    try {
      const qrType = qrData.includes('http') ? 'url' : 'text'
      const settings = {
        size: useCustomSize ? { width: customWidth, height: customHeight } : qrSize,
        colors: { foreground: qrColor, background: bgColor },
        format: format,
        logo: logo ? {
          size: logoSize,
          position: logoPosition,
          url: logoUrl || logo, // Store Cloudinary URL or base64 fallback
          cloudinary_url: logoUrl // Specifically store Cloudinary URL
        } : null,
        quality: downloadQuality
      }

      const result = await dbHelpers.saveQRHistory(user.id, qrData, qrType, settings)
      if (result.error) {
        console.error('Database save error:', result.error)
      } else {
        console.log('QR generation saved to database')
      }
    } catch (error) {
      console.error('Error saving QR generation:', error)
    }
  }

  const downloadQRCode = async (format = 'png') => {
    if (!qrData.trim()) return

    try {
      console.log('Starting download process...')

      // Generate QR code at actual export size
      const downloadCanvas = await generateDownloadQRCode()
      if (!downloadCanvas) {
        console.error('Failed to generate download canvas')
        return
      }

      console.log('Download canvas generated successfully')

      if (format === 'png') {
        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.png`
        link.href = downloadCanvas.toDataURL('image/png', downloadQuality)
        link.click()
        console.log('PNG download initiated')
      } else if (format === 'pdf') {
        const imgData = downloadCanvas.toDataURL('image/png', downloadQuality)
        const pdf = new jsPDF()

        // Add title
        pdf.setFontSize(20)
        pdf.text('QR Code', 20, 30)

        // Add QR code image
        const imgWidth = 150
        const imgHeight = 150
        pdf.addImage(imgData, 'PNG', 30, 50, imgWidth, imgHeight)

        // Add QR code info
        pdf.setFontSize(12)
        pdf.text(`Content: ${qrData}`, 20, 220)
        pdf.text(`Size: ${finalWidth}px × ${finalHeight}px`, 20, 235)
        pdf.text(`Colors: QR: ${qrColor}, Background: ${bgColor}`, 20, 250)
        if (logo) pdf.text(`Logo: Included (${logoSize}%)`, 20, 265)

        pdf.save(`qr-code-${Date.now()}.pdf`)
      }

      // Save QR generation to database
      await saveQRGeneration(format)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const steps = [
    { number: 1, title: 'Settings', icon: Palette },
    { number: 2, title: 'Generate QR', icon: QrCode },
    { number: 3, title: 'Download', icon: Download }
  ]

  return (
    <div className="generator-page qr-generator-page">
      <div className="container">
        {/* New Three Column Layout */}
        <div className="qr-three-column-layout">
          {/* Left Side - Compact Step Cards */}
          <div className="step-cards-sidebar">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className={`step-card-compact ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}
                  onClick={() => setCurrentStep(step.number)}
                >
                  <div className="step-icon-compact">
                    <Icon size={24} />
                  </div>
                  <div className="step-title-compact">{step.title}</div>
                  <div className="step-number-compact">{step.number}</div>
                </div>
              )
            })}
          </div>

          {/* Middle - Dynamic Configuration Panel */}
          <div className="qr-config-main">
            {currentStep === 1 && (
              <div className="step-content">
                <h2>Step 1: Configure Settings</h2>

                <div className="style-controls">
                  <div className="color-controls compact">
                    <div className="color-group">
                      <label>QR Code Color</label>
                      <div className="color-picker-container">
                        <div
                          className="color-preview"
                          style={{ backgroundColor: qrColor }}
                          onClick={() => {
                            setShowColorPicker(!showColorPicker)
                            setShowBgColorPicker(false)
                          }}
                        ></div>
                        {showColorPicker && (
                          <div className="color-picker-popup">
                            <ChromePicker
                              color={qrColor}
                              onChange={(color) => setQrColor(color.hex)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="color-group">
                      <label>BG Color</label>
                      <div className="color-picker-container">
                        <div
                          className="color-preview"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => {
                            setShowBgColorPicker(!showBgColorPicker)
                            setShowColorPicker(false)
                          }}
                        ></div>
                        {showBgColorPicker && (
                          <div className="color-picker-popup">
                            <ChromePicker
                              color={bgColor}
                              onChange={(color) => setBgColor(color.hex)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="size-controls">
                    <div className="form-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={useCustomSize}
                          onChange={(e) => setUseCustomSize(e.target.checked)}
                        />
                        <span>Custom Size</span>
                      </label>
                    </div>

                    {!useCustomSize ? (
                      <div className="form-group">
                        <label htmlFor="qr-size">QR Code Size: {qrSize}px</label>
                        <input
                          id="qr-size"
                          type="range"
                          min="200"
                          max="800"
                          step="50"
                          value={qrSize}
                          onChange={(e) => setQrSize(parseInt(e.target.value))}
                        />
                        <div className="size-options">
                          <button onClick={() => setQrSize(300)} className={qrSize === 300 ? 'active' : ''}>300px</button>
                          <button onClick={() => setQrSize(500)} className={qrSize === 500 ? 'active' : ''}>500px</button>
                          <button onClick={() => setQrSize(700)} className={qrSize === 700 ? 'active' : ''}>700px</button>
                        </div>
                      </div>
                    ) : (
                      <div className="custom-size-inputs">
                        <div className="form-group">
                          <label htmlFor="custom-width">Width: {customWidth}px</label>
                          <input
                            id="custom-width"
                            type="range"
                            min="200"
                            max="1000"
                            step="50"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(parseInt(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="custom-height">Height: {customHeight}px</label>
                          <input
                            id="custom-height"
                            type="range"
                            min="200"
                            max="1000"
                            step="50"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="logo-controls">
                    <div className="form-group">
                      <label>Logo Upload (Optional)</label>
                      <ImageUpload
                        uploadType="qr-logo"
                        currentImage={logo}
                        onUpload={(result) => {
                          console.log('Logo upload result:', result)
                          // Use local URL immediately for instant preview
                          if (result.local_url) {
                            console.log('Setting local logo URL:', result.local_url)
                            setLogo(result.local_url)
                          }
                          // Switch to Cloudinary URL when available
                          if (result.cloudinary_url) {
                            console.log('Setting Cloudinary logo URL:', result.cloudinary_url)
                            setLogo(result.cloudinary_url)
                            setLogoUrl(result.cloudinary_url)
                          }
                        }}
                        onRemove={() => {
                          console.log('Removing logo')
                          setLogo(defaultLogo) // Reset to default logo instead of null
                          setLogoUrl(null)
                        }}
                        maxSize={2}
                        previewSize="small"
                        showPreview={false}
                        className="qr-logo-upload"
                      />
                    </div>

                    {logo && (
                      <>
                        <div className="form-group">
                          <label>Logo Preview</label>
                          <div className="logo-preview">
                            <img
                              src={logo}
                              alt="Logo preview"
                              className="logo-preview-image"
                            />
                            <span className="logo-preview-text">
                              This logo will appear in the center of your QR code
                            </span>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="logo-size">Logo Size: {logoSize}%</label>
                          <input
                            id="logo-size"
                            type="range"
                            min="20"
                            max="70"
                            step="5"
                            value={logoSize}
                            onChange={(e) => setLogoSize(parseInt(e.target.value))}
                          />
                          <div className="range-labels">
                            <span>Small (20%)</span>
                            <span>Large (70%)</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(2)}
                >
                  Next: Generate QR Codes
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-content">
                <h2>Step 2: Generate QR Codes</h2>

                <div className="form-group">
                  <label htmlFor="qr-data">
                    <span className="label-icon">📝</span>
                    QR Code Content
                  </label>
                  <div className="input-container">
                    <textarea
                      id="qr-data"
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                      placeholder="Enter URL, text, email, phone number, or any data to generate QR code..."
                      rows={3}
                      className="data-input"
                    />
                    {qrData && (
                      <div className="input-status">
                        <span className="char-count">{qrData.length} characters</span>
                        <span className="input-type">
                          {qrData.startsWith('http') ? '🌐 URL' :
                           qrData.startsWith('mailto:') ? '📧 Email' :
                           qrData.startsWith('tel:') ? '📞 Phone' : '📝 Text'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="generation-actions" style={{ marginTop: '2rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(3)}
                    disabled={!qrData.trim()}
                  >
                    Generate & Download QR Code
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setQrData('')
                    }}
                  >
                    Clear & Create New
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-content">
                <h2>Step 3: Download Your QR Code</h2>

                <div className="download-section">
                  <div className="download-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => downloadQRCode('png')}
                      disabled={!qrData.trim()}
                    >
                      <Download size={16} />
                      Download PNG
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => downloadQRCode('pdf')}
                      disabled={!qrData.trim()}
                    >
                      <FileText size={16} />
                      Download PDF
                    </button>
                  </div>

                  <div className="qr-info">
                    <p><strong>Content:</strong> {qrData}</p>
                    <p><strong>Export Size:</strong> {useCustomSize ? `${customWidth}px × ${customHeight}px` : `${qrSize}px × ${qrSize}px`}</p>
                    <p><strong>Colors:</strong> QR: {qrColor}, Background: {bgColor}</p>
                    {logo && <p><strong>Logo:</strong> Included ({logoSize}%)</p>}
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(2)}
                  >
                    Create Another QR Code
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep(1)}
                  >
                    Change Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Fixed Preview Panel */}
          <div className="qr-preview-sidebar">
            <div className="qr-preview-header">
              <div className="qr-preview-title">
                <QrCode size={16} />
                Preview
              </div>
              <div className="qr-preview-actions">
                {qrData && (
                  <button
                    type="button"
                    className="qr-refresh-btn"
                    onClick={() => {
                      console.log('Force refresh triggered, qrData:', qrData)
                      console.log('Canvas ref:', canvasRef.current)
                      generateQRCode()
                    }}
                    title="Refresh QR Code"
                  >
                    🔄
                  </button>
                )}
              </div>
            </div>
            <div className="qr-preview">
              {qrData ? (
                <div className="qr-display">
                  {/* Hidden canvas for QR generation */}
                  <canvas
                    ref={canvasRef}
                    width={PREVIEW_SIZE}
                    height={PREVIEW_SIZE}
                    style={{ display: 'none' }}
                  />

                  {/* Display the generated QR code image */}
                  {qrCodeUrl ? (
                    <div>
                      <img
                        src={qrCodeUrl}
                        alt="QR Code Preview"
                        className="qr-preview-image"
                        style={{
                          width: '280px',
                          height: '280px',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          background: 'white',
                          objectFit: 'contain'
                        }}
                        onLoad={() => console.log('QR preview image loaded successfully')}
                        onError={(e) => console.error('QR preview image failed to load:', e)}
                      />
                      {logo && logo !== defaultLogo && (
                        <div className="logo-indicator" style={{
                          marginTop: '8px',
                          padding: '4px 8px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#3B82F6',
                          textAlign: 'center'
                        }}>
                          ✓ Custom logo included ({logoSize}%)
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="qr-loading">
                      <div className="spinner"></div>
                      <p>Generating QR code...</p>
                      <button
                        onClick={() => generateQRCode()}
                        className="retry-btn"
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          background: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Retry Generation
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="qr-placeholder">
                  <QrCode size={80} />
                  <p>Enter data to see QR code preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Hero Section - Moved to Bottom */}
        <div className="hero-section-bottom">
          <h1>QR Code Generator Free No Expiration</h1>
          <p>
            Create unlimited QR codes that never expire! Generate professional QR codes with custom colors, logos, and high-resolution downloads.
            Completely free forever - no signup, no watermarks, no time limits.
          </p>
          <div className="hero-features-bottom">
            <span className="hero-feature-bottom">✨ No Expiration</span>
            <span className="hero-feature-bottom">🚀 Instant Generation</span>
            <span className="hero-feature-bottom">🎨 Custom Design</span>
            <span className="hero-feature-bottom">📱 High Quality</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeGenerator
