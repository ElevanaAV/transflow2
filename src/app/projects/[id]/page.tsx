// src/app/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProject, updateProjectPhaseStatus, assignUserToPhase } from '@/lib/services/projectService';
import { getUsersForPhaseAssignment } from '@/lib/services/userService';
import { Project, ProjectPhase, PhaseStatus, UserProfile, UserRole } from '@/lib/types';
import { getLanguageByCode } from '@/lib/languages';
import WorkflowPhaseIndicator from '@/components/projects/WorkflowPhaseIndicator';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPhase, setUpdatingPhase] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState<Record<ProjectPhase, UserProfile[]>>({} as Record<ProjectPhase, UserProfile[]>);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigningPhase, setAssigningPhase] = useState<ProjectPhase | null>(null);
  
  // Check if current user is admin
  const isAdmin = hasRole(UserRole.ADMIN);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch the project a few times with a delay between tries
        let attempts = 0;
        const maxAttempts = 3;
        let projectData = null;
        
        while (attempts < maxAttempts && !projectData) {
          try {
            projectData = await getProject(id as string);
          } catch (err) {
            console.log(`Attempt ${attempts + 1} failed, retrying...`);
            attempts++;
            if (attempts >= maxAttempts) throw err;
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (projectData) {
          setProject(projectData);
          
          // For admins, fetch eligible users for each phase
          if (isAdmin) {
            await fetchEligibleUsers();
          }
        } else {
          throw new Error('Failed to load project after multiple attempts');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user, isAdmin]);
  
  // Fetch eligible users for each phase
  const fetchEligibleUsers = async () => {
    if (!isAdmin) return;
    
    setLoadingUsers(true);
    try {
      const phaseUsers: Record<ProjectPhase, UserProfile[]> = {} as Record<ProjectPhase, UserProfile[]>;
      
      // Fetch users for each phase in parallel
      const [translationUsers, proofreadingUsers, audioProductionUsers, audioReviewUsers] = await Promise.all([
        getUsersForPhaseAssignment(ProjectPhase.SUBTITLE_TRANSLATION),
        getUsersForPhaseAssignment(ProjectPhase.TRANSLATION_PROOFREADING),
        getUsersForPhaseAssignment(ProjectPhase.AUDIO_PRODUCTION),
        getUsersForPhaseAssignment(ProjectPhase.AUDIO_REVIEW)
      ]);
      
      phaseUsers[ProjectPhase.SUBTITLE_TRANSLATION] = translationUsers;
      phaseUsers[ProjectPhase.TRANSLATION_PROOFREADING] = proofreadingUsers;
      phaseUsers[ProjectPhase.AUDIO_PRODUCTION] = audioProductionUsers;
      phaseUsers[ProjectPhase.AUDIO_REVIEW] = audioReviewUsers;
      
      setEligibleUsers(phaseUsers);
    } catch (err) {
      console.error('Error fetching eligible users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handlePhaseClick = (phase: ProjectPhase) => {
    if (!project || !id) return;
    router.push(`/projects/${id}/phases/${phase}`);
  };

  const handleUpdatePhaseStatus = async (phase: ProjectPhase, status: PhaseStatus) => {
    if (!project || !id) return;
    
    try {
      setUpdatingPhase(true);
      setError(null);
      const updatedProject = await updateProjectPhaseStatus(id as string, phase, status);
      setProject(updatedProject);
    } catch (err) {
      console.error('Error updating phase status:', err);
      setError('Failed to update phase status. Please try again.');
    } finally {
      setUpdatingPhase(false);
    }
  };
  
  // Handle assigning a user to a phase
  const handleAssignUser = async (phase: ProjectPhase, userId: string | null) => {
    if (!project || !id) return;
    
    try {
      setAssigningPhase(phase);
      setError(null);
      
      const updatedProject = await assignUserToPhase(id as string, phase, userId);
      setProject(updatedProject);
      
      // Clear the assigning state
      setAssigningPhase(null);
    } catch (err) {
      console.error('Error assigning user to phase:', err);
      setError('Failed to assign user to phase. Please try again.');
      setAssigningPhase(null);
    }
  };

  const breadcrumbItems = [
    { label: 'Projects', href: '/projects/overview' },
    { label: project?.name || 'Project Details' },
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

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.name}</h1>
              <p className="text-gray-700 mb-6">{project.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Source Language</h3>
                  <p className="text-base font-medium">
                    {getLanguageByCode(project.sourceLanguage)?.name || project.sourceLanguage}
                    {getLanguageByCode(project.sourceLanguage)?.direction === 'rtl' && (
                      <span className="ml-2 text-xs text-amber-600">(RTL)</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Target Language</h3>
                  <p className="text-base font-medium">
                    {project.targetLanguages && project.targetLanguages.length > 0 ? (
                      <>
                        {getLanguageByCode(project.targetLanguages[0])?.name || project.targetLanguages[0]}
                        {getLanguageByCode(project.targetLanguages[0])?.direction === 'rtl' && (
                          <span className="ml-2 text-xs text-amber-600">(RTL)</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">No target language selected</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Calculate overall progress */}
              {(() => {
                const totalPhases = Object.keys(project.phases).length;
                const completedPhases = Object.values(project.phases).filter(status => status === PhaseStatus.COMPLETED).length;
                const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
                      <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <WorkflowPhaseIndicator 
                project={project} 
                onPhaseClick={handlePhaseClick}
              />
            </div>
          </div>
          
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.NOT_STARTED && (
                  <button
                    onClick={() => handleUpdatePhaseStatus(ProjectPhase.SUBTITLE_TRANSLATION, PhaseStatus.IN_PROGRESS)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={updatingPhase}
                  >
                    Start Translation Phase
                  </button>
                )}
                {project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.IN_PROGRESS && (
                  <button
                    onClick={() => handleUpdatePhaseStatus(ProjectPhase.SUBTITLE_TRANSLATION, PhaseStatus.COMPLETED)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={updatingPhase}
                  >
                    Complete Translation Phase
                  </button>
                )}
                {project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.COMPLETED && 
                 project.phases[ProjectPhase.TRANSLATION_PROOFREADING] === PhaseStatus.NOT_STARTED && (
                  <button
                    onClick={() => handleUpdatePhaseStatus(ProjectPhase.TRANSLATION_PROOFREADING, PhaseStatus.IN_PROGRESS)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={updatingPhase}
                  >
                    Start Proofreading Phase
                  </button>
                )}

                <button
                  onClick={() => router.push(`/projects/${id}/edit`)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit Project
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-sm text-gray-900">{(project.createdAt instanceof Date ? project.createdAt : new Date()).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="text-sm text-gray-900">{(project.updatedAt instanceof Date ? project.updatedAt : new Date()).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Phase</h3>
                  <p className="text-sm text-gray-900">
                    {project.currentPhase.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Phase assignments section - only visible to admins */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Phase Assignments</h2>
                
                {loadingUsers ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.values(ProjectPhase).map(phase => {
                      // Get formatted phase name
                      const phaseName = phase.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');
                      
                      // Get current assignee if exists
                      const currentAssigneeId = project.phaseAssignments?.[phase] || null;
                      
                      // Get available users for this phase
                      const availableUsers = eligibleUsers[phase] || [];
                      
                      return (
                        <div key={phase} className="p-3 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{phaseName}</h3>
                            <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                              {project.phases[phase]}
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Assign to:
                            </label>
                            
                            <div className="flex space-x-2">
                              <select
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={currentAssigneeId || ''}
                                onChange={(e) => handleAssignUser(phase, e.target.value === '' ? null : e.target.value)}
                                disabled={assigningPhase === phase}
                              >
                                <option value="">-- Unassigned --</option>
                                {availableUsers.map(user => (
                                  <option key={user.uid} value={user.uid}>
                                    {user.displayName || user.email}
                                  </option>
                                ))}
                              </select>
                              
                              {assigningPhase === phase && (
                                <div className="flex items-center">
                                  <LoadingSpinner size="sm" />
                                </div>
                              )}
                            </div>
                            
                            {currentAssigneeId && (
                              <button
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                                onClick={() => handleAssignUser(phase, null)}
                                disabled={assigningPhase === phase}
                              >
                                Remove assignment
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}