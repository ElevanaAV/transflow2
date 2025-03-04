'use client';

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AuthGuard from '../../components/auth/AuthGuard';
import { useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname.split('/').filter(Boolean);
    if (path.length === 1 && path[0] === 'dashboard') {
      return 'Dashboard';
    }
    
    if (path.length > 1) {
      // Capitalize the first letter of the last path segment
      const lastSegment = path[path.length - 1];
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
    
    return 'Dashboard';
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
                <div className="flex items-center">
                  <div className="hidden md:flex md:items-center md:ml-6">
                    {/* Notification Bell */}
                    <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <span className="sr-only">View notifications</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </button>

                    {/* User Profile */}
                    <div className="ml-3 relative">
                      <div className="flex items-center">
                        <span className="hidden md:block ml-2 text-sm text-gray-700">
                          {user?.displayName || user?.email}
                        </span>
                        <div className="ml-2 h-8 w-8 rounded-full bg-primary-dark text-white flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}