'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Admin Users Page Redirector
 * 
 * This page now redirects to the Team page with edit mode,
 * since we've consolidated user management into the Team page.
 */
export default function AdminUsersRedirect() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  
  useEffect(() => {
    // For admins, add a query param that will trigger edit mode on the team page
    router.replace('/team?mode=edit');
  }, [router]);
  
  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to team management...</p>
        </div>
      </div>
    </AuthGuard>
  );
}