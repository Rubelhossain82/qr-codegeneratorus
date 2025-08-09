import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubjdlnlslmmvpconxzcu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViamRsbmxzbG1tdnBjb254emN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTYwMjQsImV4cCI6MjA2OTg3MjAyNH0.I1YYIzsSsTA-r_aKa64L6Mc1a2R1PeNgekIfe-ltkpc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})



// Database table names
export const TABLES = {
  USERS: 'user_profiles',
  VISITORS: 'visitors',
  PAGE_ANALYTICS: 'page_analytics',
  ADVERTISEMENTS: 'advertisements',
  CODE_SNIPPETS: 'code_snippets',
  QR_HISTORY: 'qr_history',
  SETTINGS: 'settings',
  VERIFICATION_FILES: 'verification_files'
}

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer'
}

// Helper functions for authentication
export const authHelpers = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    try {
      console.log('Supabase signUp called with:', { email, userData })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: USER_ROLES.CUSTOMER,
            ...userData
          }
        }
      })
      console.log('Supabase auth.signUp result:', { data, error })

      if (error) {
        console.error('Auth signup error:', error)
        return { data: null, error }
      }

      return { data, error }
    } catch (error) {
      console.error('Unexpected signup error:', error)
      return { data: null, error }
    }
  },

  // Sign in user
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Google OAuth sign in
  signInWithGoogle: async () => {
    try {
      console.log('Attempting Google OAuth sign in...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      console.log('Google OAuth result:', { data, error })
      return { data, error }
    } catch (error) {
      console.error('Google OAuth error:', error)
      return { data: null, error }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      return { user: null, error }
    }
  },

  // Check if user is admin
  isAdmin: (user) => {
    return user?.user_metadata?.role === USER_ROLES.ADMIN || 
           user?.email === 'rubel820746@gmail.com'
  },

  // Get user role
  getUserRole: (user) => {
    if (user?.email === 'rubel820746@gmail.com') {
      return USER_ROLES.ADMIN
    }
    return user?.user_metadata?.role || USER_ROLES.CUSTOMER
  }
}

