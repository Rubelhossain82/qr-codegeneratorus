import { Link } from 'react-router-dom'
import { QrCode, BarChart3, Wifi, CreditCard, Package, Shield, Zap, Smartphone, Clock, Download, Users, Star, CheckCircle, Infinity, FileText } from 'lucide-react'

function HomePage() {
  const services = [
    {
      id: 'qr-generator',
      title: 'QR Code Generator',
      description: 'Generate QR codes for URLs, text, and more',
      icon: QrCode,
      path: '/qr-generator',
      status: 'available',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'barcode-generator',
      title: 'Barcode Generator',
      description: 'Create various barcode formats',
      icon: BarChart3,
      path: '/barcode-generator',
      status: 'available',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'vcard-generator',
      title: 'vCard Generator',
      description: 'Generate contact information QR codes',
      icon: CreditCard,
      path: '/vcard-generator',
      status: 'available',
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'wifi-generator',
      title: 'WiFi QR Generator',
      description: 'Create WiFi connection QR codes',
      icon: Wifi,
      path: '/wifi-generator',
      status: 'available',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'product-serial-generator',
      title: 'Product Serial QR',
      description: 'Generate product identification QR codes',
      icon: Package,
      path: '/product-serial-generator',
      status: 'available',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'digital-signature-generator',
      title: 'Digital Signature QR',
      description: 'Create secure authentication QR codes',
      icon: Shield,
      path: '/digital-signature-generator',
      status: 'available',
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate QR codes instantly with our optimized algorithms'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'All processing happens locally in your browser. Your data never leaves your device'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices - desktop, tablet, and mobile'
    }
  ]

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Professional QR Code Generator Suite
            </h1>
            <p className="hero-subtitle">
              Create all types of QR codes that never expire! Generate QR codes for URLs, WiFi, contacts, products, and digital signatures completely free. No signup required, no time limits, no watermarks.
            </p>

            {/* Key Benefits */}
            <div className="hero-benefits">
              <div className="benefit-item">
                <Infinity className="benefit-icon" />
                <span>No Expiration</span>
              </div>
              <div className="benefit-item">
                <Zap className="benefit-icon" />
                <span>Instant Generation</span>
              </div>
              <div className="benefit-item">
                <Shield className="benefit-icon" />
                <span>100% Free</span>
              </div>
              <div className="benefit-item">
                <Download className="benefit-icon" />
                <span>High Quality</span>
              </div>
            </div>
            
            {/* Services Grid */}
            <div className="services-grid">
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <Link
                    key={service.id}
                    to={service.path}
                    className={`service-card ${service.status === 'coming-soon' ? 'coming-soon' : ''}`}
                  >
                    <div className={`service-icon bg-gradient-to-br ${service.color}`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="service-title">{service.title}</h3>
                    {service.status === 'coming-soon' && (
                      <span className="coming-soon-badge">Coming Soon</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our QR Code Generator Section */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our QR Code Generator Free No Expiration?</h2>
          <p className="section-subtitle">
            Unlike other QR code generators that expire your codes or charge fees, our platform offers completely free QR code generation with no expiration dates.
          </p>

          <div className="why-choose-grid">
            <div className="why-choose-card">
              <div className="why-choose-icon">
                <Infinity size={32} />
              </div>
              <h3>Never Expires</h3>
              <p>Your QR codes work forever! No expiration dates, no broken links, no subscription required.</p>
            </div>

            <div className="why-choose-card">
              <div className="why-choose-icon">
                <Shield size={32} />
              </div>
              <h3>100% Free Forever</h3>
              <p>No hidden costs, no premium plans, no watermarks. Create unlimited QR codes completely free.</p>
            </div>

            <div className="why-choose-card">
              <div className="why-choose-icon">
                <Zap size={32} />
              </div>
              <h3>Instant Generation</h3>
              <p>Generate high-quality QR codes in seconds. No waiting, no processing delays.</p>
            </div>

            <div className="why-choose-card">
              <div className="why-choose-icon">
                <Download size={32} />
              </div>
              <h3>High Resolution</h3>
              <p>Download QR codes in PNG, PDF formats with customizable sizes up to 2000x2000 pixels.</p>
            </div>

            <div className="why-choose-card">
              <div className="why-choose-icon">
                <Users size={32} />
              </div>
              <h3>No Registration</h3>
              <p>Start creating QR codes immediately. No signup, no email verification, no personal data required.</p>
            </div>

            <div className="why-choose-card">
              <div className="why-choose-icon">
                <Smartphone size={32} />
              </div>
              <h3>Mobile Friendly</h3>
              <p>Works perfectly on all devices - desktop, tablet, and mobile. Responsive design for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Powerful Features for Free</h2>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="how-to-use-section">
        <div className="container">
          <h2 className="section-title">How to Create QR Codes in 3 Simple Steps</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Enter Your Content</h3>
              <p>Type your text, URL, email, phone number, or any content you want to encode in the QR code.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Customize Design</h3>
              <p>Choose colors, add logo, adjust size, and customize your QR code to match your brand.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Download & Use</h3>
              <p>Download your QR code in high resolution PNG or PDF format. Use it anywhere, anytime!</p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Types Section */}
      <section className="qr-types-section">
        <div className="container">
          <h2 className="section-title">Types of QR Codes You Can Create</h2>
          <div className="qr-types-grid">
            <div className="qr-type-card">
              <QrCode className="qr-type-icon" />
              <h3>Website URL</h3>
              <p>Direct users to your website, landing page, or any online content instantly.</p>
            </div>

            <div className="qr-type-card">
              <FileText className="qr-type-icon" />
              <h3>Plain Text</h3>
              <p>Share messages, instructions, or any text content through QR codes.</p>
            </div>

            <div className="qr-type-card">
              <Users className="qr-type-icon" />
              <h3>Contact Info</h3>
              <p>Share your contact details, vCard, or business information easily.</p>
            </div>

            <div className="qr-type-card">
              <Smartphone className="qr-type-icon" />
              <h3>Phone Number</h3>
              <p>Allow users to call you directly by scanning the QR code.</p>
            </div>

            <div className="qr-type-card">
              <Shield className="qr-type-icon" />
              <h3>Email Address</h3>
              <p>Enable quick email composition with pre-filled recipient and subject.</p>
            </div>

            <div className="qr-type-card">
              <Star className="qr-type-icon" />
              <h3>Social Media</h3>
              <p>Link to your social media profiles, pages, or specific posts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Start Creating QR Codes Free No Expiration!</h2>
            <p className="cta-description">
              Join thousands of users who trust our free QR code generator. No expiration, no limits, no cost - just professional QR codes when you need them.
            </p>
            <div className="cta-buttons">
              <Link to="/qr-generator" className="btn btn-primary">
                Create QR Code Now - Free Forever
              </Link>
              <Link to="/vcard-generator" className="btn btn-secondary">
                Generate vCard QR
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
