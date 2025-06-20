import { validateAdditionalInfo, validateBasicInfo, validateCTA, ValidationErrors } from "@/lib/type"
import { CtaTypeEnum } from "@prisma/client"
import { create } from "zustand"

export type WebinarFormState = {
  basicInfo: {
    webinarName?: string
    description?: string
    // Removed date/time fields for instant start
  }
  cta: {
    ctaLabel?: string
    tags?: string[]
    ctaType: CtaTypeEnum
    aiAgent?: string
    // Removed priceId for non-sales focus
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

type WebinarStore = {
  // UI state
  isModalOpen: boolean
  isComplete: boolean
  isSubmitting: boolean

  // Form data
  formData: WebinarFormState
  validation: ValidationState

  // UI state setters
  setModalOpen: (open: boolean) => void
  setComplete: (complete: boolean) => void
  setSubmitting: (submitting: boolean) => void

  // Form field updaters
  updateBasicInfoField: (
    field: keyof WebinarFormState["basicInfo"],
    value: string | Date | undefined
  ) => void
  updateCTAField: (
    field: keyof WebinarFormState["cta"],
    value: string | CtaTypeEnum
  ) => void
  updateAdditionalInfoField: (
    field: keyof WebinarFormState["additionalInfo"],
    value: string | boolean
  ) => void

  // Tag management
  addTag: (tag: string) => void
  removeTag: (tag: string) => void

  // Validation
  validateStep: (step: keyof WebinarFormState) => boolean
  getStepValidationErrors: (step: keyof WebinarFormState) => ValidationErrors

  // Form management
  resetForm: () => void
}

const initialState: WebinarFormState = {
  basicInfo: {
    webinarName: "",
    description: "",
    // No date/time for instant start
  },
  cta: {
    ctaLabel: "Start AI Session",
    tags: [],
    ctaType: "BOOK_A_CALL", // Default to AI interaction
    aiAgent: "",
    // No priceId for non-sales focus
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

export const useWebinarStore = create<WebinarStore>((set, get) => ({
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
  validateStep: (step: keyof WebinarFormState) => {
    const state = get()
    return state.validation[step].valid
  },

  getStepValidationErrors: (step: keyof WebinarFormState) => {
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

