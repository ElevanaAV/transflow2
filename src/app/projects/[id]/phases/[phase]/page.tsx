'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProject, updateProjectPhaseStatus } from '@/lib/services/projectService';
import { Project, ProjectPhase, PhaseStatus } from '@/lib/types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { PHASE_LABELS, PHASE_DESCRIPTIONS, NEXT_PHASE } from '@/lib/constants';

export default function ProjectPhasePage() {
  const { id, phase } = useParams<{ id: string; phase: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const currentPhase = phase as ProjectPhase;

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

  const handlePhaseStatusUpdate = async (status: PhaseStatus) => {
    if (!project || !id || !currentPhase) return;
    
    try {
      setUpdating(true);
      setError(null);
      const updatedProject = await updateProjectPhaseStatus(id as string, currentPhase, status);
      setProject(updatedProject);
      
      // If completing phase and there's a next phase, optionally start the next phase
      if (status === PhaseStatus.COMPLETED && NEXT_PHASE[currentPhase]) {
        // For this implementation, we're just notifying the user that they can move to the next phase
        // In a full implementation, you might ask if they want to automatically advance
      }
    } catch (err) {
      console.error('Error updating phase status:', err);
      setError('Failed to update phase status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleNavigateToPhase = (targetPhase: ProjectPhase | null) => {
    if (!id || !targetPhase) return;
    router.push(`/projects/${id}/phases/${targetPhase}`);
  };

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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'Project not found'}
          </div>
          <button
            onClick={() => router.push('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </AuthGuard>
    );
  }

  // Validate that the phase exists
  if (!Object.values(ProjectPhase).includes(currentPhase)) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Invalid phase
          </div>
          <button
            onClick={() => router.push(`/projects/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Project
          </button>
        </div>
      </AuthGuard>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: project.name, href: `/projects/${id}` },
    { label: PHASE_LABELS[currentPhase] },
  ];

  const phaseStatus = project.phases[currentPhase];
  
  // Determine which actions are available based on phase status
  const canStart = phaseStatus === PhaseStatus.NOT_STARTED;
  const canComplete = phaseStatus === PhaseStatus.IN_PROGRESS;
  const isCompleted = phaseStatus === PhaseStatus.COMPLETED;
  
  // Determine if previous phase is completed
  const phases = [
    ProjectPhase.SUBTITLE_TRANSLATION,
    ProjectPhase.TRANSLATION_PROOFREADING,
    ProjectPhase.AUDIO_PRODUCTION,
    ProjectPhase.AUDIO_REVIEW,
  ];
  
  const currentPhaseIndex = phases.indexOf(currentPhase);
  const previousPhase = currentPhaseIndex > 0 ? phases[currentPhaseIndex - 1] : null;
  const nextPhase = currentPhaseIndex < phases.length - 1 ? phases[currentPhaseIndex + 1] : null;
  
  const isPreviousPhaseCompleted = !previousPhase || project.phases[previousPhase] === PhaseStatus.COMPLETED;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{PHASE_LABELS[currentPhase]}</h1>
              <p className="text-gray-600">{PHASE_DESCRIPTIONS[currentPhase]}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              {canStart && isPreviousPhaseCompleted ? (
                <button
                  onClick={() => handlePhaseStatusUpdate(PhaseStatus.IN_PROGRESS)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={updating}
                >
                  {updating ? 'Starting...' : 'Start Phase'}
                </button>
              ) : canComplete ? (
                <button
                  onClick={() => handlePhaseStatusUpdate(PhaseStatus.COMPLETED)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={updating}
                >
                  {updating ? 'Completing...' : 'Mark as Completed'}
                </button>
              ) : isCompleted ? (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  Waiting for previous phase
                </span>
              )}
            </div>
          </div>
          
          {/* Phase navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              {previousPhase && (
                <button
                  onClick={() => handleNavigateToPhase(previousPhase)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Previous Phase
                </button>
              )}
            </div>
            <button
              onClick={() => router.push(`/projects/${id}`)}
              className="px-4 py-2 text-blue-600 hover:underline"
            >
              Back to Project Overview
            </button>
            <div>
              {nextPhase && (
                <button
                  onClick={() => handleNavigateToPhase(nextPhase)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  Next Phase
                  <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Phase Interface</h2>
          <p className="text-gray-600 mb-6">This is where the specific interface for the {PHASE_LABELS[currentPhase]} phase would be implemented.</p>
          
          <div className="py-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Phase-specific interface will be implemented in future iterations</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}