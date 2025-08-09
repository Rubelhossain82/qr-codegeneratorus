import React, { useState, useEffect, useRef } from 'react'
import { supabase, TABLES, dbHelpers } from '../../lib/supabase'
import {
  Code,
  Save,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Globe,
  Search,
  BarChart3,
  RefreshCw,
  Upload,
  FileText,
  Download,
  ExternalLink,
  Shield,
  Zap,
  FileCode,
  X,
  Check,
  Clock,
  AlertTriangle
} from 'lucide-react'

const CodeInjection = () => {
  const [codeSnippets, setCodeSnippets] = useState([])
  const [verificationFiles, setVerificationFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [newSnippet, setNewSnippet] = useState({
    name: '',
    description: '',
    code: '',
    type: 'verification',
    is_active: true
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('snippets') // 'snippets' or 'files'
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const snippetTypes = [
    { value: 'verification', label: 'Site Verification', icon: Globe },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'advertising', label: 'Advertising', icon: Search },
    { value: 'custom', label: 'Custom Code', icon: Code }
  ]

  const fileTypes = [
    { value: 'verification', label: 'Verification File (.txt)', icon: FileText, description: 'For platform verification' },
    { value: 'ads-txt', label: 'Ads.txt File', icon: Shield, description: 'For advertising authorization' },
    { value: 'other', label: 'Other File', icon: Upload, description: 'Custom verification files' }
  ]

  const supportedFileExtensions = ['.js', '.txt', '.html', '.xml', '.json']

  useEffect(() => {
    loadCodeSnippets()
    loadVerificationFiles()
  }, [])

  const loadCodeSnippets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.CODE_SNIPPETS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading code snippets:', error)
        setMessage({ type: 'error', text: 'Failed to load code snippets' })
      } else {
        setCodeSnippets(data || [])
      }
    } catch (error) {
      console.error('Error loading code snippets:', error)
      setMessage({ type: 'error', text: 'Failed to load code snippets' })
    } finally {
      setLoading(false)
    }
  }

  const saveSnippet = async (snippet) => {
    try {
      setSaving(true)
      
      if (snippet.id) {
        // Update existing snippet
        const { error } = await supabase
          .from(TABLES.CODE_SNIPPETS)
          .update({
            name: snippet.name,
            description: snippet.description,
            code: snippet.code,
            type: snippet.type,
            is_active: snippet.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', snippet.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Code snippet updated successfully' })
      } else {
        // Create new snippet
        const { error } = await supabase
          .from(TABLES.CODE_SNIPPETS)
          .insert([{
            ...snippet,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
        setMessage({ type: 'success', text: 'Code snippet created successfully' })
        setNewSnippet({
          name: '',
          description: '',
          code: '',
          type: 'verification',
          is_active: true
        })
        setShowAddForm(false)
      }

      loadCodeSnippets()
    } catch (error) {
      console.error('Error saving snippet:', error)
      setMessage({ type: 'error', text: 'Failed to save code snippet' })
    } finally {
      setSaving(false)
    }
  }

  const deleteSnippet = async (id) => {
    if (!confirm('Are you sure you want to delete this code snippet?')) {
      return
    }

    try {
      const { error } = await supabase
        .from(TABLES.CODE_SNIPPETS)
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Code snippet deleted successfully' })
      loadCodeSnippets()
    } catch (error) {
      console.error('Error deleting snippet:', error)
      setMessage({ type: 'error', text: 'Failed to delete code snippet' })
    }
  }

  const toggleSnippetStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from(TABLES.CODE_SNIPPETS)
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      setMessage({ 
        type: 'success', 
        text: `Code snippet ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      })
      loadCodeSnippets()
    } catch (error) {
      console.error('Error toggling snippet status:', error)
      setMessage({ type: 'error', text: 'Failed to update snippet status' })
    }
  }

  const getTypeIcon = (type) => {
    const typeObj = snippetTypes.find(t => t.value === type)
    const Icon = typeObj?.icon || Code
    return <Icon size={16} />
  }

  // File Upload Functions
  const loadVerificationFiles = async () => {
    try {
      const { data, error } = await dbHelpers.getVerificationFiles()
      if (error) throw error
      setVerificationFiles(data || [])
    } catch (error) {
      console.error('Error loading verification files:', error)
      setMessage({ type: 'error', text: 'Failed to load verification files' })
    }
  }

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedFiles = []

    try {
      for (const file of files) {
        // Validate file
        if (!validateFile(file)) continue

        // Generate unique filename
        const timestamp = Date.now()
        const fileName = `${timestamp}-${file.name}`

        // Upload file
        const { data, error } = await dbHelpers.uploadVerificationFile(file, fileName)
        if (error) throw error

        uploadedFiles.push(data)
      }

      setMessage({
        type: 'success',
        text: `Successfully uploaded ${uploadedFiles.length} file(s)`
      })
      loadVerificationFiles()
      setShowFileUpload(false)
    } catch (error) {
      console.error('Error uploading files:', error)
      setMessage({ type: 'error', text: 'Failed to upload files' })
    } finally {
      setUploading(false)
    }
  }

  const validateFile = (file) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: `File ${file.name} is too large (max 10MB)` })
      return false
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase()
    if (!supportedFileExtensions.includes(extension)) {
      setMessage({
        type: 'error',
        text: `File type ${extension} not supported. Allowed: ${supportedFileExtensions.join(', ')}`
      })
      return false
    }

    return true
  }

  const deleteVerificationFile = async (fileId, storagePath) => {
    try {
      const { error } = await dbHelpers.deleteVerificationFile(fileId, storagePath)
      if (error) throw error

      setMessage({ type: 'success', text: 'File deleted successfully' })
      loadVerificationFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      setMessage({ type: 'error', text: 'Failed to delete file' })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes('javascript') || fileType.includes('js')) return <FileCode size={20} />
    if (fileType.includes('text')) return <FileText size={20} />
    if (fileType.includes('html')) return <Globe size={20} />
    return <Upload size={20} />
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <Check size={16} className="text-green-400" />
      case 'pending': return <Clock size={16} className="text-yellow-400" />
      case 'failed': return <AlertTriangle size={16} className="text-red-400" />
      default: return <Clock size={16} className="text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="code-injection-loading">
        <div className="loading-spinner large"></div>
        <p>Loading code snippets...</p>
      </div>
    )
  }

  return (
    <div className="code-injection-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Code Injection & File Management</h1>
          <p>Manage SEO verification codes, analytics, custom scripts, and upload verification files</p>
        </div>
        <div className="header-actions">
          <button onClick={() => {
            loadCodeSnippets()
            loadVerificationFiles()
          }} className="btn btn-secondary">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => setShowFileUpload(true)}
            className="btn btn-upload"
          >
            <Upload size={18} />
            Upload File
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Add Code Snippet
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'snippets' ? 'active' : ''}`}
          onClick={() => setActiveTab('snippets')}
        >
          <Code size={18} />
          Code Snippets
          <span className="tab-count">{codeSnippets.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <Upload size={18} />
          Verification Files
          <span className="tab-count">{verificationFiles.length}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-header">
            <div className="stat-icon blue">
              <Code size={20} />
            </div>
            <div className="stat-value">{codeSnippets.length}</div>
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Total Snippets</h3>
            <p className="stat-change">All code snippets</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <div className="stat-icon green">
              <CheckCircle size={20} />
            </div>
            <div className="stat-value">{codeSnippets.filter(s => s.is_active).length}</div>
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Active Snippets</h3>
            <p className="stat-change">Currently running</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <div className="stat-icon purple">
              <Upload size={20} />
            </div>
            <div className="stat-value">{verificationFiles.length}</div>
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Uploaded Files</h3>
            <p className="stat-change">Verification files</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <div className="stat-icon orange">
              <Shield size={20} />
            </div>
            <div className="stat-value">{verificationFiles.filter(f => f.verification_status === 'verified').length}</div>
          </div>
          <div className="stat-content">
            <h3 className="stat-title">Verified Files</h3>
            <p className="stat-change">Successfully verified</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="modal-overlay">
          <div className="file-upload-modal">
            <div className="modal-header">
              <h3>Upload Verification File</h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="upload-info">
                <div className="info-grid">
                  {fileTypes.map(type => (
                    <div key={type.value} className="info-card">
                      <div className="info-icon">
                        <type.icon size={24} />
                      </div>
                      <h4>{type.label}</h4>
                      <p>{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={supportedFileExtensions.join(',')}
                  onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                  style={{ display: 'none' }}
                />

                <div className="drop-zone-content">
                  <Upload size={48} />
                  <h3>Drop files here or click to browse</h3>
                  <p>Supported formats: {supportedFileExtensions.join(', ')}</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>

              {uploading && (
                <div className="upload-progress">
                  <div className="loading-spinner"></div>
                  <span>Uploading files...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Snippet Form */}
      {showAddForm && (
        <div className="code-form-card">
          <div className="form-header">
            <h3>Add New Code Snippet</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="close-btn"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            saveSnippet(newSnippet)
          }}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newSnippet.name}
                  onChange={(e) => setNewSnippet({...newSnippet, name: e.target.value})}
                  placeholder="e.g., Google Search Console"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newSnippet.type}
                  onChange={(e) => setNewSnippet({...newSnippet, type: e.target.value})}
                >
                  {snippetTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={newSnippet.description}
                onChange={(e) => setNewSnippet({...newSnippet, description: e.target.value})}
                placeholder="Brief description of this code snippet"
              />
            </div>

            <div className="form-group">
              <label>Code</label>
              <textarea
                value={newSnippet.code}
                onChange={(e) => setNewSnippet({...newSnippet, code: e.target.value})}
                placeholder="Paste your code snippet here..."
                rows={6}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? <div className="loading-spinner small"></div> : <Save size={18} />}
                Save Snippet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'snippets' && (
          <div className="code-snippets-list">
        {codeSnippets.length > 0 ? (
          codeSnippets.map((snippet) => (
            <div key={snippet.id} className="code-snippet-card">
              <div className="snippet-header">
                <div className="snippet-info">
                  <div className="snippet-title">
                    {getTypeIcon(snippet.type)}
                    <h3>{snippet.name}</h3>
                    <span className={`status-badge ${snippet.is_active ? 'active' : 'inactive'}`}>
                      {snippet.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="snippet-description">{snippet.description}</p>
                </div>
                <div className="snippet-actions">
                  <button
                    onClick={() => toggleSnippetStatus(snippet.id, snippet.is_active)}
                    className={`toggle-btn ${snippet.is_active ? 'active' : 'inactive'}`}
                    title={snippet.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {snippet.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => deleteSnippet(snippet.id)}
                    className="delete-btn"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="snippet-code">
                <pre><code>{snippet.code}</code></pre>
              </div>
              
              <div className="snippet-meta">
                <span>Type: {snippetTypes.find(t => t.value === snippet.type)?.label}</span>
                <span>Updated: {new Date(snippet.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-snippets">
            <Code size={64} />
            <h3>No Code Snippets</h3>
            <p>Add your first code snippet to get started with site verification and analytics.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Add Code Snippet
            </button>
          </div>
        )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="verification-files-list">
            {verificationFiles.length > 0 ? (
              <div className="files-grid">
                {verificationFiles.map((file) => (
                  <div key={file.id} className="file-card">
                    <div className="file-header">
                      <div className="file-icon">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="file-info">
                        <h3>{file.file_name}</h3>
                        <p className="file-original">{file.original_name}</p>
                        <div className="file-meta">
                          <span className="file-size">
                            {(file.file_size / 1024).toFixed(1)} KB
                          </span>
                          <span className="file-type">
                            {file.file_type}
                          </span>
                        </div>
                      </div>
                      <div className="file-status">
                        {getStatusIcon(file.verification_status)}
                        <span className={`status-text ${file.verification_status}`}>
                          {file.verification_status}
                        </span>
                      </div>
                    </div>

                    <div className="file-actions">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={16} />
                        View
                      </a>
                      <a
                        href={file.file_url}
                        download={file.original_name}
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={16} />
                        Download
                      </a>
                      <button
                        onClick={() => deleteVerificationFile(file.id, file.storage_path)}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>

                    {file.description && (
                      <div className="file-description">
                        <p>{file.description}</p>
                      </div>
                    )}

                    <div className="file-footer">
                      <span>Uploaded: {new Date(file.created_at).toLocaleDateString()}</span>
                      {file.platform && (
                        <span className="platform-badge">{file.platform}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-files">
                <Upload size={64} />
                <h3>No Verification Files</h3>
                <p>Upload verification files for platform verification like Google Search Console and more.</p>
                <button
                  onClick={() => setShowFileUpload(true)}
                  className="btn btn-upload"
                >
                  <Upload size={18} />
                  Upload First File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeInjection
