import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cloudinaryHelpers } from '../../lib/cloudinary'
import { uploadToCloudinary } from '../../lib/cloudinary-simple'
import { useAuth } from '../../contexts/AuthContext'
import './ImageUpload.css'

const ImageUpload = ({
  onUpload,
  onRemove,
  currentImage,
  uploadType = 'general', // 'qr-logo', 'profile', 'general'
  maxSize = 2, // MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  disabled = false,
  showPreview = true,
  previewSize = 'medium' // 'small', 'medium', 'large'
}) => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`Please select a valid image file. Accepted types: ${acceptedTypes.join(', ')}`)
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      throw new Error(`File size should be less than ${maxSize}MB`)
    }

    return true
  }

  const uploadToCloudinaryMethod = async (file) => {
    try {
      // Try simple upload method first
      const uploadResult = await uploadToCloudinary(file, {
        folder: `generatorus/${uploadType}`,
        public_id: `${uploadType}-${user?.id || 'anonymous'}-${Date.now()}`,
        width: uploadType === 'qr-logo' ? 200 : 400,
        height: uploadType === 'qr-logo' ? 200 : 400,
        crop: 'limit',
        quality: 'auto'
      })

      return uploadResult
    } catch (error) {
      console.error('Simple upload failed, trying original method:', error)

      // Fallback to original method
      let uploadResult
      switch (uploadType) {
        case 'qr-logo':
          uploadResult = await cloudinaryHelpers.uploadQRLogo?.(file, user?.id || 'anonymous')
          break
        case 'profile':
          uploadResult = await cloudinaryHelpers.uploadProfileImage?.(file, user?.id || 'anonymous')
          break
        default:
          uploadResult = await cloudinaryHelpers.uploadImage(file, {
            folder: 'generatorus/general',
            transformation: {
              quality: 'auto',
              fetch_format: 'auto'
            }
          })
      }
      return uploadResult
    }
  }

  const handleFileSelect = async (file) => {
    if (!file || disabled) return

    try {
      validateFile(file)
      setUploading(true)

      // Start local preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        if (onUpload) {
          onUpload({
            cloudinary_url: null,
            local_url: e.target.result,
            public_id: null,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type
          })
        }
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary (unsigned)
      console.log(`Uploading ${uploadType} to Cloudinary...`)
      const cloudinaryResult = await uploadToCloudinaryMethod(file)

      if (cloudinaryResult.success) {
        // Notify parent with Cloudinary URL to swap preview source
        if (onUpload) {
          onUpload({
            cloudinary_url: cloudinaryResult.data.secure_url,
            local_url: null,
            public_id: cloudinaryResult.data.public_id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type
          })
        }
      } else {
        console.warn('Cloudinary upload failed:', cloudinaryResult.error)
      }

    } catch (error) {
      console.error('Upload error:', error)
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
  }

  const getPreviewSizeClass = () => {
    switch (previewSize) {
      case 'small': return 'preview-small'
      case 'large': return 'preview-large'
      default: return 'preview-medium'
    }
  }

  return (
    <div className={`image-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {currentImage && showPreview ? (
        <div className={`image-preview ${getPreviewSizeClass()}`}>
          <img 
            src={currentImage} 
            alt="Preview" 
            className="preview-image"
          />
          <button
            type="button"
            className="remove-button"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="upload-content">
              <ImageIcon size={32} />
              <p>Click to upload or drag and drop</p>
              <span className="upload-hint">
                Max {maxSize}MB • {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {currentImage && !showPreview && (
        <div className="upload-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Upload size={16} />
            Change Image
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X size={16} />
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
