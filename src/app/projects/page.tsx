// src/app/projects/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect to the projects overview page
 */
export default function ProjectsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/projects/overview');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Projects...</h1>
        <p className="text-gray-600">Taking you to the Projects overview</p>
      </div>
    </div>
  );
}