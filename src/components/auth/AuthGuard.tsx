'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * Guards routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children,
  fallbackUrl = '/login',
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until auth state is determined
    if (!loading) {
      if (!user) {
        // Save the current path for redirect after login
        if (pathname !== '/' && pathname !== '/login' && pathname !== '/signup') {
          sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        router.push(fallbackUrl);
      }
    }
  }, [user, loading, router, pathname, fallbackUrl]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show children only if authenticated
  return user ? <>{children}</> : null;
};

export default AuthGuard;