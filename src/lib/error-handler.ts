/**
 * Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  statusCode?: number;
}

export class WebinarError extends Error {
  code: string;
  userMessage: string;
  statusCode: number;

  constructor(code: string, message: string, userMessage?: string, statusCode = 500) {
    super(message);
    this.name = 'WebinarError';
    this.code = code;
    this.userMessage = userMessage || message;
    this.statusCode = statusCode;
  }
}

// Common error codes and messages
export const ErrorCodes = {
  STREAM_ALREADY_RUNNING: 'STREAM_ALREADY_RUNNING',
  STREAM_NOT_FOUND: 'STREAM_NOT_FOUND',
  USER_NOT_AUTHENTICATED: 'USER_NOT_AUTHENTICATED',
  WEBINAR_NOT_FOUND: 'WEBINAR_NOT_FOUND',
  INVALID_PERMISSIONS: 'INVALID_PERMISSIONS',
  STREAM_CREATION_FAILED: 'STREAM_CREATION_FAILED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED'
} as const;

// Error message mappings
const errorMessages: Record<string, { message: string; userMessage: string }> = {
  [ErrorCodes.STREAM_ALREADY_RUNNING]: {
    message: 'User already has an active live stream',
    userMessage: 'You already have a live webinar running. Please end your current webinar before starting a new one.'
  },
  [ErrorCodes.STREAM_NOT_FOUND]: {
    message: 'Stream not found',
    userMessage: 'The requested stream could not be found.'
  },
  [ErrorCodes.USER_NOT_AUTHENTICATED]: {
    message: 'User not authenticated',
    userMessage: 'Please log in to continue.'
  },
  [ErrorCodes.WEBINAR_NOT_FOUND]: {
    message: 'Webinar not found',
    userMessage: 'The requested webinar could not be found.'
  },
  [ErrorCodes.INVALID_PERMISSIONS]: {
    message: 'User does not have permission for this action',
    userMessage: 'You do not have permission to perform this action.'
  },
  [ErrorCodes.STREAM_CREATION_FAILED]: {
    message: 'Failed to create stream',
    userMessage: 'Failed to start the webinar. Please try again in a few moments.'
  },
  [ErrorCodes.PAYMENT_FAILED]: {
    message: 'Payment processing failed',
    userMessage: 'Payment could not be processed. Please check your payment details and try again.'
  },
  [ErrorCodes.EMAIL_SEND_FAILED]: {
    message: 'Failed to send email',
    userMessage: 'Email notification could not be sent, but your action was completed successfully.'
  }
};

/**
 * Creates a standardized error with user-friendly message
 */
export function createAppError(
  code: keyof typeof ErrorCodes,
  customMessage?: string,
  customUserMessage?: string,
  statusCode = 500
): WebinarError {
  const errorConfig = errorMessages[code];
  
  if (!errorConfig) {
    return new WebinarError(
      'UNKNOWN_ERROR',
      customMessage || 'An unknown error occurred',
      customUserMessage || 'Something went wrong. Please try again.',
      statusCode
    );
  }

  return new WebinarError(
    code,
    customMessage || errorConfig.message,
    customUserMessage || errorConfig.userMessage,
    statusCode
  );
}

/**
 * Handles errors and returns appropriate user message
 */
export function handleError(error: unknown): { message: string; code?: string } {
  if (error instanceof WebinarError) {
    return {
      message: error.userMessage,
      code: error.code
    };
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    const message = error.message.toLowerCase();
    
    if (message.includes('already have a live stream')) {
      return {
        message: errorMessages[ErrorCodes.STREAM_ALREADY_RUNNING].userMessage,
        code: ErrorCodes.STREAM_ALREADY_RUNNING
      };
    }
    
    if (message.includes('not authenticated') || message.includes('unauthorized')) {
      return {
        message: errorMessages[ErrorCodes.USER_NOT_AUTHENTICATED].userMessage,
        code: ErrorCodes.USER_NOT_AUTHENTICATED
      };
    }
    
    if (message.includes('not found')) {
      return {
        message: 'The requested resource could not be found.',
        code: 'NOT_FOUND'
      };
    }
    
    if (message.includes('permission') || message.includes('forbidden')) {
      return {
        message: errorMessages[ErrorCodes.INVALID_PERMISSIONS].userMessage,
        code: ErrorCodes.INVALID_PERMISSIONS
      };
    }

    // Return the original error message for unknown errors
    return {
      message: error.message
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred. Please try again.'
  };
}

/**
 * Logs errors with consistent format
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  if (error instanceof WebinarError) {
    console.error(`${timestamp}${contextStr} WebinarError [${error.code}]:`, error.message);
  } else if (error instanceof Error) {
    console.error(`${timestamp}${contextStr} Error:`, error.message);
    console.error('Stack:', error.stack);
  } else {
    console.error(`${timestamp}${contextStr} Unknown error:`, error);
  }
}

/**
 * Validates common parameters and throws appropriate errors
 */
export const validators = {
  requireAuth: (userId?: string | null): string => {
    if (!userId) {
      throw createAppError('USER_NOT_AUTHENTICATED');
    }
    return userId;
  },

  requireWebinar: (webinar: unknown): any => {
    if (!webinar) {
      throw createAppError('WEBINAR_NOT_FOUND');
    }
    return webinar;
  },

  requirePermission: (userId: string, resourceOwnerId: string): void => {
    if (userId !== resourceOwnerId) {
      throw createAppError('INVALID_PERMISSIONS');
    }
  }
}; 