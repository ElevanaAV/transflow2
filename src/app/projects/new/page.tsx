// src/app/projects/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProjectForm from '@/components/projects/ProjectForm';
import { createProject } from '@/lib/services/projectService';
import { ProjectFormData } from '@/lib/types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AuthGuard from '@/components/auth/AuthGuard';

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (projectData: ProjectFormData) => {
    console.log('Attempting to create project with data:', projectData);
    
    if (!user) {
      console.error('No user found');
      setError('You must be logged in to create a project.');
      return;
    }
    
    try {
      console.log('Creating project with data:', projectData);
      console.log('User ID:', user.uid);
      
      setIsCreating(true);
      setError(null);
      
      const newProject = await createProject(projectData, user.uid);
      console.log('Project created successfully:', newProject);
      
      // Redirect to the new project page with fallbacks
      try {
        // Try Next.js router first
        router.push(`/projects/${newProject.id}`);
        
        // Fallback - use a timeout to ensure the navigation happens
        setTimeout(() => {
          try {
            // If still on the page, try window.location as a fallback
            window.location.href = `/projects/${newProject.id}`;
          } catch (navError) {
            console.error('Error redirecting with window.location:', navError);
          }
        }, 500);
      } catch (routerError) {
        console.error('Error with router.push:', routerError);
        // Immediate fallback
        window.location.href = `/projects/${newProject.id}`;
      }
    } catch (err) {
      console.error('Error creating project:', err);
      if (err instanceof Error) {
        setError(`Failed to create project: ${err.message}`);
      } else {
        setError('Failed to create project. Please try again.');
      }
      setIsCreating(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Projects', href: '/projects/overview' },
    { label: 'New Project' },
  ];

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => {
              console.log('Cancel button clicked in new project page');
              try {
                // Try Next.js routing first
                router.push('/projects/overview');
                
                // Fallback - use a timeout to try window.location
                setTimeout(() => {
                  try {
                    window.location.href = '/projects/overview';
                  } catch (error) {
                    console.error('Error navigating with window.location:', error);
                  }
                }, 100);
              } catch (error) {
                console.error('Error navigating with router:', error);
                // Immediate fallback
                window.location.href = '/projects/overview';
              }
            }}
            isLoading={isCreating}
          />
          
          {/* Fallback navigation link */}
          <div className="mt-4 text-center">
            <a href="/projects/overview" className="text-sm text-gray-500 hover:text-gray-700">
              Return to projects list
            </a>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}