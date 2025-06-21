'use client'
import type React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useWebinarStore } from '@/store/useWebinarStore'

const BasicInfoStep = () => {
  const { formData, updateBasicInfoField, getStepValidationErrors } =
    useWebinarStore()

  const { meetingName, description } = formData.basicInfo
  const errors = getStepValidationErrors('basicInfo')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    updateBasicInfoField(name as keyof typeof formData.basicInfo, value)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Create Campaign Negotiation</h2>
        <p className="text-muted-foreground">
          Set up an AI-powered negotiation session to connect brands with creators
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="meetingName"
          className={errors.meetingName ? 'text-red-400' : ''}
        >
          Campaign Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="meetingName"
          name="meetingName"
          value={meetingName || ''}
          onChange={handleChange}
          placeholder="Brand Partnership Campaign 2024"
          className={cn(
            '!bg-background/50 border border-input',
            errors.meetingName && 'border-red-400 focus-visible:ring-red-400'
          )}
        />
        {errors.meetingName && (
          <p className="text-sm text-red-400">{errors.meetingName}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This will be displayed to creators when they join the negotiation session
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={errors.description ? 'text-red-400' : ''}
        >
          Campaign Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={description || ''}
          onChange={handleChange}
          placeholder="Brief overview of the brand partnership opportunity and what you're looking for in creator collaborations..."
          rows={4}
          className={cn(
            '!bg-background/50 border border-input resize-none',
            errors.description && 'border-red-400 focus-visible:ring-red-400'
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Provide context about the partnership opportunity and collaboration goals
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Instant Start Mode
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          This session will start immediately after creation. No scheduling required!
        </p>
      </div>
    </div>
  )
}

export default BasicInfoStep
