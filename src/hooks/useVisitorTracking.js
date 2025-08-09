import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView, trackPageExit, trackScrollDepth, trackClick } from '../services/analyticsService'

export const useVisitorTracking = () => {
  const location = useLocation()
  const scrollThresholds = useRef(new Set())
  const lastScrollTime = useRef(0)

  useEffect(() => {
    // Track page view
    const trackCurrentPage = async () => {
      try {
        const pageUrl = window.location.href
        const pageTitle = document.title
        await trackPageView(pageUrl, pageTitle)
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }

    // Track page exit on beforeunload
    const handleBeforeUnload = () => {
      trackPageExit()
    }

    // Track scroll depth
    const handleScroll = () => {
      const now = Date.now()
      if (now - lastScrollTime.current < 100) return // Throttle scroll events
      lastScrollTime.current = now

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100)

      // Track scroll milestones (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100]
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !scrollThresholds.current.has(milestone)) {
          scrollThresholds.current.add(milestone)
          trackScrollDepth(milestone)
        }
      })
    }

    // Track clicks on important elements
    const handleClick = (event) => {
      const target = event.target
      const tagName = target.tagName.toLowerCase()
      const elementText = target.textContent?.slice(0, 50) || ''

      // Track clicks on buttons, links, and other interactive elements
      if (['button', 'a', 'input'].includes(tagName) || target.onclick) {
        trackClick(tagName, elementText)
      }
    }

    // Set up tracking
    const timer = setTimeout(trackCurrentPage, 500)

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('click', handleClick, { passive: true })

    // Cleanup function
    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClick)

      // Track page exit when component unmounts (route change)
      trackPageExit()

      // Reset scroll thresholds for new page
      scrollThresholds.current.clear()
    }
  }, [location.pathname])

  // Track page exit when user leaves the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackPageExit()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}

export default useVisitorTracking
