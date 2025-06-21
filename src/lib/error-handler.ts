/**
 * Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

type AppErrorContext = {
  userId?: string;
  action?: string;
  resource?: string;
  timestamp?: Date;
};

export class MeetingError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly context?: AppErrorContext;

  constructor(code: string, message: string, userMessage: string, statusCode: number = 500, context?: AppErrorContext) {
    super(message);
    this.name = 'MeetingError';
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.context = context;
  }
}

// Common error codes and messages
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Meeting specific
  MEETING_NOT_FOUND: 'MEETING_NOT_FOUND',
  ACTIVE_MEETING_EXISTS: 'ACTIVE_MEETING_EXISTS',
  MEETING_START_FAILED: 'MEETING_START_FAILED',
  
  // Stream related
  STREAM_CREATE_FAILED: 'STREAM_CREATE_FAILED',
  STREAM_NOT_FOUND: 'STREAM_NOT_FOUND',
  
  // Generic
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const;

// Error message mappings
const ErrorMessages: Record<string, { message: string; userMessage: string }> = {
  [ErrorCodes.ACTIVE_MEETING_EXISTS]: {
    message: 'User already has an active meeting',
    userMessage: 'You already have a live meeting running. Please end your current meeting before starting a new one.'
  },
  [ErrorCodes.UNAUTHORIZED]: {
    message: 'User is not authenticated',
    userMessage: 'Please log in to access this feature.'
  },
  [ErrorCodes.FORBIDDEN]: {
    message: 'User does not have permission to perform this action',
    userMessage: 'You do not have permission to perform this action.'
  },
  [ErrorCodes.MEETING_NOT_FOUND]: {
    message: 'Meeting not found',
    userMessage: 'The requested meeting could not be found.'
  },
  [ErrorCodes.USER_NOT_FOUND]: {
    message: 'User not found in database',
    userMessage: 'User account not found. Please contact support.'
  },
  [ErrorCodes.MEETING_START_FAILED]: {
    message: 'Failed to start meeting stream',
    userMessage: 'Failed to start the meeting. Please try again in a few moments.'
  },
  [ErrorCodes.STREAM_CREATE_FAILED]: {
    message: 'Failed to create stream call',
    userMessage: 'Failed to set up the meeting stream. Please try again.'
  },
  [ErrorCodes.STREAM_NOT_FOUND]: {
    message: 'Stream call not found',
    userMessage: 'Meeting stream not found. Please refresh and try again.'
  },
  [ErrorCodes.VALIDATION_ERROR]: {
    message: 'Input validation failed',
    userMessage: 'Please check your input and try again.'
  }
};

/**
 * Creates a standardized error with user-friendly message
 */
export function createAppError(
  code: keyof typeof ErrorCodes,
  context?: AppErrorContext,
  customMessage?: string
): MeetingError {
  const errorConfig = ErrorMessages[code];
  
  return new MeetingError(
    code,
    customMessage || errorConfig.message,
    errorConfig.userMessage,
    getStatusCodeForError(code),
    context
  );
}

/**
 * Handles errors and returns appropriate user message
 */
export function handleError(error: unknown, context?: AppErrorContext): never {
  if (error instanceof MeetingError) {
    logError(error, context);
    throw error;
  }
  
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      throw createAppError('VALIDATION_ERROR', context, 'Duplicate entry found');
    }
    if (prismaError.code === 'P2025') {
      throw createAppError('MEETING_NOT_FOUND', context);
    }
  }
  
  // Generic error
  const genericError = createAppError(
    'DATABASE_ERROR',
    context,
    error instanceof Error ? error.message : 'Unknown error occurred'
  );
  
  logError(genericError, context);
  throw genericError;
}

/**
 * Logs errors with consistent format
 */
export function logError(error: MeetingError, context?: AppErrorContext): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [Context: ${JSON.stringify(context)}]` : '';
  
  if (error instanceof MeetingError) {
    console.error(`${timestamp}${contextStr} MeetingError [${error.code}]:`, error.message);
    if (error.context) {
      console.error('Error context:', error.context);
    }
  } else {
    console.error(`${timestamp}${contextStr} Unexpected error:`, error);
  }
}

/**
 * Validates common parameters and throws appropriate errors
 */
export const validators = {
  requireMeeting: (meeting: unknown): any => {
    if (!meeting) {
      throw createAppError('MEETING_NOT_FOUND');
    }
    return meeting;
  },
  
  requireUser: (user: unknown): any => {
    if (!user) {
      throw createAppError('USER_NOT_FOUND');
    }
    return user;
  },
  
  requireAuth: (userId: unknown): string => {
    if (!userId || typeof userId !== 'string') {
      throw createAppError('UNAUTHORIZED');
    }
    return userId;
  }
};

export function getStatusCodeForError(code: string): number {
  switch (code) {
    case ErrorCodes.UNAUTHORIZED:
      return 401;
    case ErrorCodes.FORBIDDEN:
      return 403;
    case ErrorCodes.MEETING_NOT_FOUND:
    case ErrorCodes.USER_NOT_FOUND:
    case ErrorCodes.STREAM_NOT_FOUND:
      return 404;
    case ErrorCodes.VALIDATION_ERROR:
    case ErrorCodes.ACTIVE_MEETING_EXISTS:
      return 400;
    case ErrorCodes.MEETING_START_FAILED:
    case ErrorCodes.STREAM_CREATE_FAILED:
      return 500;
    default:
      return 500;
  }
}

export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof MeetingError) {
    return error.userMessage;
  }
  
  return 'An unexpected error occurred. Please try again later.';
} 