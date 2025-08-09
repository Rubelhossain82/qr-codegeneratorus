import { supabase } from '../lib/supabase'

// Generate unique session ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('analytics_session_id', sessionId)
    sessionStorage.setItem('session_start_time', Date.now().toString())
  }
  return sessionId
}

// Get user's location using multiple IP geolocation services
const getLocationData = async () => {
  try {
    // Try multiple services for better reliability
    const services = [
      'https://ipapi.co/json/',
      'https://api.ipify.org?format=json', // Fallback for IP only
      'https://httpbin.org/ip' // Another fallback
    ]

    // First try ipapi.co for full location data
    try {
      const response = await fetch('https://ipapi.co/json/', {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      })
      const data = await response.json()

      if (data && data.country_name) {
        return {
          country: data.country_name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          ip: data.ip || 'Unknown'
        }
      }
    } catch (error) {
      // Fallback silently
    }

    // Fallback: Use a simpler service or default values
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      ip: 'Unknown'
    }
  } catch (error) {
    console.error('Error getting location:', error)
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      ip: 'Unknown'
    }
  }
}

// Parse user agent for device info
const parseUserAgent = (userAgent) => {
  const ua = userAgent.toLowerCase()
  
  // Device type detection
  let deviceType = 'Desktop'
  if (/mobile|android|iphone|ipad|tablet/.test(ua)) {
    deviceType = /tablet|ipad/.test(ua) ? 'Tablet' : 'Mobile'
  }
  
  // Browser detection
  let browser = 'Unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  // OS detection
  let os = 'Unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios')) os = 'iOS'
  
  return { deviceType, browser, os }
}

// Get UTM parameters from URL
const getUTMParameters = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null
  }
}

// Track page view with better error handling
export const trackPageView = async (pageUrl, pageTitle) => {
  try {
    const sessionId = getSessionId()

    // Get location data
    const locationData = await getLocationData()

    const { deviceType, browser, os } = parseUserAgent(navigator.userAgent)
    const utmParams = getUTMParameters()

    // Get referrer
    const referrer = document.referrer || 'Direct'

    // Get screen resolution
    const screenResolution = `${screen.width}x${screen.height}`

    // Prepare visitor data
    const visitorData = {
      page_visited: pageUrl, // Use correct column name
      user_agent: navigator.userAgent,
      country: locationData.country,
      city: locationData.city,
      region: locationData.region,
      referrer: referrer,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      device_type: deviceType,
      browser: browser,
      os: os,
      screen_resolution: screenResolution,
      session_id: sessionId,
      visited_at: new Date().toISOString()
    }

    // Track visitor
    const { data: visitorResult, error: visitorError } = await supabase
      .from('visitors')
      .insert(visitorData)
      .select()

    if (visitorError) {
      console.error('Error tracking visitor:', visitorError)
    }

    // Track page analytics if table exists
    try {
      const { data: pageResult, error: pageError } = await supabase
        .from('page_analytics')
        .insert({
          session_id: sessionId,
          page_url: pageUrl,
          page_title: pageTitle || document.title,
          entered_at: new Date().toISOString()
        })
        .select()

      if (pageError) {
        console.error('⚠️ Error tracking page analytics:', pageError)
      } else {
        console.log('✅ Page analytics tracked:', pageResult)
      }
    } catch (pageAnalyticsError) {
      console.log('⚠️ Page analytics table might not exist:', pageAnalyticsError)
    }

    // Store current page data for exit tracking
    sessionStorage.setItem('current_page_url', pageUrl)
    sessionStorage.setItem('page_enter_time', Date.now().toString())

    console.log('✅ Page view tracking completed')

  } catch (error) {
    console.error('❌ Error in trackPageView:', error)
  }
}

// Track page exit
export const trackPageExit = async () => {
  try {
    const sessionId = getSessionId()
    const currentPageUrl = sessionStorage.getItem('current_page_url')
    const pageEnterTime = sessionStorage.getItem('page_enter_time')
    
    if (!currentPageUrl || !pageEnterTime) return
    
    const timeOnPage = Math.floor((Date.now() - parseInt(pageEnterTime)) / 1000)
    
    // Update page analytics with exit time and duration
    const { error } = await supabase
      .from('page_analytics')
      .update({
        exited_at: new Date().toISOString(),
        time_on_page: timeOnPage
      })
      .eq('session_id', sessionId)
      .eq('page_url', currentPageUrl)
      .is('exited_at', null)
    
    if (error) {
      console.error('Error tracking page exit:', error)
    }
    
  } catch (error) {
    console.error('Error in trackPageExit:', error)
  }
}

// Track scroll depth
export const trackScrollDepth = async (scrollPercentage) => {
  try {
    const sessionId = getSessionId()
    const currentPageUrl = sessionStorage.getItem('current_page_url')
    
    if (!currentPageUrl) return
    
    const { error } = await supabase
      .from('page_analytics')
      .update({
        scroll_depth: Math.max(scrollPercentage, 0)
      })
      .eq('session_id', sessionId)
      .eq('page_url', currentPageUrl)
      .is('exited_at', null)
    
    if (error) {
      console.error('Error tracking scroll depth:', error)
    }
    
  } catch (error) {
    console.error('Error in trackScrollDepth:', error)
  }
}

// Track click events
export const trackClick = async (elementType, elementText) => {
  try {
    const sessionId = getSessionId()
    const currentPageUrl = sessionStorage.getItem('current_page_url')
    
    if (!currentPageUrl) return
    
    // Increment click count
    const { data: currentData } = await supabase
      .from('page_analytics')
      .select('clicks')
      .eq('session_id', sessionId)
      .eq('page_url', currentPageUrl)
      .is('exited_at', null)
      .single()
    
    const currentClicks = currentData?.clicks || 0
    
    const { error } = await supabase
      .from('page_analytics')
      .update({
        clicks: currentClicks + 1
      })
      .eq('session_id', sessionId)
      .eq('page_url', currentPageUrl)
      .is('exited_at', null)
    
    if (error) {
      console.error('Error tracking click:', error)
    }
    
  } catch (error) {
    console.error('Error in trackClick:', error)
  }
}

// Get analytics data for admin dashboard
export const getAnalyticsData = async (period = 'daily') => {
  try {
    let startDate = new Date()
    
    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
    
    // Get visitor data
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitors')
      .select('*')
      .gte('visited_at', startDate.toISOString())
      .order('visited_at', { ascending: false })
    
    if (visitorsError) {
      console.error('Error fetching visitors:', visitorsError)
      return { data: null, error: visitorsError }
    }
    
    // Get page analytics data
    const { data: pageAnalytics, error: pageError } = await supabase
      .from('page_analytics')
      .select('*')
      .gte('entered_at', startDate.toISOString())
      .order('entered_at', { ascending: false })
    
    if (pageError) {
      console.error('Error fetching page analytics:', pageError)
    }
    
    return {
      data: {
        visitors: visitors || [],
        pageAnalytics: pageAnalytics || []
      },
      error: null
    }
    
  } catch (error) {
    console.error('Error in getAnalyticsData:', error)
    return { data: null, error }
  }
}

export default {
  trackPageView,
  trackPageExit,
  trackScrollDepth,
  trackClick,
  getAnalyticsData
}
