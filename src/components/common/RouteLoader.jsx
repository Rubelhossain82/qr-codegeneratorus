import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './RouteLoader.css'

const RouteLoader = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Show loader on route change
    setLoading(true)
    
    // Hide loader after a short delay to allow content to render
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      {loading && (
        <div className="route-loader">
          <div className="route-loader-content">
            <div className="route-loader-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}
      <div className={`route-content ${loading ? 'route-loading' : 'route-loaded'}`}>
        {children}
      </div>
    </>
  )
}

export default RouteLoader
