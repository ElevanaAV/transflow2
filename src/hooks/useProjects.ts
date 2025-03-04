// src/hooks/useProjects.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUserProjects } from '@/lib/services/projectService';
import { Project, ProjectPhase, PhaseStatus } from '@/lib/types';
import { createCache } from '@/lib/cache';
import { handleError, AppError } from '@/lib/errors/errorTypes';

// Create a cache for projects with 5 minute TTL
const projectsCache = createCache<Project[]>(5 * 60 * 1000);

interface ProjectsState {
  projects: Project[] | null;
  filteredProjects: Project[] | null;
  isLoading: boolean;
  error: AppError | null;
  filterByPhase: (phase: ProjectPhase | null) => void;
  filterByStatus: (status: PhaseStatus | null) => void;
  sortByName: () => void;
  sortByDate: () => void;
  refreshProjects: () => Promise<void>;
  selectedPhase: ProjectPhase | null;
  selectedStatus: PhaseStatus | null;
  sortOrder: 'name' | 'date' | null;
}

/**
 * Custom hook to fetch and manage projects with caching and filtering
 */
export function useProjects(userId: string | null | undefined): ProjectsState {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [filteredProjects, setFilteredProjects] = useState<Project[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PhaseStatus | null>(null);
  const [sortOrder, setSortOrder] = useState<'name' | 'date' | null>(null);

  // Function to fetch projects with caching
  const fetchProjects = useCallback(async (forceRefresh: boolean = false) => {
    if (!userId) {
      setProjects(null);
      setFilteredProjects(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use cache if available and not forcing refresh
      const cacheKey = `projects_${userId}`;
      let projectsData: Project[] | null = null;

      if (!forceRefresh) {
        projectsData = projectsCache.get(cacheKey);
        
        if (projectsData) {
          setProjects(projectsData);
          applyFiltersAndSort(projectsData);
          setIsLoading(false);
          
          // Still fetch in background to refresh silently
          getUserProjects(userId)
            .then(freshData => {
              projectsCache.set(cacheKey, freshData);
              setProjects(freshData);
              applyFiltersAndSort(freshData);
            })
            .catch(err => {
              console.error('Background refresh failed:', err);
              // Don't update error state for background refreshes
            });
            
          return;
        }
      }

      // No cache hit or forced refresh
      const data = await getUserProjects(userId);
      projectsCache.set(cacheKey, data);
      setProjects(data);
      applyFiltersAndSort(data);
      
    } catch (err) {
      console.error('Error fetching projects:', err);
      const appError = handleError(err);
      setError(appError);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Apply filters and sorting to projects
  const applyFiltersAndSort = useCallback((projectsToFilter: Project[]) => {
    let result = [...projectsToFilter];
    
    // Apply phase filter
    if (selectedPhase) {
      result = result.filter(p => p.currentPhase === selectedPhase);
    }
    
    // Apply status filter
    if (selectedStatus) {
      result = result.filter(p => {
        // If phase selected, check status for that phase
        if (selectedPhase) {
          return p.phases[selectedPhase] === selectedStatus;
        }
        // Otherwise check if any phase has this status
        return Object.values(p.phases).some(status => status === selectedStatus);
      });
    }
    
    // Apply sorting
    if (sortOrder === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'date') {
      result.sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt : 
                      typeof a.updatedAt === 'number' ? new Date(a.updatedAt) : new Date();
        const dateB = b.updatedAt instanceof Date ? b.updatedAt : 
                      typeof b.updatedAt === 'number' ? new Date(b.updatedAt) : new Date();
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    setFilteredProjects(result);
  }, [selectedPhase, selectedStatus, sortOrder]);

  // Filter projects by phase
  const filterByPhase = useCallback((phase: ProjectPhase | null) => {
    setSelectedPhase(prevPhase => prevPhase === phase ? null : phase);
  }, []);

  // Filter projects by status
  const filterByStatus = useCallback((status: PhaseStatus | null) => {
    setSelectedStatus(prevStatus => prevStatus === status ? null : status);
  }, []);

  // Sort projects by name
  const sortByName = useCallback(() => {
    setSortOrder(prev => prev === 'name' ? null : 'name');
  }, []);

  // Sort projects by date
  const sortByDate = useCallback(() => {
    setSortOrder(prev => prev === 'date' ? null : 'date');
  }, []);

  // Refresh projects (force refetch)
  const refreshProjects = useCallback(async () => {
    await fetchProjects(true);
  }, [fetchProjects]);

  // Apply filters and sorting when related state changes
  useEffect(() => {
    if (projects) {
      applyFiltersAndSort(projects);
    }
  }, [projects, selectedPhase, selectedStatus, sortOrder, applyFiltersAndSort]);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    filteredProjects,
    isLoading,
    error,
    filterByPhase,
    filterByStatus,
    sortByName,
    sortByDate,
    refreshProjects,
    selectedPhase,
    selectedStatus,
    sortOrder,
  };
}