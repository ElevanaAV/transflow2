'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminExists, promoteToAdmin } from '@/lib/services/userService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthGuard from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Admin Initialization Page
 * 
 * This page is for initial setup only and will allow the first user
 * to promote themselves to admin. Once an admin exists, this page
 * will redirect to the admin dashboard.
 */
export default function AdminInitPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasAdmin, setHasAdmin] = useState(false);

  // Check if admin exists
  useEffect(() => {
    const checkAdminExists = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const adminExistsResult = await adminExists();
        setHasAdmin(adminExistsResult);
        
        if (adminExistsResult) {
          // Redirect to team page in edit mode after a short delay
          setTimeout(() => {
            router.push('/team?mode=edit');
          }, 2000);
        }
      } catch (err) {
        console.error('Error checking if admin exists:', err);
        setError('Failed to check admin status. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminExists();
  }, [user, router]);
  
  // Handle promotion to admin
  const handlePromoteToAdmin = async () => {
    if (!user) return;
    
    try {
      setInitializing(true);
      setError(null);
      setSuccess(null);
      
      await promoteToAdmin(user.uid);
      
      setSuccess('You have been successfully promoted to admin!');
      setHasAdmin(true);
      
      // Redirect to team page in edit mode after success message
      setTimeout(() => {
        router.push('/team?mode=edit');
      }, 2000);
    } catch (err) {
      console.error('Error promoting to admin:', err);
      setError('Failed to promote to admin. Please try again.');
    } finally {
      setInitializing(false);
    }
  };
  
  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Admin Initialization</h1>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {error && (
              <Alert 
                type="error"
                message={error}
                dismissible
                onDismiss={() => setError(null)}
                className="mb-6"
              />
            )}
            
            {success && (
              <Alert 
                type="success"
                message={success}
                dismissible
                onDismiss={() => setSuccess(null)}
                className="mb-6"
              />
            )}
            
            <div className="bg-white rounded-lg shadow-md p-6">
              {hasAdmin ? (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">Admin Already Exists</h2>
                  <p className="mb-6">
                    An admin user already exists in the system. You are being redirected to the admin dashboard.
                  </p>
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4">Initialize Admin User</h2>
                  <p className="mb-6">
                    No admin users have been set up yet. As the first user, you can promote yourself to admin to manage the system.
                  </p>
                  <div className="flex justify-center">
                    <Button
                      variant="primary"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handlePromoteToAdmin}
                      disabled={initializing}
                    >
                      {initializing ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Promoting to Admin...
                        </>
                      ) : (
                        'Promote Myself to Admin'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}