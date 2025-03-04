// src/components/projects/ProjectCard.tsx
'use client';

import { memo } from 'react';
import { Project } from '@/lib/types';
import { 
  PHASE_LABELS, 
  STATUS_BG_COLORS, 
  PHASE_SEQUENCE, 
  formatDate,
  calculateProjectProgress,
  STATUS_LABELS 
} from '@/lib/constants';
import InteractiveCard from '@/components/ui/InteractiveCard';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

/**
 * Project card component that displays a summary of a project
 * and its current status in the workflow
 */
const ProjectCard = memo(function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { id, name, description, sourceLanguage, targetLanguages, currentPhase, phases } = project;
  
  // Calculate overall progress
  const progress = calculateProjectProgress(phases);
  
  // Create status badge
  const statusBadge = (
    <span 
      className={`text-xs px-2.5 py-1 rounded-full ${STATUS_BG_COLORS[phases[currentPhase]]}`}
      aria-label={`Current phase: ${PHASE_LABELS[currentPhase]}, Status: ${STATUS_LABELS[phases[currentPhase]]}`}
    >
      {PHASE_LABELS[currentPhase]}
    </span>
  );
  
  // Project footer with phase indicators and update time
  const projectFooter = (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        {PHASE_SEQUENCE.map((phase) => (
          <div 
            key={phase}
            className={`w-2.5 h-2.5 rounded-full ${STATUS_BG_COLORS[phases[phase]]}`}
            title={`${PHASE_LABELS[phase]}: ${STATUS_LABELS[phases[phase]]}`}
            aria-hidden="true"
          ></div>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        Updated: {formatDate(project.updatedAt)}
      </span>
    </div>
  );
  
  return (
    <InteractiveCard
      href={onClick ? undefined : `/projects/${id}`}
      onClick={onClick}
      badge={statusBadge}
      footer={projectFooter}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-2">{name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            From: {sourceLanguage}
          </span>
          
          {targetLanguages.map((language, index) => (
            <span 
              key={language + index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              To: {language}
            </span>
          ))}
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div 
            className="w-full bg-gray-200 rounded-full h-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Project progress: ${progress}%`}
          >
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
});

export default ProjectCard;