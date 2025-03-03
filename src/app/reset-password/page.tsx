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
  
  // Wrap in Suspense boundary
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center bg-gray-50">
      <LoadingSpinner size="lg" />
    </div>}>
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSuccess ? (
            <div className="text-center">
              <div className="flex justify-center mb-4 text-success">
                <svg className="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Reset link sent</h3>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your email inbox and follow the instructions to reset your password.
              </p>
              <div className="mt-6">
                <Link href="/login">
                  <Button variant="primary" fullWidth>
                    Return to login
                  </Button>
                </Link>
              </div>
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
            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Send reset link
                </Button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-primary hover:text-primary-dark">
                  Return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}