"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { useWebinarStore } from "@/store/useWebinarStore"

const AdditionalInfoStep = () => {
  const { formData, updateAdditionalInfoField, getStepValidationErrors } = useWebinarStore()

  const { lockChat, couponCode, couponEnabled } = formData.additionalInfo
  const errors = getStepValidationErrors("additionalInfo")

  const handleToggleLockChat = (checked: boolean) => {
    updateAdditionalInfoField("lockChat", checked)
  }

  const handleToggleCoupon = (checked: boolean) => {
    updateAdditionalInfoField("couponEnabled", checked)
  }

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAdditionalInfoField("couponCode", e.target.value)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Campaign Settings</h2>
        <p className="text-muted-foreground">
          Configure additional settings for your brand-creator negotiation campaign
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="lock-chat" className="text-base font-medium">
            Disable Chat During Negotiations
          </Label>
          <p className="text-sm text-gray-400">When enabled, only the AI agent can send messages during active negotiations</p>
        </div>
        <Switch id="lock-chat" checked={lockChat || false} onCheckedChange={handleToggleLockChat} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="coupon-enabled" className="text-base font-medium">
              Special Offer Code
            </Label>
            <p className="text-sm text-gray-400">Enable this if you want to offer special pricing or terms to creators</p>
          </div>
          <Switch id="coupon-enabled" checked={couponEnabled || false} onCheckedChange={handleToggleCoupon} />
        </div>

        {couponEnabled && (
          <div className="space-y-2">
            <Input
              id="coupon-code"
              value={couponCode || ""}
              onChange={handleCouponCodeChange}
              placeholder="Enter special offer code"
              className={cn(
                "!bg-background/50 border border-input",
                errors.couponCode && "border-red-400 focus-visible:ring-red-400",
              )}
            />
            {errors.couponCode && <p className="text-sm text-red-400">{errors.couponCode}</p>}
            <div className="flex items-start gap-2 text-sm text-gray-400 mt-2">
              <Info className="h-4 w-4 mt-0.5" />
              <p>This code will be automatically applied during the negotiation process to offer special terms to creators</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdditionalInfoStep