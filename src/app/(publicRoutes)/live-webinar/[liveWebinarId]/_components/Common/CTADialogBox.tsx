"use client"
import type React from "react"
import { ChevronRight, Copy, Loader2, Play } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createCheckoutLink } from "@/action/stripe"
import { toast } from "sonner"
import type { WebinarWithPresenter } from "@/lib/type"
import { useState } from "react"

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

  const handleClick = async () => {
    setLoading(true)
    try {
      if (webinar.ctaType === "BOOK_A_CALL") {
        router.push(`/live-webinar/${webinar.id}/call?attendeeId=${userId}`)
      } else {
        if (!webinar.priceId || !webinar.presenter.stripeConnectId) {
          return toast.error("No priceId or stripeConnectId found")
        }
        const session = await createCheckoutLink(
          webinar.priceId,
          webinar.presenter.stripeConnectId,
          userId,
          webinar.id,
          true,
        )
        if (!session.sessionUrl) {
          throw new Error("Session ID not found in response")
        }

        window.open(session.sessionUrl, "_blank")
      }
    } catch (error) {
      console.error("Error creating checkout link", error)
      toast.error("Error creating checkout link")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (webinar.couponCode) {
      navigator.clipboard.writeText(webinar.couponCode)
      setCopied(true)
      toast.success("Coupon code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {webinar?.ctaType === "BOOK_A_CALL" ? "Book a Call" : "Buy Now"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {webinar?.ctaType === "BOOK_A_CALL"
              ? "You will be redirected to a call on another page "
              : "You will be redirected to checkout"}
          </p>
        </DialogHeader>

        <div className="flex mt-4 space-x-4">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
              <Play />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-medium">{webinar.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{webinar.description}</p>

            {webinar.couponCode && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Coupon Code:</div>
                <div className="flex items-center">
                  <div className="bg-primary/10 border border-dashed border-primary/50 rounded-l-md px-3 py-1.5 text-sm font-mono font-semibold text-primary">
                    {webinar.couponCode}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="bg-primary/5 hover:bg-primary/10 border border-l-0 border-dashed border-primary/50 rounded-r-md p-1.5 text-primary transition-colors"
                    aria-label="Copy coupon code"
                  >
                    <Copy className={`h-4 w-4 ${copied ? "text-green-500" : ""}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-4 sm:mt-0">
          <Button variant="outline" className="text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleClick} disabled={loading} className="flex items-center">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : webinar?.ctaType === "BOOK_A_CALL" ? (
              "Join Break-room"
            ) : (
              "Buy Now"
            )}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CTADialogBox
