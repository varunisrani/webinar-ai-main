'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, LogIn } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  clerkFailed: boolean
}

class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, clerkFailed: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true, clerkFailed: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Check if this is a Clerk-related error
    if (error.message?.includes('Clerk') || error.message?.includes('clerk') || 
        errorInfo?.componentStack?.includes('Clerk')) {
      console.error('Clerk failed to load:', error)
      this.setState({ clerkFailed: true })
    }
  }

  handleLoginRedirect = () => {
    // Fallback to custom login or refresh page
    window.location.reload()
  }

  render() {
    if (this.state.hasError && this.state.clerkFailed) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">Authentication Service Unavailable</CardTitle>
              <CardDescription>
                We're having trouble connecting to our authentication service. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={this.handleLoginRedirect}
                className="w-full"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                If the problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ClerkErrorBoundary 