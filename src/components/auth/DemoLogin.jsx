import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { User, Eye, EyeOff, LogIn } from 'lucide-react'

const DemoLogin = () => {
  const [showDemo, setShowDemo] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  // Demo customer credentials
  const demoCredentials = {
    email: 'demo@customer.com',
    password: 'demo123456'
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await signIn(demoCredentials.email, demoCredentials.password)

      if (error) {
        toast.error('Demo login failed. Please try again.')
        console.error('Demo login error:', error)
      } else if (data?.user) {
        toast.success('Welcome to Demo Customer Dashboard!')
        navigate('/customer/dashboard')
      }
    } catch (err) {
      toast.error('Demo login failed. Please try again.')
      console.error('Demo login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="demo-login-section">
      <div className="demo-header">
        <h3>🚀 Try Demo Customer Dashboard</h3>
        <p>Experience all customer features without creating an account</p>
      </div>

      <div className="demo-actions">
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="demo-toggle-btn"
        >
          <Eye size={16} />
          {showDemo ? 'Hide' : 'Show'} Demo Credentials
        </button>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="demo-login-btn"
        >
          {loading ? (
            <>
              <div className="loading-spinner-small"></div>
              Logging in...
            </>
          ) : (
            <>
              <LogIn size={16} />
              Quick Demo Login
            </>
          )}
        </button>
      </div>

      {showDemo && (
        <div className="demo-credentials">
          <div className="demo-credential-item">
            <label>Email:</label>
            <div className="credential-value">
              <User size={14} />
              <span>{demoCredentials.email}</span>
            </div>
          </div>
          <div className="demo-credential-item">
            <label>Password:</label>
            <div className="credential-value">
              <EyeOff size={14} />
              <span>{demoCredentials.password}</span>
            </div>
          </div>
          <div className="demo-note">
            <p>💡 Use these credentials to manually login or click "Quick Demo Login" for instant access</p>
          </div>
        </div>
      )}

      <div className="demo-features">
        <h4>Demo Features Include:</h4>
        <ul>
          <li>✅ Service Cards for all QR/Barcode generators</li>
          <li>✅ QR Code generation history and statistics</li>
          <li>✅ Comprehensive dashboard with analytics</li>
          <li>✅ Profile management</li>
          <li>✅ Download tracking and usage stats</li>
        </ul>
      </div>
    </div>
  )
}

export default DemoLogin
