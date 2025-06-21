import { validateAdditionalInfo, validateBasicInfo, validateCTA, ValidationErrors } from "@/lib/type"
import { CtaTypeEnum } from "@prisma/client"
import { create } from "zustand"

export type CampaignFormState = {
  basicInfo: {
    meetingName?: string
    description?: string
    // Removed date/time fields for instant start
  }
  cta: {
    ctaLabel?: string
    tags?: string[]
    ctaType: CtaTypeEnum
    aiAgent?: string
    // Removed priceId for negotiation focus
  }
  additionalInfo: {
    lockChat?: boolean
    couponCode?: string
    couponEnabled?: boolean
  }
}

type ValidationState = {
  basicInfo: { valid: boolean; errors: ValidationErrors }
  cta: { valid: boolean; errors: ValidationErrors }
  additionalInfo: { valid: boolean; errors: ValidationErrors }
}

type CampaignStore = {
  // UI state
  isModalOpen: boolean
  isComplete: boolean
  isSubmitting: boolean

  // Form data
  formData: CampaignFormState
  validation: ValidationState

  // UI state setters
  setModalOpen: (open: boolean) => void
  setComplete: (complete: boolean) => void
  setSubmitting: (submitting: boolean) => void

  // Form field updaters
  updateBasicInfoField: (
    field: keyof CampaignFormState["basicInfo"],
    value: string | Date | undefined
  ) => void
  updateCTAField: (
    field: keyof CampaignFormState["cta"],
    value: string | CtaTypeEnum
  ) => void
  updateAdditionalInfoField: (
    field: keyof CampaignFormState["additionalInfo"],
    value: string | boolean
  ) => void

  // Tag management
  addTag: (tag: string) => void
  removeTag: (tag: string) => void

  // Validation
  validateStep: (step: keyof CampaignFormState) => boolean
  getStepValidationErrors: (step: keyof CampaignFormState) => ValidationErrors

  // Form management
  resetForm: () => void
}

const initialState: CampaignFormState = {
  basicInfo: {
    meetingName: "",
    description: "",
    // No date/time for instant start
  },
  cta: {
    ctaLabel: "Start Partnership Discussion",
    tags: [],
    ctaType: "BOOK_A_CALL", // Default to AI negotiation
    aiAgent: "",
    // No priceId for negotiation focus
  },
  additionalInfo: {
    lockChat: false,
    couponCode: "",
    couponEnabled: false,
  },
}

const initialValidation: ValidationState = {
  basicInfo: { valid: false, errors: {} },
  cta: { valid: false, errors: {} },
  additionalInfo: { valid: true, errors: {} }, // Additional info is optional by default
}

export const useMeetingStore = create<CampaignStore>((set, get) => ({
  isModalOpen: false,
  isComplete: false,
  isSubmitting: false,
  formData: initialState,
  validation: initialValidation,

  // UI state setters
  setModalOpen: (open) => set({ isModalOpen: open }),
  setComplete: (complete) => set({ isComplete: complete }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  // Form field updaters
  updateBasicInfoField: (field, value) => {
    set((state) => {
      const newBasicInfo = {
        ...state.formData.basicInfo,
        [field]: value,
      }

      const validationResult = validateBasicInfo(newBasicInfo)

      return {
        formData: {
          ...state.formData,
          basicInfo: newBasicInfo,
        },
        validation: {
          ...state.validation,
          basicInfo: validationResult,
        },
      }
    })
  },

  updateCTAField: (field, value) => {
    set((state) => {
      const newCTA = {
        ...state.formData.cta,
        [field]: value,
      }

      const validationResult = validateCTA(newCTA)

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
        validation: {
          ...state.validation,
          cta: validationResult,
        },
      }
    })
  },

  updateAdditionalInfoField: (field, value) => {
    set((state) => {
      const newAdditionalInfo = {
        ...state.formData.additionalInfo,
        [field]: value,
      }

      const validationResult = validateAdditionalInfo(newAdditionalInfo)

      return {
        formData: {
          ...state.formData,
          additionalInfo: newAdditionalInfo,
        },
        validation: {
          ...state.validation,
          additionalInfo: validationResult,
        },
      }
    })
  },

  // Tag management
  addTag: (tag: string) => {
    set((state) => {
      const newTags = [...(state.formData.cta.tags || []), tag]
      const newCTA = {
        ...state.formData.cta,
        tags: newTags,
      }

      const validationResult = validateCTA(newCTA)

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
        validation: {
          ...state.validation,
          cta: validationResult,
        },
      }
    })
  },

  removeTag: (tagToRemove: string) => {
    set((state) => {
      const newTags = (state.formData.cta.tags || []).filter(
        (tag) => tag !== tagToRemove
      )
      const newCTA = {
        ...state.formData.cta,
        tags: newTags,
      }

      const validationResult = validateCTA(newCTA)

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
        validation: {
          ...state.validation,
          cta: validationResult,
        },
      }
    })
  },

  // Validation
  validateStep: (step: keyof CampaignFormState) => {
    const state = get()
    return state.validation[step].valid
  },

  getStepValidationErrors: (step: keyof CampaignFormState) => {
    const state = get()
    return state.validation[step].errors
  },

  // Form management
  resetForm: () => {
    set({
      formData: initialState,
      validation: initialValidation,
      isComplete: false,
    })
  },
}))

// Export for backward compatibility
export const useWebinarStore = useMeetingStore;

