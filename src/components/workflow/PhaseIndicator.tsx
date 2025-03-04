// src/components/workflow/PhaseIndicator.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ProjectPhase, PhaseStatus, Project } from '@/lib/types';
import { 
  PHASE_LABELS, 
  PHASE_DESCRIPTIONS, 
  PHASE_SEQUENCE 
} from '@/lib/constants';
import { usePathname } from 'next/navigation';

interface PhaseIndicatorProps {
  project: Project;
  currentPhase?: ProjectPhase;
}

/**
 * Workflow phase indicator component that shows the progression of a project
 * through its 4 phases with highlighting for the current phase
 */
export default function PhaseIndicator({ project, currentPhase }: PhaseIndicatorProps) {
  const pathname = usePathname();
  const projectId = project?.id;
  
  // Determine current phase based on URL or prop
  const activePhase = useMemo(() => {
    if (currentPhase) {
      return currentPhase;
    }
    
    // Try to determine from URL
    if (pathname.includes('/phases/')) {
      const phaseFromUrl = pathname.split('/phases/')[1]?.split('/')[0];
      if (phaseFromUrl && Object.values(ProjectPhase).includes(phaseFromUrl as ProjectPhase)) {
        return phaseFromUrl as ProjectPhase;
      }
    }
    
    // Default to current project phase
    return project.currentPhase;
  }, [currentPhase, pathname, project.currentPhase]);

  // The 4 phases in sequence
  const phases = useMemo(() => PHASE_SEQUENCE, []);

  return (
    <div className="w-full mb-8">
      <h3 className="text-lg font-medium mb-4">Project Workflow</h3>
      
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute h-1 bg-gray-200 left-0 right-0 top-1/2 transform -translate-y-1/2 z-0" />
        
        {/* Phase indicators */}
        {phases.map((phase, index) => {
          const phaseStatus = project.phases[phase];
          const isActive = phase === activePhase;
          const isCompleted = phaseStatus === PhaseStatus.COMPLETED;
          const isInProgress = phaseStatus === PhaseStatus.IN_PROGRESS;
          
          // Determine status color
          let bgColor = 'bg-gray-200';
          let textColor = 'text-gray-600';
          let borderColor = 'border-transparent';
          
          if (isCompleted) {
            bgColor = 'bg-green-500';
            textColor = 'text-white';
          } else if (isInProgress) {
            bgColor = 'bg-blue-500';
            textColor = 'text-white';
          }
          
          if (isActive) {
            borderColor = 'border-primary';
          }
          
          return (
            <div key={phase} className="relative z-10 flex flex-col items-center">
              <Link 
                href={project.id ? `/projects/${project.id}/phases/${phase}` : '#'}
                className={`w-12 h-12 rounded-full flex items-center justify-center 
                  ${bgColor} ${textColor} ${isActive ? 'ring-4 ring-primary-light' : ''}
                  transition-all duration-200 hover:shadow-md`}
              >
                <span className="font-semibold">{index + 1}</span>
              </Link>
              <div className={`mt-2 text-sm font-medium ${isActive ? 'text-primary-dark' : 'text-gray-600'}`}>
                {PHASE_LABELS[phase]}
              </div>
              <div className="text-xs text-gray-500 text-center">
                {phaseStatus === PhaseStatus.COMPLETED && "Completed"}
                {phaseStatus === PhaseStatus.IN_PROGRESS && "In Progress"}
                {phaseStatus === PhaseStatus.NOT_STARTED && "Not Started"}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Current phase description */}
      {activePhase && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">{PHASE_LABELS[activePhase]}</h4>
          <p className="mt-1 text-sm text-gray-600">{PHASE_DESCRIPTIONS[activePhase]}</p>
          {projectId && (
            <div className="mt-3">
              <Link 
                href={`/projects/${projectId}/phases/${activePhase}`}
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                Go to phase →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}