// src/components/projects/WorkflowPhaseIndicator.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ProjectPhase, PhaseStatus, Project } from '@/lib/types';
import { 
  PHASE_LABELS, 
  PHASE_DESCRIPTIONS, 
  STATUS_COLORS, 
  STATUS_LABELS,
  PHASE_SEQUENCE 
} from '@/lib/constants';

interface WorkflowPhaseIndicatorProps {
  project: Project;
  onPhaseClick?: (phase: ProjectPhase) => void;
}

/**
 * Workflow phase indicator component that shows the progression of a project
 * through its phases with interactive elements
 */
export default function WorkflowPhaseIndicator({ project, onPhaseClick }: WorkflowPhaseIndicatorProps) {
  const [activePhase, setActivePhase] = useState<ProjectPhase | null>(null);

  const phases = useMemo(() => PHASE_SEQUENCE, []);

  // Memoized handler for phase clicking
  const handlePhaseClick = useCallback((phase: ProjectPhase) => {
    setActivePhase((prevPhase) => prevPhase === phase ? null : phase);
    if (onPhaseClick) {
      onPhaseClick(phase);
    }
  }, [onPhaseClick]);

  // Memoized function to generate status classes
  const getStatusClass = useCallback((phase: ProjectPhase) => {
    const status = project.phases[phase];
    const isCurrentPhase = project.currentPhase === phase;
    
    let baseClasses = `rounded-lg p-4 my-2 cursor-pointer transition-all duration-200 flex items-center
      justify-between border-2 ${STATUS_COLORS[status]}`;
    
    if (isCurrentPhase) {
      baseClasses += ' border-blue-500 shadow-md';
    } else {
      baseClasses += ' border-transparent';
    }
    
    if (activePhase === phase) {
      baseClasses += ' ring-2 ring-blue-400';
    }
    
    return baseClasses;
  }, [project.phases, project.currentPhase, activePhase]);

  // Memoized function to get phase number
  const getPhaseNumber = useCallback((phase: ProjectPhase) => {
    return phases.indexOf(phase) + 1;
  }, [phases]);

  // Progress indicators for each phase
  const phaseIndicators = useMemo(() => {
    return phases.map((phase, index) => {
      const status = project.phases[phase];
      const phaseNumber = getPhaseNumber(phase);
      const isCompleted = status === PhaseStatus.COMPLETED;
      const isInProgress = status === PhaseStatus.IN_PROGRESS;
      
      return (
        <div key={phase} className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              isCompleted 
                ? 'bg-green-500' 
                : isInProgress 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
            }`}
            aria-label={`Phase ${phaseNumber}: ${PHASE_LABELS[phase]}, status: ${STATUS_LABELS[status]}`}
          >
            {phaseNumber}
          </div>
          {index < phases.length - 1 && (
            <div 
              className={`h-1 w-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} 
              aria-hidden="true"
            />
          )}
        </div>
      );
    });
  }, [phases, project.phases, getPhaseNumber]);

  // Phase detail items
  const phaseItems = useMemo(() => {
    return phases.map((phase) => {
      const status = project.phases[phase];
      const isActive = activePhase === phase;
      
      return (
        <div 
          key={phase}
          className={getStatusClass(phase)}
          onClick={() => handlePhaseClick(phase)}
          role="button"
          aria-expanded={isActive}
          aria-label={`Phase ${getPhaseNumber(phase)}: ${PHASE_LABELS[phase]}`}
        >
          <div>
            <div className="flex items-center">
              <span className="font-semibold">{PHASE_LABELS[phase]}</span>
              <span 
                className="ml-2 text-xs px-2 py-1 rounded-full bg-white bg-opacity-50"
                aria-label={`Status: ${STATUS_LABELS[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
            {isActive && (
              <div className="mt-2 text-sm">
                <p className="mb-2">{PHASE_DESCRIPTIONS[phase]}</p>
                {project.id && (
                  <Link 
                    href={`/projects/${project.id}/phases/${phase}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Go to phase
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="text-sm">
            Phase {getPhaseNumber(phase)}
          </div>
        </div>
      );
    });
  }, [phases, project, activePhase, getStatusClass, getPhaseNumber, handlePhaseClick]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">Workflow Phases</h3>
      
      <div className="flex mb-4" role="progressbar" aria-label="Project workflow progress">
        {phaseIndicators}
      </div>
      
      <div className="space-y-3">
        {phaseItems}
      </div>
    </div>
  );
}