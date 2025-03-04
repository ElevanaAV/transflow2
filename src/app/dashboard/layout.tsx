// src/app/dashboard/layout.tsx
'use client';

import React from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import ProjectSidebar from '@/components/projects/ProjectSidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname.split('/').filter(Boolean);
    
    if (path.length > 0) {
      // Capitalize the first letter of the last path segment
      const lastSegment = path[path.length - 1];
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
    
    return 'Projects';
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ProjectSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                  {getPageTitle()}
                </h1>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}