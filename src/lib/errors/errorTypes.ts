// src/lib/errors/errorTypes.ts

import { FirebaseError } from 'firebase/app';

/**
 * Application error codes
 */
export enum ErrorCode {
  AUTHENTICATION = 'auth/error',
  PERMISSION_DENIED = 'permission-denied',
  NOT_FOUND = 'not-found',
  VALIDATION = 'validation-error',
  NETWORK = 'network-error',
  SERVER = 'server-error',
  UNKNOWN = 'unknown',
}

/**
 * Standardized application error interface
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: unknown;
}

/**
 * Maps Firebase error codes to application error codes
 */
export function mapFirebaseErrorCode(firebaseCode: string): ErrorCode {
  if (firebaseCode.startsWith('auth/')) {
    return ErrorCode.AUTHENTICATION;
  }
  
  if (firebaseCode === 'permission-denied') {
    return ErrorCode.PERMISSION_DENIED;
  }
  
  if (firebaseCode === 'not-found') {
    return ErrorCode.NOT_FOUND;
  }
  
  return ErrorCode.UNKNOWN;
}

/**
 * Handles any error and converts it to a standardized AppError
 */
export function handleError(error: unknown): AppError {
  if (error instanceof FirebaseError) {
    return {
      code: mapFirebaseErrorCode(error.code),
      message: error.message,
      originalError: error,
    };
  }
  
  if (error instanceof Error) {
    return {
      code: ErrorCode.UNKNOWN,
      message: error.message,
      originalError: error,
    };
  }
  
  return {
    code: ErrorCode.UNKNOWN,
    message: 'An unexpected error occurred',
    originalError: error,
  };
}

/**
 * Gets a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const appError = error instanceof Object && 'code' in error && 'message' in error
    ? error as AppError
    : handleError(error);
    
  switch (appError.code) {
    case ErrorCode.AUTHENTICATION:
      return 'Authentication failed. Please check your credentials and try again.';
    case ErrorCode.PERMISSION_DENIED:
      return 'You don\'t have permission to perform this action.';
    case ErrorCode.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorCode.VALIDATION:
      return appError.message || 'Please check the form for errors.';
    case ErrorCode.NETWORK:
      return 'Network error. Please check your connection and try again.';
    case ErrorCode.SERVER:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}