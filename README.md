# 🎯 QR Code & Barcode Generator - Generatorus

A comprehensive web application for generating QR codes, barcodes, and various digital codes with advanced customization options.

## ✨ Features

### 🔲 QR Code Generator
- **Text & URL QR Codes** - Generate QR codes for any text or URL
- **Custom Colors** - Customize foreground and background colors
- **Logo Integration** - Add custom logos to QR codes
- **Multiple Export Formats** - PNG, JPG, SVG, PDF
- **Custom Sizes** - Flexible sizing options

### 📊 Barcode Generator
- **Multiple Formats** - CODE128, CODE39, EAN13, EAN8, UPC-A, ITF-14, MSI, Pharmacode
- **Customizable Design** - Colors, sizes, fonts
- **Real-time Validation** - Format-specific data validation
- **Export Options** - Various formats and sizes

### 📇 Specialized Generators
- **vCard Generator** - Contact information QR codes
- **WiFi QR Generator** - WiFi connection codes
- **Product Serial Generator** - Product identification codes
- **Digital Signature Generator** - Security features

### 👥 User Management
- **Authentication System** - Secure login/signup
- **Role-based Access** - Admin and Customer roles
- **User Profiles** - Personal information management
- **Generation History** - Track all generated codes

### 📊 Admin Dashboard
- **Analytics** - Visitor tracking and statistics
- **User Management** - Manage all users
- **Advertisement Management** - Control ads placement
- **SEO Tools** - Code injection for optimization
- **Settings Management** - Application configuration

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library

### QR & Barcode Libraries
- **qrcode** & **qrcode.react** - QR code generation
- **jsbarcode** - Barcode generation
- **jsPDF** - PDF export functionality

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Data security

### File Management
- **Cloudinary** - Image hosting and optimization

### UI/UX
- **React Color** - Color picker component
- **React Toastify** - Toast notifications
- **CSS3** - Modern styling with animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Cloudinary account (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/qrcodegeneratorus.git
cd qrcodegeneratorus
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_UNSIGNED_PRESET=your_upload_preset
```

4. **Database Setup**
Run the SQL commands from `database-schema.sql` in your Supabase SQL editor.

5. **Start the development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

## 📁 Project Structure

```
qrcodegeneratorus/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared components
│   │   └── customer/       # Customer-specific components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── supabase.js     # Supabase configuration
│   │   └── cloudinary.js   # Cloudinary configuration
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   └── customer/       # Customer pages
│   ├── services/           # API services
│   ├── styles/             # Global styles
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── docs/                   # Documentation
└── supabase/              # Supabase migrations
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level security
- **JWT Authentication** - Secure token-based auth
- **Protected Routes** - Role-based access control
- **Email Verification** - Account verification
- **Input Validation** - Client and server-side validation

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:
- `user_profiles` - Extended user information
- `qr_history` - QR code generation history
- `visitors` - Analytics and visitor tracking
- `advertisements` - Ad management
- `code_snippets` - SEO and third-party integrations
- `settings` - Application configuration

## 🎨 Customization

### Colors
The application supports custom color schemes for QR codes and barcodes with a built-in color picker.

### Logos
Upload custom logos for QR codes with position and size controls.

### Export Formats
- **Images**: PNG, JPG, SVG
- **Documents**: PDF with custom layouts
- **Sizes**: Predefined and custom dimensions

## 🔧 API Integration

### Supabase
- Authentication and user management
- Real-time database operations
- File storage and management

### Cloudinary
- Image upload and optimization
- Logo management for QR codes
- Automatic format conversion

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🚀 Deployment

### Netlify/Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Supabase for the backend infrastructure
- Cloudinary for image management
- All open-source contributors

## 📞 Support

For support, email support@generatorus.com or create an issue on GitHub.

---

**Made with ❤️ by the Generatorus Team**