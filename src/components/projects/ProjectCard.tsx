// src/components/projects/ProjectCard.tsx
'use client';

import { memo } from 'react';
import { Project, ProjectPhase, PhaseStatus } from '@/lib/types';
import { 
  PHASE_LABELS, 
  STATUS_BG_COLORS, 
  PHASE_SEQUENCE, 
  formatDate,
  calculateProjectProgress,
  STATUS_LABELS,
  NEXT_PHASE
} from '@/lib/constants';
import InteractiveCard from '@/components/ui/InteractiveCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

/**
 * Project card component that displays a summary of a project
 * and its current status in the workflow
 */
const ProjectCard = memo(function ProjectCard({ project, onClick }: ProjectCardProps) {
  const router = useRouter();
  const { id, name, description, sourceLanguage, targetLanguages, currentPhase, phases, owner, assignees } = project;
  
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

  // Determine the appropriate action based on current phase and status
  const getNextActionLabel = () => {
    if (phases[currentPhase] === PhaseStatus.NOT_STARTED) {
      return `Start ${PHASE_LABELS[currentPhase]}`;
    } else if (phases[currentPhase] === PhaseStatus.IN_PROGRESS) {
      return `Continue ${PHASE_LABELS[currentPhase]}`;
    } else if (NEXT_PHASE[currentPhase]) {
      const nextPhase = NEXT_PHASE[currentPhase];
      return `Start ${PHASE_LABELS[nextPhase as ProjectPhase]}`;
    } else {
      return 'View Project';
    }
  };
  
  // Handle the next action click
  const handleNextAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/projects/${id}/phases/${currentPhase}`);
  };
  
  // Get the next action button based on the current phase and status
  const getNextActionButton = () => {
    const label = getNextActionLabel();
    return (
      <Button
        variant="primary"
        size="sm"
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        onClick={handleNextAction}
      >
        {label}
      </Button>
    );
  };
  
  // Project footer with modified info
  const projectFooter = (
    <div className="space-y-3">
      {/* Visual workflow progress indicator */}
      <div className="flex justify-between items-center mb-2 relative pt-2">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" aria-hidden="true"></div>
        {PHASE_SEQUENCE.map((phase, index) => {
          // Determine colors based on phase status
          let bgColor = "bg-gray-200";
          let textColor = "text-gray-500";
          let ringColor = "";
          
          if (phases[phase] === PhaseStatus.COMPLETED) {
            bgColor = "bg-green-500";
            textColor = "text-white";
          } else if (phases[phase] === PhaseStatus.IN_PROGRESS) {
            bgColor = "bg-blue-500";
            textColor = "text-white";
          }
          
          // Add ring for current phase
          if (phase === currentPhase) {
            ringColor = "ring-2 ring-blue-500 ring-offset-2";
          }
          
          return (
            <div key={phase} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-7 h-7 rounded-full ${bgColor} ${textColor} ${ringColor} flex items-center justify-center text-xs font-medium`}
                title={`${PHASE_LABELS[phase]}: ${STATUS_LABELS[phases[phase]]}`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-1 font-medium hidden sm:block" style={{maxWidth: '60px', textAlign: 'center'}}>
                {PHASE_LABELS[phase].split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Last updated and owner/assignee info */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          Updated: {formatDate(project.updatedAt)}
        </span>
        {owner && (
          <span className="truncate">
            Owner: {owner.split('@')[0]}
          </span>
        )}
      </div>
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
        
        {/* Next Action Button */}
        {getNextActionButton()}
      </div>
    </InteractiveCard>
  );
});

export default ProjectCard;