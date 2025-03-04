// src/app/projects/overview/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProjects } from '@/lib/services/projectService';
import { Project, PhaseStatus, ProjectPhase, ProjectStats } from '@/lib/types';
import { PHASE_SEQUENCE, PHASE_LABELS } from '@/lib/constants';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import ProjectCard from '@/components/projects/ProjectCard';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { FieldValue } from 'firebase/firestore';

/**
 * Pagination component for projects
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      
      <div className="text-sm font-medium px-4">
        Page {currentPage} of {totalPages || 1}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};

/**
 * Filter buttons for project phases
 */
const ProjectPhaseFilters = ({ 
  activePhase, 
  onPhaseSelect 
}: { 
  activePhase: ProjectPhase | null; 
  onPhaseSelect: (phase: ProjectPhase | null) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-4">
      {PHASE_SEQUENCE.map((phase) => (
        <Button
          key={phase}
          variant={activePhase === phase ? "primary" : "outline"}
          size="sm"
          className={activePhase === phase ? "bg-blue-600 hover:bg-blue-700" : ""}
          onClick={() => onPhaseSelect(phase)}
        >
          {PHASE_LABELS[phase]}
        </Button>
      ))}
    </div>
  );
};

/**
 * Displays projects or a message if there are none
 */
const ProjectsDisplay = ({ 
  projects, 
  router, 
  currentPage, 
  itemsPerPage, 
  onPageChange 
}: { 
  projects: Project[]; 
  router: AppRouterInstance;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  
  // Get current page of projects
  const currentProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return projects.slice(startIndex, startIndex + itemsPerPage);
  }, [projects, currentPage, itemsPerPage]);
  
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
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700"
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
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={onPageChange}
          />
        )}
      </>
    );
  }, [currentProjects, projects, router, currentPage, totalPages, onPageChange]);

  return projectsToShow;
};

/**
 * Displays the workflow phases overview
 */
