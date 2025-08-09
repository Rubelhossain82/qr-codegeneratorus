import { useState } from 'react'
import { cloudinaryHelpers, testCloudinaryConfig, createUploadPreset } from '../lib/cloudinary'
import { uploadToCloudinary, testSimpleUpload } from '../lib/cloudinary-simple'
import { toast } from 'react-toastify'

const CloudinaryTest = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const testConfig = () => {
    const isValid = testCloudinaryConfig()
    if (isValid) {
      toast.success('Cloudinary configuration is valid!')
    } else {
      toast.error('Cloudinary configuration is invalid!')
    }
  }

  const createPreset = async () => {
    try {
      toast.info('Creating upload preset...')
      const result = await createUploadPreset()
      if (result && result.name) {
        toast.success(`Upload preset "${result.name}" created successfully!`)
      } else {
        toast.error('Failed to create upload preset')
      }
    } catch (error) {
      toast.error(`Error creating preset: ${error.message}`)
    }
  }

  const uploadFile = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const uploadResult = await cloudinaryHelpers.uploadImage(file, {
        folder: 'generatorus/test',
        transformation: {
          width: 300,
          height: 300,
          crop: 'limit',
          quality: 'auto'
        }
      })

      console.log('Upload result:', uploadResult)
      setResult(uploadResult)

      if (uploadResult.success) {
        toast.success('File uploaded successfully!')
      } else {
        toast.error(`Upload failed: ${uploadResult.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Upload error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const uploadSimple = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const uploadResult = await uploadToCloudinary(file, {
        folder: 'generatorus/test',
        width: 300,
        height: 300,
        crop: 'limit',
        quality: 'auto'
      })

      console.log('Simple upload result:', uploadResult)
      setResult(uploadResult)

      if (uploadResult.success) {
        toast.success('File uploaded successfully with simple method!')
      } else {
        toast.error(`Simple upload failed: ${uploadResult.error}`)
      }
    } catch (error) {
      console.error('Simple upload error:', error)
      toast.error(`Simple upload error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const testSimple = () => {
    const isValid = testSimpleUpload()
    if (isValid) {
      toast.success('Simple Cloudinary configuration is valid!')
    } else {
      toast.error('Simple Cloudinary configuration is invalid!')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Cloudinary Configuration Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testConfig} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Test Configuration
        </button>
        <button onClick={createPreset} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Create Upload Preset
        </button>
        <button onClick={testSimple} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Test Simple Config
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ marginBottom: '10px' }}
        />
        <br />
        <button
          onClick={uploadFile}
          disabled={!file || uploading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          {uploading ? 'Uploading...' : 'Upload (Preset)'}
        </button>
        <button
          onClick={uploadSimple}
          disabled={!file || uploading}
          style={{ padding: '10px 20px' }}
        >
          {uploading ? 'Uploading...' : 'Upload (Simple)'}
        </button>
      </div>

      {file && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Selected File:</h3>
          <p>Name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>Type: {file.type}</p>
        </div>
      )}

      {result && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Upload Result:</h3>
          <pre style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {result.success && result.data.secure_url && (
            <div style={{ marginTop: '10px' }}>
              <h4>Uploaded Image:</h4>
              <img 
                src={result.data.secure_url} 
                alt="Uploaded" 
                style={{ maxWidth: '300px', height: 'auto', border: '1px solid #ddd' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CloudinaryTest
