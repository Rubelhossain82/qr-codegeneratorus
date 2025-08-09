// Cloudinary configuration for client-side uploads
const CLOUDINARY_CONFIG = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dioeqvpvk',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || '522187584581985',
  upload_preset: import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET || 'generatorus_unsigned'
}

// Test Cloudinary configuration
export const testCloudinaryConfig = () => {
  console.log('=== Cloudinary Configuration ===')
  console.log('Cloud Name:', CLOUDINARY_CONFIG.cloud_name)
  console.log('API Key:', CLOUDINARY_CONFIG.api_key)
  console.log('Upload Preset:', CLOUDINARY_CONFIG.upload_preset)
  console.log('Config Valid:', !!(CLOUDINARY_CONFIG.cloud_name && CLOUDINARY_CONFIG.upload_preset))
  return !!(CLOUDINARY_CONFIG.cloud_name && CLOUDINARY_CONFIG.upload_preset)
}

// Create unsigned upload preset programmatically
export const createUploadPreset = async () => {
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/upload_presets`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(CLOUDINARY_CONFIG.api_key + ':' + import.meta.env.VITE_CLOUDINARY_API_SECRET)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'generatorus_unsigned',
        unsigned: true,
        folder: 'generatorus',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        transformation: {
          quality: 'auto',
          fetch_format: 'auto'
        }
      })
    })

    const result = await response.json()
    console.log('Upload preset creation result:', result)
    return result
  } catch (error) {
    console.error('Error creating upload preset:', error)
    return null
  }
}

// Helper functions for image upload and management
export const cloudinaryHelpers = {
  // Upload image to Cloudinary using unsigned client-side upload
  uploadImage: async (file, options = {}) => {
    try {
      const {
        folder = 'generatorus',
        public_id,
        transformation = {},
        resource_type = 'image'
      } = options

      if (!CLOUDINARY_CONFIG.upload_preset) {
        throw new Error('Cloudinary unsigned upload preset is not configured')
      }

      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset)

      if (folder) formData.append('folder', folder)
      if (public_id) formData.append('public_id', public_id)

      // Add transformation parameters (optional)
      if (transformation.width) formData.append('width', transformation.width)
      if (transformation.height) formData.append('height', transformation.height)
      if (transformation.crop) formData.append('crop', transformation.crop)
      if (transformation.quality) formData.append('quality', transformation.quality)

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/${resource_type}/upload`,
        { method: 'POST', body: formData }
      )

      const text = await response.text()
      let resultJson
      try { resultJson = JSON.parse(text) } catch (_) { resultJson = null }

      if (!response.ok || !resultJson) {
        const errMsg = resultJson?.error?.message || text || response.statusText
        throw new Error(`Cloudinary upload failed: ${errMsg}`)
      }

      const result = resultJson
      return {
        success: true,
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.secure_url || result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          created_at: result.created_at
        }
      }
    } catch (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Upload QR code logo (unsigned upload, then fallback to local)
  uploadQRLogo: async (file, userId) => {
    try {
      const timestamp = Date.now()

      const result = await cloudinaryHelpers.uploadImage(file, {
        folder: 'generatorus/qr-logos',
        public_id: `qr-logo-${userId}-${timestamp}`,
        transformation: { width: 400, height: 400, crop: 'limit', quality: 'auto' }
      })

      if (!result.success) throw new Error(result.error || 'Unknown Cloudinary error')
      return result
    } catch (error) {
      console.error('QR logo upload error:', error)
      // Fallback: local base64
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        return { success: true, data: { public_id: `local-qr-logo-${userId}-${Date.now()}`, secure_url: base64, url: base64, is_local: true } }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message }
      }
    }
  },

  // Upload user profile image
  uploadProfileImage: async (file, userId) => {
    try {
      const result = await cloudinaryHelpers.uploadImage(file, {
        folder: 'generatorus/profiles',
        public_id: `profile-${userId}`,
        transformation: {
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto'
        }
      })

      return result
    } catch (error) {
      console.error('Profile image upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Generate optimized URL
  getOptimizedUrl: (publicId, options = {}) => {
    try {
      const {
        width,
        height,
        crop = 'fit',
        quality = 'auto',
        format = 'auto'
      } = options

      let url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/`

      // Add transformations
      const transformations = []
      if (width) transformations.push(`w_${width}`)
      if (height) transformations.push(`h_${height}`)
      if (crop) transformations.push(`c_${crop}`)
      if (quality) transformations.push(`q_${quality}`)
      if (format) transformations.push(`f_${format}`)

      if (transformations.length > 0) {
        url += transformations.join(',') + '/'
      }

      url += publicId

      return url
    } catch (error) {
      console.error('Error generating optimized URL:', error)
      return null
    }
  },

  // Delete image from Cloudinary (requires server-side implementation)
  deleteImage: async (publicId) => {
    try {
      // This would need to be implemented on the server side
      // For now, we'll just return success
      console.warn('Delete functionality requires server-side implementation')
      return {
        success: true,
        message: 'Delete functionality requires server-side implementation'
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get image details (requires server-side implementation)
  getImageDetails: async (publicId) => {
    try {
      // This would need to be implemented on the server side
      console.warn('Get details functionality requires server-side implementation')
      return {
        success: true,
        message: 'Get details functionality requires server-side implementation'
      }
    } catch (error) {
      console.error('Error getting image details:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (files, options = {}) => {
    try {
      const uploadPromises = files.map(file =>
        cloudinaryHelpers.uploadImage(file, options)
      )

      const results = await Promise.all(uploadPromises)

      return {
        success: true,
        data: results
      }
    } catch (error) {
      console.error('Multiple upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Utility function to get image URL with fallback
  getImageUrl: (cloudinaryUrl, localUrl, options = {}) => {
    if (cloudinaryUrl) {
      return cloudinaryHelpers.getOptimizedUrl(
        cloudinaryUrl.split('/').pop().split('.')[0], // Extract public_id
        options
      ) || cloudinaryUrl
    }
    return localUrl || null
  },

  // Check if URL is from Cloudinary
  isCloudinaryUrl: (url) => {
    return url && url.includes('cloudinary.com')
  }
}

export default CLOUDINARY_CONFIG
