'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, LogIn, Loader2 } from 'lucide-react'
import { useClerkStatus } from '@/hooks/useClerkStatus'

export default function ClerkFallback({ children }: { children: React.ReactNode }) {
  const { status, error } = useClerkStatus()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading authentication...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Authentication Service Unavailable</CardTitle>
            <CardDescription>
              We're having trouble loading the authentication service. Please try again.
              {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button 
              onClick={() => window.location.href = '/sign-in'}
              variant="outline"
              className="w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
} 