import { Link, useLocation } from 'react-router-dom'
import { QrCode, Menu, X, User, LogIn, UserPlus, LogOut, Settings, ChevronDown, Search, Hash, Wifi, CreditCard, Package, Shield, BarChart3, Bell, UserCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import useVisitorTracking from '../hooks/useVisitorTracking'

function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showServicesMenu, setShowServicesMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const location = useLocation()
  const { user, signOut, isAdmin, loading } = useAuth()

  // Track visitor activity
  useVisitorTracking()

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New Blog Post',
      message: 'Check out our latest article on QR code best practices',
      time: '2 hours ago',
      read: false,
      type: 'blog'
    },
    {
      id: 2,
      title: 'System Update',
      message: 'We have improved our QR code generation speed by 50%',
      time: '1 day ago',
      read: false,
      type: 'system'
    },
    {
      id: 3,
      title: 'New Feature',
      message: 'Digital Signature QR codes are now available',
      time: '3 days ago',
      read: true,
      type: 'feature'
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const services = [
    {
      name: 'QR Code Generator',
      href: '/qr-generator',
      icon: QrCode,
      description: 'Generate QR codes for URLs, text, and more'
    },
    {
      name: 'Barcode Generator',
      href: '/barcode-generator',
      icon: BarChart3,
      description: 'Create various barcode formats'
    },
    {
      name: 'vCard Generator',
      href: '/vcard-generator',
      icon: CreditCard,
      description: 'Generate contact information QR codes'
    },
    {
      name: 'WiFi QR Generator',
      href: '/wifi-generator',
      icon: Wifi,
      description: 'Create WiFi connection QR codes'
    },
    {
      name: 'Product Serial Generator',
      href: '/product-serial-generator',
      icon: Package,
      description: 'Generate product identification QR codes'
    },
    {
      name: 'Digital Signature QR',
      href: '/digital-signature-generator',
      icon: Shield,
      description: 'Create secure authentication QR codes'
    }
  ]

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Global search content
  const searchContent = [
    ...services.map(service => ({
      type: 'service',
      title: service.name,
      description: service.description,
      url: service.href,
      icon: service.icon
    })),
    {
      type: 'page',
      title: 'Home',
      description: 'Professional QR Code Generator Suite',
      url: '/',
      icon: QrCode
    },
    {
      type: 'help',
      title: 'How to create QR codes',
      description: 'Learn how to generate QR codes in 3 simple steps',
      url: '/#how-to-use',
      icon: Hash
    },
    {
      type: 'help',
      title: 'QR Code Types',
      description: 'Discover all types of QR codes you can create',
      url: '/#qr-types',
      icon: Package
    }
  ]

  const globalSearchResults = globalSearchQuery
    ? searchContent.filter(item =>
        item.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(globalSearchQuery.toLowerCase())
      )
    : []

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setShowServicesMenu(false)
    setShowUserMenu(false)
    setShowNotifications(false)
    setShowSearchModal(false)
  }, [location.pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.services-dropdown')) {
        setShowServicesMenu(false)
      }
      if (!event.target.closest('.user-menu-wrapper')) {
        setShowUserMenu(false)
      }
      if (!event.target.closest('.notifications-wrapper')) {
        setShowNotifications(false)
      }
      if (!event.target.closest('.search-modal') && !event.target.closest('.search-btn')) {
        setShowSearchModal(false)
      }
      if (isMenuOpen && !event.target.closest('.header')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <div className="app">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Floating particles background */}
      <div className="particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 3}`}></div>
        ))}
      </div>

      <header className="header" role="banner">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo-section" aria-label="qrcodegeneratorus - Home">
              <QrCode className="logo-icon" aria-hidden="true" />
              <h1>qrcodegeneratorus</h1>
            </Link>

            <div className="header-center">
              <nav className="nav-desktop" role="navigation" aria-label="Main navigation">
                <Link
                  to="/"
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  Home
                </Link>

                <div className="services-dropdown">
                  <button
                    className={`nav-link services-btn ${services.some(s => location.pathname === s.href) ? 'active' : ''}`}
                    onClick={() => setShowServicesMenu(!showServicesMenu)}
                    aria-expanded={showServicesMenu}
                    aria-haspopup="true"
                  >
                    Services
                    <ChevronDown size={16} className={`chevron ${showServicesMenu ? 'rotated' : ''}`} />
                  </button>

                  {showServicesMenu && (
                    <div className="services-menu">
                      <div className="services-search">
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Search services..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                        />
                      </div>

                      <div className="services-list">
                        {filteredServices.map((service) => {
                          const Icon = service.icon
                          return (
                            <Link
                              key={service.name}
                              to={service.href}
                              className={`service-item ${location.pathname === service.href ? 'active' : ''}`}
                              onClick={() => setShowServicesMenu(false)}
                            >
                              <div className="service-icon">
                                <Icon size={20} />
                              </div>
                              <div className="service-info">
                                <div className="service-name">{service.name}</div>
                                <div className="service-description">{service.description}</div>
                              </div>
                            </Link>
                          )
                        })}

                        {filteredServices.length === 0 && (
                          <div className="no-results">
                            <p>No services found matching "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              {/* Red Announcement Box in Header */}
              <div className="header-announcement">
                <div className="announcement-content">
                  <div className="scrolling-text">
                    🎉 All tools 100% FREE • ⚡ No registration • 🚫 No watermarks • ♾️ No expiration • 🎯 Unlimited use • 📱 Mobile friendly • 🔒 Secure & private •
                  </div>
                </div>
              </div>
            </div>

            <div className="header-right">
              {!loading && (
                <>
                  {user ? (
                    // Authenticated user menu
                    <div className="user-menu-container">
                      <div className="header-actions">
                        <button
                          className="action-btn search-btn"
                          aria-label="Search"
                          onClick={() => setShowSearchModal(!showSearchModal)}
                        >
                          <Search size={20} />
                        </button>

                        <div className="notifications-wrapper">
                          <button
                            className="action-btn notifications-btn"
                            aria-label="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                          >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                              <span className="notification-badge">{unreadCount}</span>
                            )}
                          </button>

                          {showNotifications && (
                            <div className="notifications-dropdown">
                              <div className="notifications-header">
                                <h3>Notifications</h3>
                                <span className="notification-count">{unreadCount} new</span>
                              </div>
                              <div className="notifications-list">
                                {notifications.map((notification) => (
                                  <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                  >
                                    <div className="notification-content">
                                      <h4>{notification.title}</h4>
                                      <p>{notification.message}</p>
                                      <span className="notification-time">{notification.time}</span>
                                    </div>
                                    {!notification.read && <div className="unread-dot"></div>}
                                  </div>
                                ))}
                              </div>
                              <div className="notifications-footer">
                                <button className="mark-all-read">Mark all as read</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="user-menu-wrapper">
                        <button
                          className="profile-icon"
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          aria-label="User profile menu"
                        >
                          <UserCircle size={24} aria-hidden="true" />
                        </button>

                        {showUserMenu && (
                          <div className="user-dropdown">
                            <div className="user-info">
                              <div className="user-avatar">
                                <UserCircle size={40} />
                              </div>
                              <div className="user-details">
                                <p className="user-name">{user.user_metadata?.full_name || user.email}</p>
                                <p className="user-role">{isAdmin() ? 'Admin' : 'Customer'}</p>
                              </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link
                              to={isAdmin() ? '/admin/dashboard' : '/customer/dashboard-customer'}
                              className="dropdown-item"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings size={16} />
                              Dashboard
                            </Link>
                            <Link
                              to={isAdmin() ? '/admin/settings' : '/customer/profile'}
                              className="dropdown-item"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User size={16} />
                              Profile
                            </Link>
                            <Link
                              to={isAdmin() ? '/admin/settings' : '/customer/settings'}
                              className="dropdown-item"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings size={16} />
                              Settings
                            </Link>
                            <div className="dropdown-divider"></div>
                            <button
                              onClick={async () => {
                                await signOut()
                                setShowUserMenu(false)
                              }}
                              className="dropdown-item logout"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Guest user buttons
                    <div className="auth-buttons">
                      <Link to="/login" className="auth-btn login-btn">
                        <LogIn size={18} />
                        Sign In
                      </Link>
                      <Link to="/signup" className="auth-btn signup-btn">
                        <UserPlus size={18} />
                        Sign Up
                      </Link>
                    </div>
                  )}
                </>
              )}

              <button
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav
              className="nav-mobile"
              id="mobile-navigation"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <Link
                to="/"
                className={`nav-link-mobile ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                Home
              </Link>

              <div className="mobile-services-section">
                <div className="mobile-section-title">Services</div>
                {services.map((service) => {
                  const Icon = service.icon
                  return (
                    <Link
                      key={service.name}
                      to={service.href}
                      className={`nav-link-mobile service-link ${location.pathname === service.href ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={location.pathname === service.href ? 'page' : undefined}
                    >
                      <Icon size={18} />
                      <span>{service.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="search-modal-overlay">
          <div className="search-modal">
            <div className="search-modal-header">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="global-search-input"
                  autoFocus
                />
                <button
                  className="search-close"
                  onClick={() => setShowSearchModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="search-results">
              {globalSearchQuery && globalSearchResults.length > 0 ? (
                <div className="search-results-list">
                  {globalSearchResults.map((result, index) => {
                    const Icon = result.icon
                    return (
                      <Link
                        key={index}
                        to={result.url}
                        className="search-result-item"
                        onClick={() => {
                          setShowSearchModal(false)
                          setGlobalSearchQuery('')
                        }}
                      >
                        <div className="result-icon">
                          <Icon size={20} />
                        </div>
                        <div className="result-content">
                          <h4>{result.title}</h4>
                          <p>{result.description}</p>
                          <span className="result-type">{result.type}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : globalSearchQuery ? (
                <div className="no-search-results">
                  <p>No results found for "{globalSearchQuery}"</p>
                </div>
              ) : (
                <div className="search-suggestions">
                  <h3>Popular searches</h3>
                  <div className="suggestion-tags">
                    <button onClick={() => setGlobalSearchQuery('QR code')}>QR code</button>
                    <button onClick={() => setGlobalSearchQuery('barcode')}>Barcode</button>
                    <button onClick={() => setGlobalSearchQuery('vCard')}>vCard</button>
                    <button onClick={() => setGlobalSearchQuery('WiFi')}>WiFi</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="main" id="main-content" role="main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-logo">
                <QrCode className="footer-logo-icon" aria-hidden="true" />
                <span>Generatorus</span>
              </div>
              <p className="footer-description">
                Professional utility platform for QR codes, barcodes, and digital tools.
                Create, customize, and download high-quality codes for your business needs.
              </p>
              <div className="footer-social">
                <a
                  href="https://www.facebook.com/rubelhossain999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Follow us on Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-center">
              <h4 className="footer-section-title">QR Code Generators</h4>
              <nav className="footer-links" role="navigation" aria-label="Footer navigation">
                <Link to="/qr-generator" className="footer-link">Text QR Code</Link>
                <Link to="/url-generator" className="footer-link">URL QR Code</Link>
                <Link to="/vcard-generator" className="footer-link">vCard QR Code</Link>
                <Link to="/wifi-generator" className="footer-link">WiFi QR Code</Link>
                <Link to="/email-generator" className="footer-link">Email QR Code</Link>
                <Link to="/sms-generator" className="footer-link">SMS QR Code</Link>
              </nav>
            </div>

            <div className="footer-right">
              <h4 className="footer-section-title">Support & Info</h4>
              <div className="footer-info">
                <p className="footer-info-text">✅ 100% Free Tools</p>
                <p className="footer-info-text">🚫 No Registration Required</p>
                <p className="footer-info-text">⚡ Fast & Secure</p>
                <p className="footer-info-text">📱 Mobile Friendly</p>
                <p className="footer-info-text">🔒 Privacy Protected</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="copyright">
                <p>&copy; 2025 Generatorus. All rights reserved.</p>
                <p className="developer">
                  Developed with ❤️ by{' '}
                  <a
                    href="https://www.facebook.com/rubelhossain999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="developer-name"
                  >
                    Rubel Hossain
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
