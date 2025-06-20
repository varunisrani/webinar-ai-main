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

  const { webinarName, description } = formData.basicInfo
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
        <h2 className="text-2xl font-bold text-primary mb-2">Create AI Agent Session</h2>
        <p className="text-muted-foreground">
          Set up an instant AI-powered interaction session that starts immediately
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="webinarName"
          className={errors.webinarName ? 'text-red-400' : ''}
        >
          Session Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="webinarName"
          name="webinarName"
          value={webinarName || ''}
          onChange={handleChange}
          placeholder="AI Product Demo Session"
          className={cn(
            '!bg-background/50 border border-input',
            errors.webinarName && 'border-red-400 focus-visible:ring-red-400'
          )}
        />
        {errors.webinarName && (
          <p className="text-sm text-red-400">{errors.webinarName}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This will be displayed to participants when they join your session
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={errors.description ? 'text-red-400' : ''}
        >
          Session Description <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={description || ''}
          onChange={handleChange}
          placeholder="Describe what participants can expect from this AI interaction session..."
          className={cn(
            'min-h-[100px] !bg-background/50 border border-input',
            errors.description && 'border-red-400 focus-visible:ring-red-400'
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Explain the purpose and what participants will learn or achieve
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
