'use client'

import { useEffect, useState, useCallback } from 'react'

// Hook for navbar scroll effect
export const useNavbarScroll = (threshold: number = 100) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isScrolled
}

// Hook for back to top button
export const useBackToTop = (threshold: number = 300) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  return { isVisible, scrollToTop }
}

// Hook for smooth scrolling to sections
export const useSmoothScroll = () => {
  const scrollToSection = useCallback((sectionId: string, offset: number = 80) => {
    if (typeof window === 'undefined') return

    const element = document.getElementById(sectionId)
    if (element) {
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }, [])

  return scrollToSection
}

// Hook for notifications
export const useNotification = () => {
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (typeof window === 'undefined') return

    // Create notification element
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`

    // Create content container
    const contentDiv = document.createElement('div')
    contentDiv.className = 'notification-content'

    // Create and append icon
    const icon = document.createElement('i')
    icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2`
    contentDiv.appendChild(icon)

    // Safely append text content
    contentDiv.appendChild(document.createTextNode(message))

    // Append content to notification
    notification.appendChild(contentDiv)

    // Add to page
    document.body.appendChild(notification)
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100)
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show')
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 5000)
  }, [])

  return { showNotification }
}

// Hook for loading states
export const useLoading = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])

  return { isLoading, startLoading, stopLoading, setIsLoading }
}

// Hook for form states
export const useFormState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>('')

  const resetFormState = useCallback(() => {
    setIsSubmitting(false)
    setSuccess(false)
    setError('')
  }, [])

  const handleSubmitStart = useCallback(() => {
    setIsSubmitting(true)
    setError('')
    setSuccess(false)
  }, [])

  const handleSubmitSuccess = useCallback(() => {
    setIsSubmitting(false)
    setSuccess(true)
    setError('')
  }, [])

  const handleSubmitError = useCallback((errorMessage: string) => {
    setIsSubmitting(false)
    setSuccess(false)
    setError(errorMessage)
  }, [])

  return {
    isSubmitting,
    success,
    error,
    resetFormState,
    handleSubmitStart,
    handleSubmitSuccess,
    handleSubmitError
  }
}

// Hook for counter animations
export const useCounterAnimation = (
  endValue: number,
  duration: number = 2000,
  startValue: number = 0
) => {
  const [currentValue, setCurrentValue] = useState(startValue)

  const startAnimation = useCallback(() => {
    const startTime = performance.now()
    
    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = (t: number) => 1 - (--t) * t * t * t
      
      const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart(progress))
      setCurrentValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      }
    }
    
    requestAnimationFrame(updateCounter)
  }, [endValue, duration, startValue])

  return { currentValue, startAnimation }
}