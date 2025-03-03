'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ResetPasswordPage() {
  // Wrap in Suspense boundary for better loading experience
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { resetPassword, clearError, user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if email was provided in URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Check if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrorMessage('');
    setIsLoading(true);
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
      showToast('Password reset email sent! Check your inbox.', 'success');
    } catch (err) {
      // Extract error message for common Firebase errors
      const firebaseError = String(err || '');
      
      if (firebaseError.includes('user-not-found')) {
        setErrorMessage('No account found with this email address.');
      } else if (firebaseError.includes('invalid-email')) {
        setErrorMessage('Invalid email format. Please check your email address.');
      } else if (firebaseError.includes('network-request-failed')) {
        setErrorMessage('Network error. Please check your internet connection and try again.');
      } else {
        setErrorMessage(firebaseError || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header and Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary-dark">TranslationFlow</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-100">
          {isSuccess ? (
            // Success State
            <div className="text-center">
              <div className="flex justify-center mb-6 text-success animate-bounce-in">
                <div className="bg-success/10 p-4 rounded-full">
                  <svg className="h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl leading-6 font-semibold text-gray-900">Password Reset Link Sent</h3>
              <p className="mt-4 text-sm text-gray-600 max-w-md mx-auto">
                We&apos;ve sent a password reset link to <strong className="text-primary font-medium">{email}</strong>. 
                Please check your email inbox and follow the instructions to reset your password.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                After clicking the link in the email, you'll be directed to set a new password.
              </p>
              
              {/* Return to Login Button */}
              <div className="mt-8">
                <Link href="/login" className="w-full block">
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    className="bg-primary text-white hover:bg-primary-dark shadow-md button-primary transition-all duration-200 transform hover:scale-[1.02] font-medium"
                    onClick={() => router.push('/login')}
                  >
                    Return to Login Page
                  </Button>
                </Link>
              </div>
              
              {/* Try Again Option */}
              <p className="mt-4 text-sm text-gray-500">
                Didn&apos;t receive the email?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                  }}
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            // Form State
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Input */}
              <FormInput
                label="Email address"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                error={errorMessage}
                leftIcon={
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                }
              />

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 relative"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Send Password Reset Link"
                  )}
                </button>
              </div>

              {/* Return to Login Link */}
              <div className="text-center mt-4">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}