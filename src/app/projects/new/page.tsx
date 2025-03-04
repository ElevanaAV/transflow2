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
    if (!user) return;
    
    try {
      setIsCreating(true);
      setError(null);
      const newProject = await createProject(projectData, user.uid);
      
      // Redirect to the new project page
      router.push(`/projects/${newProject.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
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
            onCancel={() => router.push('/projects/overview')}
            isLoading={isCreating}
          />
        </div>
      </div>
    </AuthGuard>
  );
}