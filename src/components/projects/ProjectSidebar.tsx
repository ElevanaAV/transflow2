// src/components/projects/ProjectSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface ProjectSidebarProps {
  project?: Project;
}

export default function ProjectSidebar({ project }: ProjectSidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const [isProjectContext, setIsProjectContext] = useState(false);
  
  // Check if we're in a project context by examining the URL path
  useEffect(() => {
    const isProjectPath = pathname.includes('/projects/') && 
      pathname.split('/').length > 2 && 
      pathname.split('/')[2] !== 'new';
      
    setIsProjectContext(isProjectPath);
  }, [pathname]);
  
  // If not in a project context, don't render the sidebar
  if (!isProjectContext) {
    return null;
  }

  // Get the project ID from the URL
  const projectId = pathname.split('/')[2];
  
  // Project-specific navigation items
  const navItems: NavItem[] = [
    {
      label: 'Project Overview',
      href: `/projects/${projectId}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      label: 'Videos',
      href: `/projects/${projectId}/videos`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      ),
    },
    {
      label: 'Content',
      href: `/projects/${projectId}/content`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Edit Project',
      href: `/projects/${projectId}/edit`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-50 h-screen border-r border-gray-200 transition-all duration-300",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gray-100">
        {expanded ? (
          <div className="text-lg font-semibold text-primary-dark truncate">
            {project?.name || 'Project'}
          </div>
        ) : (
          <div className="text-lg font-semibold text-primary-dark">
            P
          </div>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-200"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 pt-4 overflow-y-auto">
        <div className="mb-4 px-4">
          <Link
            href="/projects/overview"
            className="flex items-center text-sm text-gray-600 hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {expanded && "Back to Projects"}
          </Link>
        </div>
        
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-dark text-white"
                      : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  )}
                >
                  <div className="mr-3 flex-shrink-0">{item.icon}</div>
                  {expanded && (
                    <span className="flex-1">{item.label}</span>
                  )}
                  {expanded && item.badge && (
                    <span className="ml-auto bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {project && (
        <div className="p-4 border-t border-gray-200">
          {expanded ? (
            <div>
              <p className="text-sm font-medium text-gray-900">Project Details</p>
              <p className="text-xs text-gray-500 mt-1">
                Source: {project.sourceLanguage}
              </p>
              <p className="text-xs text-gray-500">
                Target: {project.targetLanguages?.join(', ')}
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-primary-dark text-white flex items-center justify-center">
                <span className="text-xs font-medium">Info</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}