const WorkflowOverview = () => {
  return (
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
              <p className="mt-2 text-sm font-medium text-gray-700">{phase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ProjectsOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [filterPhase, setFilterPhase] = useState<ProjectPhase | null>(null);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(9); // Show 9 projects per page (3x3 grid)
  const [recentProject, setRecentProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats>({
    activeProjects: 0,
    inTranslation: 0,
    inProofreading: 0,
    inAudioProduction: 0,
    inAudioReview: 0,
  });

  // Memoized function to calculate project statistics
  const calculateProjectStats = useCallback((projects: Project[]): ProjectStats => {
    const activeProjects = projects.length;
    
    let inTranslation = 0;
    let inProofreading = 0;
    let inAudioProduction = 0;
    let inAudioReview = 0;
    
    projects.forEach(project => {
      // Count projects in each stage that are in progress
      if (project.currentPhase === ProjectPhase.SUBTITLE_TRANSLATION && 
          project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.IN_PROGRESS) {
        inTranslation++;
      }
      
      if (project.currentPhase === ProjectPhase.TRANSLATION_PROOFREADING && 
          project.phases[ProjectPhase.TRANSLATION_PROOFREADING] === PhaseStatus.IN_PROGRESS) {
        inProofreading++;
      }
      
      if (project.currentPhase === ProjectPhase.AUDIO_PRODUCTION && 
          project.phases[ProjectPhase.AUDIO_PRODUCTION] === PhaseStatus.IN_PROGRESS) {
        inAudioProduction++;
      }
      
      if (project.currentPhase === ProjectPhase.AUDIO_REVIEW && 
          project.phases[ProjectPhase.AUDIO_REVIEW] === PhaseStatus.IN_PROGRESS) {
        inAudioReview++;
      }
    });
    
    return {
      activeProjects,
      inTranslation,
      inProofreading,
      inAudioProduction,
      inAudioReview,
    };
  }, []);

  // Apply all filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    let result = [...projects];
    
    // Apply in-progress filter if active
    if (filterActive) {
      result = result.filter(project => 
        Object.values(project.phases).some(status => status === PhaseStatus.IN_PROGRESS)
      );
    }
    
    // Apply phase filter if selected
    if (filterPhase) {
      result = result.filter(project => project.currentPhase === filterPhase);
    }
    
    // Apply sorting
    if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'date') {
      result.sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt : 
                     typeof a.updatedAt === 'number' ? new Date(a.updatedAt) : new Date();
        const dateB = b.updatedAt instanceof Date ? b.updatedAt : 
                     typeof b.updatedAt === 'number' ? new Date(b.updatedAt) : new Date();
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    setFilteredProjects(result);
    // Reset to first page when filters change
    setPage(1);
  }, [projects, filterActive, filterPhase, sortOption]);

  // Toggle in-progress filter
  const toggleInProgressFilter = useCallback(() => {
    setFilterActive(prev => !prev);
  }, []);
  
  // Set phase filter
  const setPhaseFilter = useCallback((phase: ProjectPhase | null) => {
    setFilterPhase(prev => prev === phase ? null : phase);
  }, []);
  
  // Effect to apply filters and sorting when filter conditions change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Function to cycle through sort options
  const cycleSortOption = useCallback(() => {
    setSortOption(prevOption => {
      // Cycle through sort options: null -> name -> date -> null
      if (prevOption === null) {
        return 'name';
      } else if (prevOption === 'name') {
        return 'date';
      } else {
        return null;
      }
    });
  }, []);

  // Fetch projects and calculate stats
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!user?.uid) return;
      
      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }
        
        // Try to fetch projects a few times with a delay between attempts
        let attempts = 0;
        const maxAttempts = 3;
        let userProjects = null;
        
        console.log('Attempting to fetch projects with user ID:', user.uid);
        
        while (attempts < maxAttempts && !userProjects && isMounted) {
          try {
            userProjects = await getUserProjects(user.uid);
            console.log('Projects fetched successfully:', userProjects.length);
          } catch (err) {
            console.error(`Attempt ${attempts + 1} failed:`, err);
            attempts++;
            if (attempts >= maxAttempts) throw err;
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (userProjects && isMounted) {
          setProjects(userProjects);
          setFilteredProjects(userProjects);
          
          // Calculate statistics
          const projectStats = calculateProjectStats(userProjects);
          setStats(projectStats);
          
          // Set most recent project for "Continue Recent Work" button
          if (userProjects.length > 0) {
            // Sort by updatedAt timestamp
            const sortedProjects = [...userProjects].sort(
              (a, b) => {
                const dateA = a.updatedAt instanceof Date ? a.updatedAt : 
                            typeof a.updatedAt === 'number' ? new Date(a.updatedAt) : new Date();
                const dateB = b.updatedAt instanceof Date ? b.updatedAt : 
                            typeof b.updatedAt === 'number' ? new Date(b.updatedAt) : new Date();
                return dateB.getTime() - dateA.getTime();
              }
            );
            
            // Find most recent project with any in-progress phase
            const inProgressProject = sortedProjects.find(project => 
              Object.values(project.phases).some(status => status === PhaseStatus.IN_PROGRESS)
            );
            
            // Use in-progress project if found, otherwise use most recent
            setRecentProject(inProgressProject || sortedProjects[0]);
          }
        } else if (isMounted) {
          throw new Error('Failed to load projects after multiple attempts');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (isMounted) {
          setError('Failed to load project data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [user, calculateProjectStats]);

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your translation projects.
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
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
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">In Translation</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.inTranslation}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">In Proofreading</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.inProofreading}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">In Audio Production</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.inAudioProduction}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">In Audio Review</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.inAudioReview}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Projects */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 md:mb-0">Your Projects</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="primary"
                    size="md"
                    className="bg-blue-600 hover:bg-blue-700"
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    }
                    onClick={() => router.push('/projects/new')}
                  >
                    New Project
                  </Button>
                  <Button 
                    variant={filterActive ? "primary" : "outline"}
                    className={filterActive ? "bg-blue-600 hover:bg-blue-700" : ""}
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                      </svg>
                    }
                    onClick={toggleInProgressFilter}
                  >
                    {filterActive ? "All Projects" : "In Progress"}
                  </Button>
                  <Button
                    variant={sortOption ? "primary" : "outline"}
                    className={sortOption ? "bg-blue-600 hover:bg-blue-700" : ""}
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                      </svg>
                    }
                    onClick={cycleSortOption}
                  >
                    {sortOption === 'name' ? 'Sort: Name' : sortOption === 'date' ? 'Sort: Date' : 'Sort'}
                  </Button>
                </div>
              </div>
              
              {/* Filter by workflow stage */}
              <div className="px-4 pb-2 sm:px-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Workflow Stage:</h3>
                <ProjectPhaseFilters activePhase={filterPhase} onPhaseSelect={setPhaseFilter} />
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <ProjectsDisplay 
                  projects={filteredProjects} 
                  router={router} 
                  currentPage={page}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/projects/new">
                  <Button variant="primary" fullWidth className="bg-blue-600 hover:bg-blue-700" leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  }>
                    Create New Project
                  </Button>
                </Link>
                
                {recentProject && (
                  <Button
                    variant="primary"
                    fullWidth
                    className="bg-indigo-600 hover:bg-indigo-700"
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    }
                    onClick={() => router.push(`/projects/${recentProject.id}/phases/${recentProject.currentPhase}`)}
                  >
                    Continue Recent Work
                  </Button>
                )}
                
                <Button variant="outline" fullWidth leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                }
                onClick={() => {
                  // Find project in translation phase
                  const translationProject = projects.find(p => 
                    p.currentPhase === ProjectPhase.SUBTITLE_TRANSLATION && 
                    p.phases[ProjectPhase.SUBTITLE_TRANSLATION] !== PhaseStatus.COMPLETED
                  );
                  if (translationProject) {
                    router.push(`/projects/${translationProject.id}/phases/${ProjectPhase.SUBTITLE_TRANSLATION}`);
                  } else {
                    router.push('/projects/new');
                  }
                }}
                >
                  Start Translation
                </Button>
                
                <Button variant="outline" fullWidth leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                }
                onClick={() => {
                  // Find project in audio production phase
                  const audioProject = projects.find(p => 
                    p.currentPhase === ProjectPhase.AUDIO_PRODUCTION && 
                    p.phases[ProjectPhase.AUDIO_PRODUCTION] !== PhaseStatus.COMPLETED
                  );
                  if (audioProject) {
                    router.push(`/projects/${audioProject.id}/phases/${ProjectPhase.AUDIO_PRODUCTION}`);
                  } else {
                    // Otherwise find project in translation
                    const translatedProject = projects.find(p => 
                      p.phases[ProjectPhase.TRANSLATION_PROOFREADING] === PhaseStatus.COMPLETED
                    );
                    if (translatedProject) {
                      router.push(`/projects/${translatedProject.id}/phases/${ProjectPhase.AUDIO_PRODUCTION}`);
                    } else {
                      router.push('/projects/new');
                    }
                  }
                }}
                >
                  Record Audio
                </Button>
              </div>
            </div>

            {/* Workflow Overview */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-xl font-semibold text-gray-900">Translation Workflow</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <WorkflowOverview />
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}