'use client'

import { useState, useEffect } from 'react'

export function useClerkStatus() {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let retryCount = 0
    const maxRetries = 3

    const checkClerkStatus = () => {
      // Check if Clerk is already loaded
      if (typeof window !== 'undefined' && (window as any).Clerk) {
        setStatus('loaded')
        return
      }

      // Monitor script loading
      const clerkScripts = document.querySelectorAll('script[src*="clerk"]')
      
      if (clerkScripts.length === 0) {
        // No Clerk scripts found, might be loading
        timeoutId = setTimeout(() => checkClerkStatus(), 1000)
        return
      }

      // Check if any Clerk script failed to load
      let scriptsLoaded = 0
      let scriptsErrored = 0

      clerkScripts.forEach((script) => {
        const scriptElement = script as HTMLScriptElement
        
        if (scriptElement.readyState === 'complete' || scriptElement.readyState === 'loaded') {
          scriptsLoaded++
        }

        // Add error listener
        scriptElement.onerror = () => {
          scriptsErrored++
          console.error('Clerk script failed to load:', scriptElement.src)
          setError(`Failed to load Clerk script: ${scriptElement.src}`)
          
          if (retryCount < maxRetries) {
            retryCount++
            console.log(`Retrying Clerk load attempt ${retryCount}/${maxRetries}`)
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          } else {
            setStatus('failed')
          }
        }

        // Add load listener
        scriptElement.onload = () => {
          scriptsLoaded++
          // Wait a bit for Clerk to initialize after script loads
          setTimeout(() => {
            if ((window as any).Clerk) {
              setStatus('loaded')
            } else if (retryCount < maxRetries) {
              retryCount++
              console.log(`Clerk script loaded but instance not available. Retry ${retryCount}/${maxRetries}`)
              setTimeout(() => window.location.reload(), 2000)
            } else {
              setStatus('failed')
              setError('Clerk script loaded but instance not available')
            }
          }, 2000)
        }
      })

      // Fallback timeout
      timeoutId = setTimeout(() => {
        if (status === 'loading') {
          if (scriptsErrored > 0) {
            setStatus('failed')
            setError('One or more Clerk scripts failed to load')
          } else if (!(window as any).Clerk) {
            if (retryCount < maxRetries) {
              retryCount++
              console.log(`Clerk loading timeout. Retry ${retryCount}/${maxRetries}`)
              window.location.reload()
            } else {
              setStatus('failed')
              setError('Clerk loading timeout after multiple retries')
            }
          }
        }
      }, 10000)
    }

    checkClerkStatus()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [status])

  return { status, error }
} 