"use client";

import React from "react";
import { toast } from "sonner";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class WebRTCErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WebRTC Error caught by boundary:", error, errorInfo);
    
    // Handle specific WebRTC errors
    if (error.message.includes("ICE") || error.message.includes("STUN") || error.message.includes("TURN")) {
      toast.error("Network connection issue. Please check your internet connection and try again.");
    } else if (error.message.includes("connectUser")) {
      toast.error("Connection issue. Refreshing the page...");
      setTimeout(() => window.location.reload(), 2000);
    } else {
      toast.error("An unexpected error occurred. Please refresh the page.");
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-screen bg-background text-foreground">
            <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Connection Issue</h2>
              <p className="text-muted-foreground mb-6">
                We're experiencing some connectivity issues. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default WebRTCErrorBoundary; 