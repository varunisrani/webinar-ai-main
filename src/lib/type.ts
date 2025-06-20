import { AiAgents, Attendee, User, Webinar } from "@prisma/client"

export type ValidationErrors = Record<string, string>

export type ValidationResult = {
  valid: boolean
  errors: ValidationErrors
}

export const validateBasicInfo = (data: {
  webinarName?: string
  description?: string
  // Removed date/time fields for instant sessions
}): ValidationResult => {
  const errors: ValidationErrors = {}

  if (!data.webinarName?.trim()) {
    errors.webinarName = "Session name is required"
  }

  if (!data.description?.trim()) {
    errors.description = "Session description is required"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateCTA = (data: {
  ctaLabel?: string
  tags?: string[]
  ctaType?: string
  aiAgent?: string
  // Removed priceId for non-sales focus
}): ValidationResult => {
  const errors: ValidationErrors = {}

  // AI Agent is now required since this is the core feature
  if (!data.aiAgent?.trim()) {
    errors.aiAgent = "AI Agent selection is required"
  }

  // CTA label is optional - will have default
  if (data.ctaLabel && data.ctaLabel.trim().length > 50) {
    errors.ctaLabel = "CTA label must be 50 characters or less"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateAdditionalInfo = (data: {
  lockChat?: boolean
  couponCode?: string
  couponEnabled?: boolean
}): ValidationResult => {
  const errors: ValidationErrors = {}

  // If coupon is enabled, code is required
  if (data.couponEnabled && !data.couponCode?.trim()) {
    errors.couponCode = "Coupon code is required when enabled"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export type WebinarStatus = "upcoming" | "live" | "ended"

export type AttendanceData = {
  count: number;
  users: Attendee[];
};

export type ChatEvent = {
  message: {
    id: string;
    text: string;
    user_id?: string;
    user?: {
  id: string;
  name?: string;
    };
    created_at?: string;
    type?: string;
  };
  type: string;
  cid: string;
}

export type WebinarWithPresenter = Webinar & {
  presenter : User
}

export type StreamCallRecording = {
  filename: string;
  url: string;
  start_time: Date;
  end_time: Date;
  session_id: string;
} 

export type UserWithAiAgent = User & {
  aiAgents:AiAgents[]
}