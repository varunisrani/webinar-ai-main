'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, LogIn, Loader2 } from 'lucide-react'

interface Props {
  children: ReactNode
}

const ClerkLoadingWrapper: React.FC<Props> = ({ children }) => {
  const [clerkStatus, setClerkStatus] = useState<'loading' | 'loaded' | 'failed'>('loading')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkClerkStatus = () => {
      // Check if Clerk is available on the window object
      if (typeof window !== 'undefined') {
        // Check if Clerk script has loaded
        const clerkScript = document.querySelector('script[src*="clerk"]')
        const clerkInstance = (window as any).Clerk
        
        if (clerkInstance) {
          setClerkStatus('loaded')
          return
        }

        // If script exists but Clerk instance doesn't, it might still be loading
        if (clerkScript) {
          // Wait a bit more for Clerk to initialize
          timeoutId = setTimeout(() => {
            if (!(window as any).Clerk) {
              console.error('Clerk script loaded but instance not available')
              setClerkStatus('failed')
            } else {
              setClerkStatus('loaded')
            }
          }, 3000)
          return
        }

        // No script found, Clerk failed to load
        console.error('Clerk script not found or failed to load')
        setClerkStatus('failed')
      }
    }

    // Initial check
    timeoutId = setTimeout(checkClerkStatus, 2000)

    // Fallback timeout - if Clerk hasn't loaded after 10 seconds, consider it failed
    const fallbackTimeout = setTimeout(() => {
      if (clerkStatus === 'loading') {
        console.error('Clerk loading timeout - considering as failed')
        setClerkStatus('failed')
      }
    }, 10000)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(fallbackTimeout)
    }
  }, [retryCount, clerkStatus])

  const handleRetry = () => {
    setClerkStatus('loading')
    setRetryCount(prev => prev + 1)
    // Reload the page to retry Clerk loading
    window.location.reload()
  }

  const handleManualLogin = () => {
    // Redirect to a fallback login page or show manual login form
    window.location.href = '/sign-in'
  }

  if (clerkStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Loading authentication service...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (clerkStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-xl">Authentication Service Unavailable</CardTitle>
            <CardDescription>
              We're having trouble connecting to our authentication service. You can try refreshing the page or continue with manual login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full"
              size="lg"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
            <Button 
              onClick={handleManualLogin}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Continue to Login
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Retry attempt: {retryCount + 1}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export default ClerkLoadingWrapper 