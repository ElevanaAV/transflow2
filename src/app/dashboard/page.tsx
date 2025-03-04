// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Simple redirect page from /dashboard to /projects for backwards compatibility
 */
export default function DashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/projects');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Taking you to the Projects page</p>
      </div>
    </div>
  );
}