// src/app/projects/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProjectForm from '@/components/projects/ProjectForm';
import { getProject, updateProject } from '@/lib/services/projectService';
import { Project, ProjectFormData } from '@/lib/types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        const projectData = await getProject(id as string);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  const handleUpdateProject = async (projectData: ProjectFormData) => {
    if (!user || !id || !project) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      // Convert single targetLanguage to array for the project model
      const updatedProject = await updateProject(id as string, {
        ...projectData,
        // Convert single targetLanguage to array of target languages
        targetLanguages: projectData.targetLanguage ? [projectData.targetLanguage] : [],
        // Preserve existing phase statuses and other properties
        phases: project.phases,
        currentPhase: project.currentPhase,
      });
      
      // Redirect to the project page
      router.push(`/projects/${updatedProject.id}`);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
      setIsUpdating(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Projects', href: '/projects/overview' },
    { label: project?.name || 'Project', href: `/projects/${id}` },
    { label: 'Edit' },
  ];

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !project) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} />
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'Project not found'}
          </div>
          <button
            onClick={() => router.push('/projects/overview')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </AuthGuard>
    );
  }

  const initialFormData: ProjectFormData = {
    name: project.name,
    description: project.description,
    sourceLanguage: project.sourceLanguage,
    targetLanguage: project.targetLanguages && project.targetLanguages.length > 0 
      ? project.targetLanguages[0] 
      : '', // Take the first target language if available
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Project</h1>
          <p className="text-gray-600 mb-6">Update project details and language settings</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <ProjectForm
            initialData={initialFormData}
            onSubmit={handleUpdateProject}
            onCancel={() => router.push(`/projects/${id}`)}
            isLoading={isUpdating}
          />
        </div>
      </div>
    </AuthGuard>
  );
}