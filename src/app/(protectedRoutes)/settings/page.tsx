import { onAuthenticateUser } from '@/action/auth'
import { getStripeOAuthLink } from '@/lib/stripe/utlis'

import { getWebinarByPresenterId } from '@/action/webinar'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import {
  LucideArrowRight,
  LucideCheckCircle2,
  LucideAlertCircle,
  Check,
  ExternalLink,
  Clock,
  Shield,
  Zap,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import StreamManagement from './_components/StreamManagement'

const StripeConnectPage = async () => {
  const userExist = await onAuthenticateUser()

  if (!userExist.user) {
    redirect('/sign-in')
  }

  // Get active webinars for stream management
  const allWebinars = await getWebinarByPresenterId(userExist.user.id) || []
  const activeWebinars = allWebinars.filter(w => w.webinarStatus === 'LIVE')

  const isConnected = !!userExist?.user?.stripeConnectId
  const stripeLink = getStripeOAuthLink('api/stripe-connect', userExist.user.id)

  return (
    <div className="w-full mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Stream Management Section */}
      <StreamManagement 
        activeWebinars={activeWebinars} 
        presenterId={userExist.user.id} 
      />

      <h2 className="text-xl font-semibold mb-4">Payment Integration</h2>

      {/* Quick Setup Tips */}
      {!isConnected && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Quick Setup Tip:</strong> Have your business information ready (EIN/SSN, bank account details, business address) to complete Stripe onboarding in under 5 minutes.
          </AlertDescription>
        </Alert>
      )}

      <div className="w-full p-6 border border-input rounded-lg bg-background shadow-sm">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">
              Stripe Connect
            </h2>
            <p className="text-muted-foreground text-sm">
              Connect your Stripe account to start accepting payments
            </p>
          </div>
        </div>

        <div className="my-6 p-4 bg-muted rounded-md">
          <div className="flex items-start">
            {isConnected ? (
              <LucideCheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <LucideAlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {isConnected
                  ? 'Your Stripe account is connected'
                  : 'Your Stripe account is not connected yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isConnected
                  ? 'You can now accept payments through your application'
                  : 'Connect your Stripe account to start processing payments and managing subscriptions'}
              </p>
              
              {!isConnected && (
                <>
                  <div className="mt-4 p-3 bg-background rounded border border-border">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Quick Setup Process (5-10 minutes)
                    </h4>
                    <ol className="text-xs text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>Click &quot;Connect with Stripe&quot; below</li>
                      <li>Create or log into your Stripe account</li>
                      <li>Provide basic business information</li>
                      <li>Add bank account for payouts</li>
                      <li>Verify your identity (may be instant)</li>
                    </ol>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      Why connect with Stripe?
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        Process payments securely from customers worldwide
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        Manage subscriptions and recurring billing
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        Access detailed financial reporting and analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        Instant payouts to your bank account
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        Built-in fraud protection and dispute management
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Action Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {isConnected ? (
              'You can reconnect anytime if needed'
            ) : (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                You&apos;ll be redirected to Stripe to complete the connection
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!isConnected && (
              <Link
                href="https://stripe.com/connect"
                target="_blank"
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
              >
                Learn More
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            
            <Link
              href={stripeLink}
              className={`px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
                isConnected
                  ? 'bg-muted hover:bg-muted/80 text-foreground'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {isConnected ? 'Reconnect' : 'Connect with Stripe'}
              <LucideArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Additional Information for First Time Users */}
        {!isConnected && (
          <div className="mt-6 pt-4 border-t border-border">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                What information do I need to provide? 📋
              </summary>
              <div className="mt-3 space-y-2 text-muted-foreground">
                <p><strong>Personal/Business Info:</strong> Legal name, business type, address</p>
                <p><strong>Banking:</strong> Bank account and routing number for payouts</p>
                <p><strong>Verification:</strong> SSN/EIN (depending on business type)</p>
                <p><strong>Identity:</strong> Government ID (may be required for some accounts)</p>
                <p className="text-xs text-green-600 mt-2">💡 Most accounts are approved instantly or within 24 hours</p>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Connected Account Dashboard Link */}
      {isConnected && (
        <div className="mt-6 p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">Account Connected Successfully!</h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                You can now accept payments and manage your Stripe account
              </p>
            </div>
            <Link
              href="https://dashboard.stripe.com"
              target="_blank"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              Open Stripe Dashboard
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default StripeConnectPage