// Database helpers
export const dbHelpers = {
  // Track visitor
  trackVisitor: async (pageUrl, userAgent, ipAddress = null) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.VISITORS)
        .insert([
          {
            page_url: pageUrl,
            user_agent: userAgent,
            ip_address: ipAddress,
            visited_at: new Date().toISOString()
          }
        ])
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get visitor analytics
  getVisitorAnalytics: async (period = 'daily') => {
    try {
      let query = supabase
        .from(TABLES.VISITORS)
        .select('*')
        .order('visited_at', { ascending: false })

      // Apply date filters based on period
      const now = new Date()
      let startDate

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }

      query = query.gte('visited_at', startDate.toISOString())

      const { data, error } = await query
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Save QR code generation history
  saveQRHistory: async (userId, qrData, qrType, settings) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.QR_HISTORY)
        .insert([
          {
            user_id: userId,
            content: qrData,
            type: qrType,
            format: settings?.format || 'png',
            size: settings?.size?.width || settings?.size || 256,
            foreground_color: settings?.colors?.foreground || '#000000',
            background_color: settings?.colors?.background || '#ffffff',
            logo_url: settings?.logo?.cloudinary_url || settings?.logo?.url || null,
            download_count: 1, // Initial download
            scan_count: 0,
            created_at: new Date().toISOString()
          }
        ])
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get user's QR history
  getUserQRHistory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.QR_HISTORY)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Increment download count for a QR code
  incrementDownloadCount: async (qrId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.QR_HISTORY)
        .update({
          download_count: supabase.raw('download_count + 1')
        })
        .eq('id', qrId)
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Increment scan count for a QR code
  incrementScanCount: async (qrId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.QR_HISTORY)
        .update({
          scan_count: supabase.raw('scan_count + 1')
        })
        .eq('id', qrId)
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // User Management Functions
  getAllUsers: async (page = 1, limit = 10, search = '') => {
    try {
      let query = supabase
        .from(TABLES.USERS)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      return { data, error, count }
    } catch (error) {
      return { data: null, error, count: 0 }
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  deleteUser: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .delete()
        .eq('id', userId)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  getUserStats: async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('role, created_at')

      if (error) return { data: null, error }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const stats = {
        total: data.length,
        admins: data.filter(user => user.role === 'admin').length,
        customers: data.filter(user => user.role === 'customer').length,
        todaySignups: data.filter(user => new Date(user.created_at) >= today).length,
        weeklySignups: data.filter(user => new Date(user.created_at) >= thisWeek).length,
        monthlySignups: data.filter(user => new Date(user.created_at) >= thisMonth).length
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Advertisement Management Functions
  getAllAdvertisements: async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ADVERTISEMENTS)
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  createAdvertisement: async (adData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ADVERTISEMENTS)
        .insert([{
          ...adData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  updateAdvertisement: async (adId, adData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ADVERTISEMENTS)
        .update({
          ...adData,
          updated_at: new Date().toISOString()
        })
        .eq('id', adId)
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  deleteAdvertisement: async (adId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ADVERTISEMENTS)
        .delete()
        .eq('id', adId)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Settings Management Functions
  getSettings: async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SETTINGS)
        .select('*')
        .order('category')
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  updateSetting: async (key, value, category = 'general') => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SETTINGS)
        .upsert({
          key,
          value,
          category,
          updated_at: new Date().toISOString()
        })
        .select()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Enhanced Analytics Functions
  getDetailedAnalytics: async (period = 'daily') => {
    try {
      const { data, error } = await dbHelpers.getVisitorAnalytics(period)

      if (error) return { data: null, error }

      // Process data for detailed analytics
      const processedData = {
        totalViews: data.length,
        uniqueVisitors: new Set(data.map(item => item.ip_address)).size,
        pageViews: {},
        hourlyData: Array(24).fill(0),
        dailyData: {},
        topPages: {},
        userAgents: {},
        referrers: {}
      }

      data.forEach(visit => {
        const visitDate = new Date(visit.visited_at)
        const hour = visitDate.getHours()
        const day = visitDate.toDateString()

        // Hourly data
        processedData.hourlyData[hour]++

        // Daily data
        processedData.dailyData[day] = (processedData.dailyData[day] || 0) + 1

        // Page views
        processedData.topPages[visit.page_url] = (processedData.topPages[visit.page_url] || 0) + 1

        // User agents (simplified)
        const userAgent = visit.user_agent || 'Unknown'
        const browser = userAgent.includes('Chrome') ? 'Chrome' :
                       userAgent.includes('Firefox') ? 'Firefox' :
                       userAgent.includes('Safari') ? 'Safari' : 'Other'
        processedData.userAgents[browser] = (processedData.userAgents[browser] || 0) + 1
      })

      return { data: processedData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // File Upload and Management Functions
  uploadVerificationFile: async (file, fileName) => {
    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-files')
        .upload(`public/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('verification-files')
        .getPublicUrl(`public/${fileName}`)

      // Save file info to database
      const { data: dbData, error: dbError } = await supabase
        .from(TABLES.VERIFICATION_FILES)
        .insert([{
          file_name: fileName,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: urlData.publicUrl,
          storage_path: uploadData.path,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      return { data: { upload: uploadData, url: urlData.publicUrl, record: dbData }, error: dbError }
    } catch (error) {
      return { data: null, error }
    }
  },

  getVerificationFiles: async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.VERIFICATION_FILES)
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  deleteVerificationFile: async (fileId, storagePath) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('verification-files')
        .remove([storagePath])

      if (storageError) console.warn('Storage deletion error:', storageError)

      // Delete from database
      const { data, error } = await supabase
        .from(TABLES.VERIFICATION_FILES)
        .delete()
        .eq('id', fileId)

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  checkFileVerification: async (fileName) => {
    try {
      // Check if file exists and is accessible
      const { data, error } = await supabase.storage
        .from('verification-files')
        .download(`public/${fileName}`)

      return { exists: !error, data, error }
    } catch (error) {
      return { exists: false, data: null, error }
    }
  }
}
