'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProjects } from '@/lib/services/projectService';
import { Project, PhaseStatus, ProjectPhase, ProjectStats } from '@/lib/types';
import { PHASE_LABELS, PHASE_SEQUENCE } from '@/lib/constants';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import ProjectCard from '@/components/projects/ProjectCard';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Displays projects or a message if there are none
 */
const ProjectsDisplay = ({ projects, router }: { projects: Project[], router: AppRouterInstance }) => {
  const projectsToShow = useMemo(() => {
    if (projects.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new translation project.</p>
          <div className="mt-6">
            <Button
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
              onClick={() => router.push('/projects/new')}
            >
              Create Project
            </Button>
          </div>
        </div>
      );
    }
    
    // Get up to 3 most recent projects
    const recentProjects = projects.slice(0, 3);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }, [projects, router]);

  return projectsToShow;
};

/**
 * Displays the workflow phases overview
 */
const WorkflowOverview = () => {
  const workflowDisplay = useMemo(() => (
    <div className="flex flex-col md:flex-row justify-between items-center">
      <div className="w-full md:w-auto mb-6 md:mb-0 flex justify-between md:justify-start space-x-8">
        {PHASE_SEQUENCE.map((phase, index) => {
          const number = index + 1;
          const colorClasses = [
            'bg-blue-100 text-blue-700',
            'bg-indigo-100 text-indigo-700',
            'bg-purple-100 text-purple-700',
            'bg-pink-100 text-pink-700'
          ];
          
          return (
            <div key={phase} className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full ${colorClasses[index]} flex items-center justify-center`}>
                <span>{number}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">{PHASE_LABELS[phase]}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 md:mt-0">
        <Link href="/projects">
          <Button variant="outline">
            View Projects
          </Button>
        </Link>
      </div>
    </div>
  ), []);

  return workflowDisplay;
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProjectStats>({
    activeProjects: 0,
    pendingTranslations: 0,
    completedTranslations: 0,
    totalLanguages: 0,
  });

  // Memoized function to calculate project statistics
  const calculateProjectStats = useCallback((projects: Project[]): ProjectStats => {
    const activeProjects = projects.length;
    
    let pendingTranslations = 0;
    let completedTranslations = 0;
    const languages = new Set<string>();
    
    projects.forEach(project => {
      // Count translations in progress
      if (project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.IN_PROGRESS ||
          project.phases[ProjectPhase.TRANSLATION_PROOFREADING] === PhaseStatus.IN_PROGRESS) {
        pendingTranslations++;
      }
      
      // Count completed translations
      if (project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.COMPLETED &&
          project.phases[ProjectPhase.TRANSLATION_PROOFREADING] === PhaseStatus.COMPLETED) {
        completedTranslations++;
      }
      
      // Collect unique languages
      project.targetLanguages.forEach(lang => languages.add(lang));
      languages.add(project.sourceLanguage);
    });
    
    return {
      activeProjects,
      pendingTranslations,
      completedTranslations,
      totalLanguages: languages.size,
    };
  }, []);

  // Fetch projects and calculate stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user projects
        const userProjects = await getUserProjects(user.uid);
        setProjects(userProjects);
        
        // Calculate statistics
        const projectStats = calculateProjectStats(userProjects);
        setStats(projectStats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, calculateProjectStats]);

  return (
    <AuthGuard>
      <div className="py-10 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.displayName || user?.email || "User"}! Here&apos;s an overview of your translation projects.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                }
                onClick={() => router.push('/projects/new')}
              >
                New Project
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">{stats.activeProjects}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <Link 
                      href="/projects"
                      className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      View all projects
                    </Link>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-warning rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Translations</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">{stats.pendingTranslations}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <Link 
                      href="/projects"
                      className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      View translation projects
                    </Link>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-success rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Completed Translations</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">{stats.completedTranslations}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <Link 
                      href="/projects"
                      className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      View completed projects
                    </Link>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-secondary rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Languages</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">{stats.totalLanguages}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <Link 
                      href="/projects"
                      className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      Manage languages
                    </Link>
                  </div>
                </div>
              </div>

              {/* Your Projects */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
                  <Link 
                    href="/projects"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    View all projects
                  </Link>
                </div>
                
                <ProjectsDisplay projects={projects} router={router} />
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/projects/new">
                      <Button variant="outline" fullWidth leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      }>
                        Create New Project
                      </Button>
                    </Link>
                    <Button variant="outline" fullWidth leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    }>
                      Start Translation
                    </Button>
                    <Button variant="outline" fullWidth leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    }>
                      Record Audio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Workflow Overview */}
              <div className="mt-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-xl font-semibold text-gray-900">Translation Workflow</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <WorkflowOverview />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}