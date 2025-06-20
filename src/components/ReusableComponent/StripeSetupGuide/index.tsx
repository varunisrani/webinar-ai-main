"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Copy, 
  AlertTriangle,
  Zap,
  Shield,
  CreditCard,
  Globe,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface StripeSetupGuideProps {
  isConnected: boolean;
  onConnect: () => void;
}

const StripeSetupGuide: React.FC<StripeSetupGuideProps> = ({ isConnected, onConnect }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const setupSteps = [
    {
      id: 1,
      title: "Create Stripe Account",
      description: "Sign up for a Stripe account if you don't have one",
      completed: false,
      action: () => window.open('https://dashboard.stripe.com/register', '_blank'),
      icon: <Globe className="h-4 w-4" />
    },
    {
      id: 2,
      title: "Business Information",
      description: "Provide your business details and bank account",
      completed: false,
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 3,
      title: "Identity Verification",
      description: "Verify your identity (usually instant)",
      completed: false,
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: 4,
      title: "Connect to Platform",
      description: "Link your Stripe account to this platform",
      completed: isConnected,
      action: onConnect,
      icon: <CreditCard className="h-4 w-4" />
    }
  ];

  const requiredInfo = [
    {
      category: "Personal Information",
      items: [
        "Legal name (as it appears on government ID)",
        "Date of birth",
        "Phone number",
        "Email address",
        "Home address"
      ]
    },
    {
      category: "Business Information",
      items: [
        "Business name (if applicable)",
        "Business address",
        "Business type (LLC, Corporation, Sole Proprietorship, etc.)",
        "EIN or SSN",
        "Business website URL"
      ]
    },
    {
      category: "Banking Information",
      items: [
        "Bank account number",
        "Routing number",
        "Account holder name"
      ]
    }
  ];

  const testCardNumbers = [
    { number: "4242424242424242", type: "Visa", description: "Default test card" },
    { number: "4000000000000002", type: "Visa", description: "Card declined" },
    { number: "4000000000009995", type: "Visa", description: "Insufficient funds" },
    { number: "4000000000000119", type: "Visa", description: "Processing error" }
  ];

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert className={`border-2 ${isConnected ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Clock className="h-5 w-5 text-amber-600" />
          )}
          <AlertDescription className={isConnected ? 'text-green-800' : 'text-amber-800'}>
            {isConnected ? (
              <strong>✅ Your Stripe account is connected and ready to accept payments!</strong>
            ) : (
              <strong>⏳ Stripe account setup required to start accepting payments</strong>
            )}
          </AlertDescription>
        </div>
      </Alert>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="troubleshooting">Help</TabsTrigger>
        </TabsList>

        {/* Setup Guide Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Quick Setup Process
              </CardTitle>
              <CardDescription>
                Follow these steps to connect your Stripe account (typically takes 5-10 minutes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {setupSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.completed ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      ) : (
                        <>
                          {step.action && (
                            <Button size="sm" onClick={step.action} variant="outline">
                              {step.id === 4 ? 'Connect Now' : 'Start'}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Information Required for Setup</CardTitle>
              <CardDescription>
                Gather this information before starting to speed up the process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {requiredInfo.map((section) => (
                  <div key={section.category}>
                    <h4 className="font-medium mb-3 text-lg">{section.category}</h4>
                    <ul className="space-y-2">
                      {section.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-6">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> All information is processed securely by Stripe. 
                  This platform never sees or stores your banking details.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Integration</CardTitle>
              <CardDescription>
                Use these test card numbers to simulate different payment scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCardNumbers.map((card, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-mono text-sm font-medium">{card.number}</div>
                      <div className="text-sm text-muted-foreground">{card.type} - {card.description}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(card.number, `${card.type} card`)}
                    >
                      {copiedField === `${card.type} card` ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-4">
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Mode:</strong> Use expiry date 12/34, any 3-digit CVC, and any ZIP code.
                  No real money will be charged during testing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
              <CardDescription>
                Solutions to frequently encountered setup problems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Account verification is taking too long
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Most accounts are approved instantly, but some may take up to 24-48 hours.
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Ensure all information is accurate and matches your ID</li>
                    <li>• Check your email for verification requests from Stripe</li>
                    <li>• Contact Stripe support if it's been over 48 hours</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Connection failed or error during setup
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    If you encounter errors during the connection process:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Try clearing your browser cache and cookies</li>
                    <li>• Disable browser extensions temporarily</li>
                    <li>• Use an incognito/private browser window</li>
                    <li>• Try a different browser or device</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    International account setup
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stripe Connect is available in many countries, but requirements vary:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Check if your country is supported on Stripe's website</li>
                    <li>• Some countries may require additional documentation</li>
                    <li>• Payout schedules may vary by country</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Need More Help?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Visit Stripe's comprehensive documentation and support center
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => window.open('https://stripe.com/docs/connect', '_blank')}
                    >
                      Stripe Connect Docs
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StripeSetupGuide; 