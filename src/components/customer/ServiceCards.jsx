import { Link } from 'react-router-dom'
import {
  QrCode,
  Link as LinkIcon,
  User,
  Wifi,
  Mail,
  MessageSquare,
  BarChart3,
  ExternalLink,
  Scan
} from 'lucide-react'
import './ServiceCards.css'

const ServiceCards = () => {
  const services = [
    {
      id: 'qr-generator',
      title: 'QR Code Generator',
      description: 'Create custom QR codes for any text or URL',
      icon: QrCode,
      path: '/qr-generator',
      color: 'blue'
    },
    {
      id: 'qr-scanner',
      title: 'QR img Scanner',
      description: 'Scan QR codes from images instantly',
      icon: Scan,
      path: '/qr-code-scanner-from-image',
      color: 'indigo'
    },
    {
      id: 'url-qr',
      title: 'URL QR Generator',
      description: 'Generate QR codes specifically for website URLs',
      icon: LinkIcon,
      path: '/qr-generator',
      color: 'green'
    },
    {
      id: 'vcard-qr',
      title: 'vCard QR Generator',
      description: 'Create QR codes for contact information',
      icon: User,
      path: '/vcard-generator',
      color: 'purple'
    },
    {
      id: 'wifi-qr',
      title: 'WiFi QR Generator',
      description: 'Generate QR codes for WiFi network access',
      icon: Wifi,
      path: '/wifi-generator',
      color: 'orange'
    },
    {
      id: 'email-qr',
      title: 'Email QR Generator',
      description: 'Create QR codes for email addresses',
      icon: Mail,
      path: '/qr-generator',
      color: 'red'
    },
    {
      id: 'sms-qr',
      title: 'SMS QR Generator',
      description: 'Generate QR codes for SMS messages',
      icon: MessageSquare,
      path: '/qr-generator',
      color: 'indigo'
    },
    {
      id: 'barcode-generator',
      title: 'Barcode Generator',
      description: 'Create various types of barcodes',
      icon: BarChart3,
      path: '/barcode-generator',
      color: 'teal'
    }
  ]

  return (
    <div className="service-cards-container">
      <div className="service-cards-header">
        <h2 className="service-cards-title">Our Services</h2>
        <p className="service-cards-subtitle">
          Choose from our collection of generator tools to create QR codes and barcodes for your needs
        </p>
      </div>

      <div className="service-cards-grid">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Link
              key={service.id}
              to={service.path}
              className={`service-card ${service.color}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="service-card-icon">
                <Icon size={28} />
              </div>

              <div className="service-card-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-action">
                  <span>Use Tool</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ServiceCards
