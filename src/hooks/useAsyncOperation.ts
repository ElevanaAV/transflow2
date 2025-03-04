// src/hooks/useAsyncOperation.ts
import { useState, useCallback } from 'react';
import { handleError, AppError } from '@/lib/errors/errorTypes';

/**
 * Hook for managing asynchronous operations with loading and error states
 */
export function useAsyncOperation<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: AppError) => void;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await operation(...args);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const appError = handleError(err);
        setError(appError);
        options?.onError?.(appError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [operation, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    reset,
    isLoading,
    error,
    data,
  };
}