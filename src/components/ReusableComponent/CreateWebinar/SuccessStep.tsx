"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, PlusCircle, ExternalLink, Bot, Zap, Play } from "lucide-react"
import Link from "next/link"

interface SuccessStepProps {
  webinarLink: string
  onCreateNew?: () => void
  onClose?: () => void
}

export function SuccessStep({
  webinarLink,
  onCreateNew,
}: SuccessStepProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webinarLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative text-center space-y-6 py-8 px-6">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-green-500 rounded-full p-3">
          <Bot className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-600">🎉 AI Session Created & Live!</h2>
        <p className="text-muted-foreground">
          Your AI agent is ready and waiting to interact with participants
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Session is LIVE and Ready
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Participants can join immediately and start interacting with your AI agent
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Share this link with participants:</label>
        <div className="flex max-w-md mx-auto">
          <Input 
            value={webinarLink} 
            readOnly 
            className="bg-muted border-input rounded-r-none text-sm" 
          />
          <Button 
            onClick={handleCopyLink} 
            variant="outline" 
            className="rounded-l-none border-l-0"
            size="sm"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-green-600">✓ Link copied to clipboard!</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link href={webinarLink} target="_blank" className="flex-1 sm:flex-none">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Play className="mr-2 h-4 w-4" />
            Join Session Now
          </Button>
        </Link>
        
        <Link href={webinarLink} target="_blank" className="flex-1 sm:flex-none">
          <Button variant="outline" className="w-full border-muted text-primary hover:bg-input">
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview Session
          </Button>
        </Link>
      </div>

      {onCreateNew && (
        <div className="mt-8 pt-4 border-t border-border">
          <Button 
            onClick={onCreateNew} 
            variant="outline" 
            className="border-primary/20 text-primary hover:bg-primary/10"
            size="sm"
          >
            <Zap className="mr-2 h-4 w-4" />
            Create Another AI Session
          </Button>
        </div>
      )}
    </div>
  )
}

