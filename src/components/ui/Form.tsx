// src/components/ui/Form.tsx
'use client';

import React, { FormEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  submitButton?: ReactNode;
  resetButton?: ReactNode;
}

/**
 * A reusable form component that handles common form functionality
 */
export default function Form({
  onSubmit,
  children,
  isLoading = false,
  error = null,
  className,
  submitButton,
  resetButton,
  ...props
}: FormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading) {
      try {
        console.log('Form submitted');
        onSubmit(e);
      } catch (error) {
        console.error('Error in form submission:', error);
      }
    } else {
      console.log('Form submission ignored - loading state is true');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("space-y-6", className)} 
      {...props}
      aria-busy={isLoading}
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {(submitButton || resetButton) && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {resetButton}
          {submitButton}
        </div>
      )}
    </form>
  );
}