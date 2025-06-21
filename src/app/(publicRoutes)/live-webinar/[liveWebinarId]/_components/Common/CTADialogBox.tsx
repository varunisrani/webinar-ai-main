"use client"
import type React from "react"
import { ChevronRight, Copy, Loader2, Users, Bot } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { WebinarWithPresenter } from "@/lib/type"
import { useState, useEffect } from "react"

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  webinar: WebinarWithPresenter
  userId: string
}

const CTADialogBox = ({ open, onOpenChange, trigger, webinar, userId }: Props) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMultiTabMode, setIsMultiTabMode] = useState(false)

  // Check if this is a secondary tab (for multi-tab functionality)
  useEffect(() => {
    const isSecondaryTab = sessionStorage.getItem(`campaign-${webinar.id}-secondary-tab`)
    setIsMultiTabMode(!!isSecondaryTab)
  }, [webinar.id])

  const handleStartNegotiation = async () => {
    setLoading(true)
    try {
      // Open AI negotiation in new tab
      const negotiationUrl = `/live-webinar/${webinar.id}/call?attendeeId=${userId}`
      window.open(negotiationUrl, '_blank', 'noopener,noreferrer')
      
      // Mark current tab as main tab
      sessionStorage.setItem(`campaign-${webinar.id}-main-tab`, 'true')
      
      toast.success("Opening AI negotiation agent in new tab...")
    } catch (error) {
      console.error("Error opening negotiation", error)
      toast.error("Error opening negotiation session")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    setLoading(true)
    try {
      // Navigate to group/live view in current tab
      router.push(`/live-webinar/${webinar.id}`)
      
      // Mark this tab as secondary/group tab
      sessionStorage.setItem(`campaign-${webinar.id}-secondary-tab`, 'true')
      
      toast.success("Joining the group discussion...")
    } catch (error) {
      console.error("Error joining group", error)
      toast.error("Error joining group")
    } finally {
      setLoading(false)
    }
  }

  const copyOfferCode = () => {
    if (webinar.couponCode) {
      navigator.clipboard.writeText(webinar.couponCode)
      setCopied(true)
      toast.success("Special offer code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openSecondTab = () => {
    const newTab = window.open(window.location.href, '_blank', 'noopener,noreferrer')
    if (newTab) {
      // Set a flag in the new tab to identify it as secondary
      newTab.sessionStorage?.setItem(`campaign-${webinar.id}-secondary-tab`, 'true')
      toast.success("Opened second tab for group participation")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Partnership Negotiation
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Connect with our AI negotiation agent to discuss brand partnership opportunities and terms.
          </DialogDescription>
        </DialogHeader>

        <div className="flex mt-4 space-x-4">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-500" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-medium">{webinar.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{webinar.description}</p>

            {webinar.couponCode && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Special Offer Code:</div>
                <div className="flex items-center">
                  <div className="bg-primary/10 border border-dashed border-primary/50 rounded-l-md px-3 py-1.5 text-sm font-mono font-semibold text-primary">
                    {webinar.couponCode}
                  </div>
                  <button
                    onClick={copyOfferCode}
                    className="bg-primary/5 hover:bg-primary/10 border border-l-0 border-dashed border-primary/50 rounded-r-md p-1.5 text-primary transition-colors"
                    aria-label="Copy special offer code"
                  >
                    <Copy className={`h-4 w-4 ${copied ? "text-green-500" : ""}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-500" />
            AI Partnership Negotiation
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Our AI agent will discuss partnership terms, compensation, deliverables, and campaign details with you.
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={openSecondTab}
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Open Group Campaign View
            </Button>
            <p className="text-xs text-muted-foreground">
              Join the group campaign discussion where other creators and the AI agent are present
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-4 sm:mt-0">
          <Button variant="outline" className="text-muted-foreground" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {isMultiTabMode ? (
              <Button onClick={handleJoinGroup} disabled={loading} className="flex items-center">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Join Campaign
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleStartNegotiation} disabled={loading} className="flex items-center">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Start Negotiation
                  </>
                )}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CTADialogBox
