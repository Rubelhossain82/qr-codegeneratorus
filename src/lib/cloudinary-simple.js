// Simple Cloudinary upload without preset requirement
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dioeqvpvk'
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '522187584581985'
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'n7pObwpO76sN-JFrCDb5oaEevH4'

// Generate signature for Cloudinary (simplified version)
const generateSignature = (params, apiSecret) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  const stringToSign = sortedParams + apiSecret

  // Simple hash function for demo purposes
  let hash = 0
  for (let i = 0; i < stringToSign.length; i++) {
    const char = stringToSign.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Convert to hex and ensure it's positive
  return Math.abs(hash).toString(16).padStart(8, '0')
}

// Upload using unsigned preset (much simpler and more reliable)
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    console.log('=== Cloudinary Unsigned Upload ===')
    console.log('Cloud Name:', CLOUD_NAME)
    console.log('File:', file.name, file.size, 'bytes')

    // Use unsigned upload with preset
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'generatorus_unsigned') // Fixed preset name

    // Add optional parameters
    if (options.folder) formData.append('folder', options.folder)
    if (options.public_id) formData.append('public_id', options.public_id)
    if (options.width) formData.append('width', options.width)
    if (options.height) formData.append('height', options.height)
    if (options.crop) formData.append('crop', options.crop)
    if (options.quality) formData.append('quality', options.quality || 'auto')

    console.log('Using unsigned upload preset: generatorus_unsigned')

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    const text = await response.text()
    console.log('Raw response:', text)

    let result
    try {
      result = JSON.parse(text)
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text}`)
    }

    if (!response.ok) {
      throw new Error(result.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    console.log('Upload successful:', result.secure_url)
    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        created_at: result.created_at
      }
    }

  } catch (error) {
    console.error('Cloudinary upload failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Test function
export const testSimpleUpload = () => {
  console.log('=== Simple Cloudinary Config ===')
  console.log('Cloud Name:', CLOUD_NAME)
  console.log('API Key:', API_KEY ? 'Present' : 'Missing')
  console.log('API Secret:', API_SECRET ? 'Present' : 'Missing')
  return !!(CLOUD_NAME && API_KEY && API_SECRET)
}
