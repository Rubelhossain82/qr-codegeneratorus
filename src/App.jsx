import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from 'react-toastify'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import QRCodeGenerator from './pages/QRCodeGenerator'
import QRScanner from './pages/QRScanner'
import BarcodeGenerator from './pages/BarcodeGenerator'
import VCardGenerator from './pages/VCardGenerator'
import WiFiGenerator from './pages/WiFiGenerator'
import ProductSerialGenerator from './pages/ProductSerialGenerator'
import DigitalSignatureGenerator from './pages/DigitalSignatureGenerator'
import NotFound from './pages/NotFound'
import CloudinaryTest from './pages/CloudinaryTest'

// Authentication Components
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import AuthCallback from './pages/AuthCallback'
import { PublicRoute, AdminRoute, CustomerRoute } from './components/auth/ProtectedRoute'

// Customer Components
import CustomerLayout from './components/customer/CustomerLayout'
const CustomerDashboard = React.lazy(() => import('./pages/customer/CustomerDashboard'))
import CustomerProfile from './pages/customer/CustomerProfile'
import CustomerHistory from './pages/customer/CustomerHistory'
import CustomerAnalytics from './pages/customer/CustomerAnalytics'

// Admin Components
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import Analytics from './pages/admin/Analytics'
import CodeInjection from './pages/admin/CodeInjection'
import Users from './pages/admin/Users'
import Advertisements from './pages/admin/Advertisements'
import Settings from './pages/admin/Settings'

// Common Components
// import RouteLoader from './components/common/RouteLoader' // Removed to prevent extra loading

import './App.css'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/qr-generator" element={<Layout><QRCodeGenerator /></Layout>} />
          <Route path="/qr-scanner" element={<Layout><QRScanner /></Layout>} />
          <Route path="/barcode-generator" element={<Layout><BarcodeGenerator /></Layout>} />
          <Route path="/vcard-generator" element={<Layout><VCardGenerator /></Layout>} />
          <Route path="/wifi-generator" element={<Layout><WiFiGenerator /></Layout>} />
          <Route path="/product-serial-generator" element={<Layout><ProductSerialGenerator /></Layout>} />
          <Route path="/digital-signature-generator" element={<Layout><DigitalSignatureGenerator /></Layout>} />
          <Route path="/cloudinary-test" element={<Layout><CloudinaryTest /></Layout>} />

          {/* Authentication Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="code-injection" element={<CodeInjection />} />
            <Route path="users" element={<Users />} />
            <Route path="advertisements" element={<Advertisements />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerRoute><CustomerLayout /></CustomerRoute>}>
            <Route path="dashboard" element={
              <Suspense fallback={<div className="loading-spinner">Loading Dashboard...</div>}>
                <CustomerDashboard />
              </Suspense>
            } />
            {/* Redirect old dashboard route to new one */}
            <Route path="dashboard-customer" element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="history" element={<CustomerHistory />} />
            <Route path="analytics" element={<CustomerAnalytics />} />
            <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          color: 'white'
        }}
      />
    </AuthProvider>
  )
}

export default App
