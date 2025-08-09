import { useState, useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { Download, BarChart3, Type, Palette, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../lib/supabase'

function BarcodeGenerator() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [barcodeData, setBarcodeData] = useState('')
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128')
  const [barcodeColor, setBarcodeColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [customWidth, setCustomWidth] = useState(400)
  const [customHeight, setCustomHeight] = useState(200)
  const [useCustomSize, setUseCustomSize] = useState(false)
  const [displayValue, setDisplayValue] = useState(true)
  const [fontSize, setFontSize] = useState(20)
  const [margin, setMargin] = useState(10)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [validationError, setValidationError] = useState('')
  const canvasRef = useRef(null)

  const barcodeFormats = [
    { value: 'CODE128', label: 'CODE128', description: 'Most common format, supports all ASCII characters' },
    { value: 'CODE39', label: 'CODE39', description: 'Alphanumeric format, widely used in industry' },
    { value: 'EAN13', label: 'EAN13', description: '13-digit European Article Number' },
    { value: 'EAN8', label: 'EAN8', description: '8-digit European Article Number' },
    { value: 'UPC', label: 'UPC-A', description: '12-digit Universal Product Code' },
    { value: 'ITF', label: 'ITF-14', description: '14-digit Interleaved 2 of 5' },
    { value: 'MSI', label: 'MSI', description: 'Modified Plessey code' },
    { value: 'pharmacode', label: 'Pharmacode', description: 'Pharmaceutical binary code' }
  ]

  // Real-time validation effect
  useEffect(() => {
    if (barcodeData.trim() === '') {
      setValidationError('')
      return
    }

    // Validate data in real-time
    if (!validateBarcodeData(barcodeData, barcodeFormat)) {
      setValidationError(getValidationMessage(barcodeFormat))
    } else {
      setValidationError('')
    }
  }, [barcodeData, barcodeFormat])

  // Generate barcode whenever data or settings change
  useEffect(() => {
    if (barcodeData && !validationError) {
      generateBarcode()
    } else if (barcodeData && validationError) {
      // Clear canvas if there's validation error
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [barcodeData, barcodeFormat, barcodeColor, backgroundColor, width, height, customWidth, customHeight, useCustomSize, displayValue, fontSize, margin, validationError])

  const validateBarcodeData = (data, format) => {
    if (!data || data.trim() === '') return false

    const cleanData = data.trim()
    console.log('Validating data:', cleanData, 'for format:', format, 'length:', cleanData.length)

    switch (format) {
      case 'EAN13':
        return /^\d{13}$/.test(cleanData)
      case 'EAN8':
        return /^\d{8}$/.test(cleanData)
      case 'UPC':
        // UPC-A requires exactly 12 digits
        const isValid = /^\d{12}$/.test(cleanData)
        console.log('UPC validation result:', isValid, 'for data:', cleanData)
        return isValid
      case 'CODE39':
        return /^[A-Z0-9\-. $/+%]*$/.test(cleanData)
      case 'ITF':
        return /^\d{14}$/.test(cleanData)
      case 'MSI':
        return /^\d+$/.test(cleanData)
      case 'pharmacode':
        return /^\d{1,6}$/.test(cleanData) && parseInt(cleanData) >= 3 && parseInt(cleanData) <= 131070
      case 'CODE128':
      default:
        return cleanData.length > 0
    }
  }

  const getValidationMessage = (format) => {
    switch (format) {
      case 'EAN13':
        return 'EAN13 requires exactly 13 digits'
      case 'EAN8':
        return 'EAN8 requires exactly 8 digits'
      case 'UPC':
        return 'UPC-A requires exactly 12 digits (e.g., 123456789012)'
      case 'CODE39':
        return 'CODE39 supports only uppercase letters, numbers, and symbols (- . $ / + %)'
      case 'ITF':
        return 'ITF requires exactly 14 digits'
      case 'MSI':
        return 'MSI requires only numbers'
      case 'pharmacode':
        return 'Pharmacode requires 1-6 digits (value between 3 and 131070)'
      default:
        return 'Please enter valid data'
    }
  }

  const generateBarcode = () => {
    try {
      const canvas = canvasRef.current
      if (!canvas) {
        console.error('Canvas not found')
        return
      }

      // Skip generation if there's validation error (handled by real-time validation)
      if (validationError) {
        return
      }

      // Clear canvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      console.log('Generating barcode with data:', barcodeData, 'Format:', barcodeFormat)

      // Special handling for UPC format
      let actualFormat = barcodeFormat
      let actualData = barcodeData

      if (barcodeFormat === 'UPC') {
        // Try different UPC format names that JsBarcode might accept
        actualFormat = 'UPC'
        actualData = barcodeData
        console.log('UPC format detected, using format:', actualFormat, 'data:', actualData)
      }

      const barcodeOptions = {
        format: actualFormat,
        lineColor: barcodeColor,
        background: backgroundColor,
        width: width,
        height: height,
        displayValue: displayValue,
        fontSize: fontSize,
        margin: margin,
        textAlign: "center",
        textPosition: "bottom",
        fontOptions: "bold"
      }

      console.log('Barcode options:', barcodeOptions)

      // Apply custom canvas size if enabled
      if (useCustomSize) {
        canvas.width = customWidth
        canvas.height = customHeight
      }

      // Try to generate barcode with error handling
      try {
        JsBarcode(canvas, actualData, barcodeOptions)
        console.log('Barcode generated successfully')
      } catch (barcodeError) {
        console.error('JsBarcode error:', barcodeError)

        // If UPC fails, try alternative formats
        if (barcodeFormat === 'UPC') {
          console.log('UPC failed, trying alternative formats...')

          // Try UPC-A format
          try {
            console.log('Trying UPC-A format...')
            JsBarcode(canvas, actualData, { ...barcodeOptions, format: 'UPC-A' })
            console.log('UPC-A format worked!')
          } catch (upcAError) {
            console.error('UPC-A also failed:', upcAError)

            // Try CODE128 as fallback
            try {
              console.log('Trying CODE128 as fallback...')
              JsBarcode(canvas, actualData, { ...barcodeOptions, format: 'CODE128' })
              console.log('CODE128 fallback worked!')
              setValidationError('Note: Generated as CODE128 format (UPC format not supported by this library)')
            } catch (fallbackError) {
              console.error('All formats failed:', fallbackError)
              setValidationError('Unable to generate barcode with this data')
              throw fallbackError
            }
          }
        } else {
          throw barcodeError
        }
      }

    } catch (error) {
      console.error('Error generating barcode:', error)
      setValidationError('Error generating barcode: ' + error.message)
      // Clear canvas on error
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  // Save barcode generation to database
  const saveBarcodeGeneration = async (format) => {
    if (!user) return // Only save for authenticated users

    try {
      const settings = {
        format: barcodeFormat,
        size: useCustomSize ? { width: customWidth, height: customHeight } : { width, height },
        colors: { foreground: barcodeColor, background: backgroundColor },
        displayValue: displayValue,
        fontSize: fontSize,
        margin: margin,
        downloadFormat: format
      }

      await dbHelpers.saveQRHistory(user.id, barcodeData, 'barcode', settings)
    } catch (error) {
      console.error('Error saving barcode generation:', error)
    }
  }

  const downloadBarcode = async (format = 'png') => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to download barcodes')
      window.location.href = '/login'
      return
    }

    console.log('Download requested, format:', format)
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('Canvas not available for download')
      toast.error('Canvas not available for download')
      return
    }

    if (format === 'png') {
      console.log('Downloading PNG...')
      const link = document.createElement('a')
      link.download = `barcode-${barcodeFormat}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
      console.log('PNG download initiated')
      toast.success('Barcode PNG downloaded successfully!')

      // Save to database
      await saveBarcodeGeneration(format)
    } else if (format === 'pdf') {
      console.log('Starting PDF download...')
      await downloadPDF()
      toast.success('Barcode PDF downloaded successfully!')

      // Save to database
      await saveBarcodeGeneration(format)
    }
  }

  const downloadPDF = async () => {
    console.log('PDF download started...')
    setIsGeneratingPDF(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) {
        console.error('Canvas not found for PDF generation')
        alert('Barcode not ready. Please wait and try again.')
        setIsGeneratingPDF(false)
        return
      }

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')

      // Calculate PDF dimensions
      const pdfWidth = 210
      const pdfHeight = 297
      const marginPdf = 20
      const maxWidth = pdfWidth - (marginPdf * 2)

      // Add barcode image (centered on page)
      const aspectRatio = canvas.height / canvas.width
      const barcodeWidth = Math.min(maxWidth, canvas.width * 0.5)
      const barcodeHeight = barcodeWidth * aspectRatio

      // Center the barcode vertically and horizontally
      const x = (pdfWidth - barcodeWidth) / 2
      const y = (pdfHeight - barcodeHeight) / 2

      pdf.addImage(imgData, 'PNG', x, y, barcodeWidth, barcodeHeight)

      // Save PDF
      const fileName = `barcode-${barcodeFormat}-${Date.now()}.pdf`
      pdf.save(fileName)

      console.log('PDF saved successfully:', fileName)
      alert('PDF downloaded successfully!')

    } catch (error) {
      console.error('Error creating PDF:', error)
      alert(`Error creating PDF: ${error.message}`)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getExampleData = (format) => {
    switch (format) {
      case 'EAN13':
        return '1234567890123'
      case 'EAN8':
        return '12345678'
      case 'UPC':
        return '123456789012'
      case 'CODE39':
        return 'HELLO123'
      case 'ITF':
        return '12345678901234'
      case 'MSI':
        return '123456'
      case 'pharmacode':
        return '123'
      default:
        return 'Hello World'
    }
  }

  const steps = [
    { number: 1, title: 'Settings', icon: Palette },
    { number: 2, title: 'Generate Barcode', icon: BarChart3 },
    { number: 3, title: 'Download', icon: Download }
  ]

  return (
    <div className="generator-page barcode-generator-page">
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

                <div className="format-selection">
                  <h3>Choose Barcode Format</h3>
                  <div className="format-grid">
                    {barcodeFormats.map((format) => (
                      <div
                        key={format.value}
                        className={`format-card ${barcodeFormat === format.value ? 'active' : ''}`}
                        onClick={() => {
                          setBarcodeFormat(format.value)
                          setBarcodeData(getExampleData(format.value))
                        }}
                      >
                        <h4>{format.label}</h4>
                        <p>{format.description}</p>
                        <span className="example">Example: {getExampleData(format.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="style-controls">
                  <div className="color-controls compact">
                    <div className="color-group">
                      <label>Barcode Color</label>
                      <div className="color-picker-container">
                        <div
                          className="color-preview"
                          style={{ backgroundColor: barcodeColor }}
                        ></div>
                        <input
                          type="color"
                          value={barcodeColor}
                          onChange={(e) => setBarcodeColor(e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>

                    <div className="color-group">
                      <label>BG Color</label>
                      <div className="color-picker-container">
                        <div
                          className="color-preview"
                          style={{ backgroundColor: backgroundColor }}
                        ></div>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="size-controls">
                    <div className="size-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={useCustomSize}
                          onChange={(e) => setUseCustomSize(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Custom Size</span>
                      </label>
                    </div>

                    {useCustomSize ? (
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
                            min="100"
                            max="600"
                            step="25"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="standard-size-controls">
                        <div className="form-group">
                          <label htmlFor="width">Bar Width: {width}px</label>
                          <input
                            id="width"
                            type="range"
                            min="1"
                            max="5"
                            step="0.5"
                            value={width}
                            onChange={(e) => setWidth(parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="height">Bar Height: {height}px</label>
                          <input
                            id="height"
                            type="range"
                            min="50"
                            max="200"
                            step="10"
                            value={height}
                            onChange={(e) => setHeight(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="margin">Margin: {margin}px</label>
                      <input
                        id="margin"
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={margin}
                        onChange={(e) => setMargin(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="text-controls">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={displayValue}
                          onChange={(e) => setDisplayValue(e.target.checked)}
                        />
                        Display text below barcode
                      </label>
                    </div>

                    {displayValue && (
                      <div className="form-group">
                        <label htmlFor="font-size">Font Size: {fontSize}px</label>
                        <input
                          id="font-size"
                          type="range"
                          min="10"
                          max="30"
                          step="2"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(2)}
                >
                  Next: Generate Barcodes
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-content">
                <h2>Step 2: Generate Barcodes</h2>

                <div className="form-group">
                  <label htmlFor="barcode-data">Barcode Content</label>
                  <input
                    id="barcode-data"
                    type="text"
                    value={barcodeData}
                    onChange={(e) => setBarcodeData(e.target.value)}
                    placeholder="Enter data to encode..."
                  />
                  {validationError && (
                    <p className="validation-error" style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      ⚠️ {validationError}
                    </p>
                  )}
                  <p className="form-help">
                    Format: {barcodeFormat} - {getValidationMessage(barcodeFormat)}
                  </p>

                  {/* Quick Examples based on selected format */}
                  <div className="quick-examples">
                    <div className="example-buttons">
                      {barcodeFormat === 'UPC' && (
                        <>
                          <button
                            type="button"
                            className="example-btn"
                            onClick={() => setBarcodeData('123456789012')}
                            title="Example UPC-A code"
                          >
                            📦 Example UPC
                          </button>
                          <button
                            type="button"
                            className="example-btn"
                            onClick={() => setBarcodeData('036000291452')}
                            title="Coca-Cola UPC example"
                          >
                            🥤 Coca-Cola
                          </button>
                        </>
                      )}
                      {barcodeFormat === 'EAN13' && (
                        <button
                          type="button"
                          className="example-btn"
                          onClick={() => setBarcodeData('1234567890123')}
                          title="Example EAN13 code"
                        >
                          📦 Example EAN13
                        </button>
                      )}
                      {barcodeFormat === 'CODE128' && (
                        <>
                          <button
                            type="button"
                            className="example-btn"
                            onClick={() => setBarcodeData('HELLO123')}
                            title="Example CODE128"
                          >
                            📝 Text + Numbers
                          </button>
                          <button
                            type="button"
                            className="example-btn"
                            onClick={() => setBarcodeData('ABC-123-XYZ')}
                            title="Product code example"
                          >
                            🏷️ Product Code
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="current-settings">
                  <h3>Current Settings</h3>
                  <div className="settings-preview">
                    <div className="setting-item">
                      <span>Format:</span> <strong>{barcodeFormat}</strong>
                    </div>
                    <div className="setting-item">
                      <span>Size:</span> <strong>
                        {useCustomSize
                          ? `${customWidth}px × ${customHeight}px (Canvas)`
                          : `${width}px × ${height}px (Bar)`
                        }
                      </strong>
                    </div>
                    <div className="setting-item">
                      <span>Colors:</span>
                      <div className="color-preview" style={{ backgroundColor: barcodeColor }}></div>
                      <div className="color-preview" style={{ backgroundColor: backgroundColor }}></div>
                    </div>
                    <div className="setting-item">
                      <span>Text:</span> <strong>{displayValue ? 'Yes' : 'No'}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    Change Settings
                  </button>
                </div>

                <div className="generation-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(3)}
                    disabled={!barcodeData.trim() || validationError}
                  >
                    Generate & Download Barcode
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setBarcodeData('')
                      setValidationError('')
                    }}
                  >
                    Clear & Create New
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-content">
                <h2>Step 3: Download Your Barcode</h2>

                <div className="download-section">
                  <div className="download-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => downloadBarcode('png')}
                      disabled={!barcodeData || validationError}
                    >
                      <Download size={16} />
                      Download PNG
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => downloadBarcode('pdf')}
                      disabled={!barcodeData || validationError || isGeneratingPDF}
                    >
                      {isGeneratingPDF ? (
                        <>
                          <span className="spinner">⏳</span>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText size={16} />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>

                  <div className="qr-info">
                    <p><strong>Content:</strong> {barcodeData}</p>
                    <p><strong>Format:</strong> {barcodeFormat}</p>
                    <p><strong>Export Size:</strong> {useCustomSize ? `${customWidth}px × ${customHeight}px` : `${width}px × ${height}px`}</p>
                    <p><strong>Colors:</strong> Barcode: {barcodeColor}, Background: {backgroundColor}</p>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(2)}
                  >
                    Create Another Barcode
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
                <BarChart3 size={16} />
                Preview
              </div>
              <div className="qr-preview-actions">
                {barcodeData && (
                  <button
                    type="button"
                    className="qr-refresh-btn"
                    onClick={() => {
                      console.log('Force refresh triggered')
                      generateBarcode()
                    }}
                    title="Refresh Barcode"
                  >
                    🔄
                  </button>
                )}
              </div>
            </div>
            <div className="qr-preview">
              {barcodeData ? (
                <div className="qr-display">
                  {validationError ? (
                    <div className="validation-error">
                      <p style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
                        ⚠️ {validationError}
                      </p>
                    </div>
                  ) : (
                    <canvas
                      ref={canvasRef}
                      className="barcode-canvas"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '280px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        background: 'white'
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="qr-placeholder">
                  <BarChart3 size={80} />
                  <p>Enter data to see barcode preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Hero Section - Moved to Bottom */}
        <div className="hero-section-bottom">
          <h1>Professional Barcode Generator Free</h1>
          <p>
            Generate high-quality barcodes in multiple formats including CODE128, EAN13, UPC, and more.
            Perfect for inventory management, product labeling, and business applications.
            Completely free with instant downloads in PNG and PDF formats.
          </p>
          <div className="hero-features-bottom">
            <span className="hero-feature-bottom">📊 Multiple Formats</span>
            <span className="hero-feature-bottom">🎯 High Precision</span>
            <span className="hero-feature-bottom">📱 Print Ready</span>
            <span className="hero-feature-bottom">⚡ Instant Download</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarcodeGenerator
