// src/components/projects/ProjectCard.tsx
'use client';

import { memo, useState, useEffect } from 'react';
import { Project, ProjectPhase, PhaseStatus, UserProfile, UserRole } from '@/lib/types';
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
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/services/userService';
import { updateProject } from '@/lib/services/projectService';
import { getValidatedUsers } from '@/lib/services/userService';

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
  const { id, name, description, sourceLanguage, targetLanguages, currentPhase, phases, owner } = project;
  const { userProfile, hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  
  // State for owner and assignee display names
  const [ownerName, setOwnerName] = useState<string>('Loading...');
  const [assignee, setAssignee] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState<string>('None');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate overall progress
  const progress = calculateProjectProgress(phases);
  
  // Fetch owner and assignee names when component mounts
  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        // Get owner name
        if (owner) {
          const ownerProfile = await getUserProfile(owner);
          if (ownerProfile && ownerProfile.displayName) {
            setOwnerName(ownerProfile.displayName);
          } else {
            setOwnerName(owner.split('@')[0]);
          }
        }

        // Get assignee for current phase if exists
        if (project.phaseAssignments && project.phaseAssignments[currentPhase]) {
          const assigneeId = project.phaseAssignments[currentPhase];
          setAssignee(assigneeId);
          
          const assigneeProfile = await getUserProfile(assigneeId);
          if (assigneeProfile && assigneeProfile.displayName) {
            setAssigneeName(assigneeProfile.displayName);
          } else {
            setAssigneeName(assigneeId.split('@')[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching user names:', error);
      }
    };

    fetchUserNames();
  }, [owner, project.phaseAssignments, currentPhase]);

  // Fetch users for dropdown when needed
  const fetchUsers = async () => {
    if (users.length === 0 && !isLoadingUsers) {
      setIsLoadingUsers(true);
      try {
        const validatedUsers = await getValidatedUsers();
        setUsers(validatedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    }
  };

  // Toggle dropdown for owner or assignee
  const toggleDropdown = (type: 'owner' | 'assignee') => {
    // Always fetch users when opening dropdown
    if (dropdownOpen === type) {
      setDropdownOpen(null);
    } else {
      // Start loading immediately
      if (users.length === 0) {
        setIsLoadingUsers(true);
      }
      setDropdownOpen(type);
      // Fetch regardless of current state
      getValidatedUsers()
        .then(validatedUsers => {
          console.log('Fetched validatedUsers:', validatedUsers);
          setUsers(validatedUsers);
          setIsLoadingUsers(false);
        })
        .catch(error => {
          console.error('Error fetching users:', error);
          setIsLoadingUsers(false);
        });
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Handle user selection for owner or assignee
  const handleUserSelect = async (userId: string, type: 'owner' | 'assignee') => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      if (type === 'owner') {
        // Update UI immediately for better user feedback
        setOwnerName('Updating...');
        
        // Update owner
        await updateProject(id || '', { owner: userId });
        
        // Get user display name
        const userProfile = await getUserProfile(userId);
        if (userProfile && userProfile.displayName) {
          setOwnerName(userProfile.displayName);
        } else {
          setOwnerName(userId.split('@')[0]);
        }
      } else {
        // Update UI immediately
        setAssigneeName('Updating...');
        
        // Update assignee for current phase
        const phaseAssignments = { ...project.phaseAssignments } || {};
        phaseAssignments[currentPhase] = userId;
        
        await updateProject(id || '', { phaseAssignments });
        setAssignee(userId);
        
        // Get user display name
        const userProfile = await getUserProfile(userId);
        if (userProfile && userProfile.displayName) {
          setAssigneeName(userProfile.displayName);
        } else {
          setAssigneeName(userId.split('@')[0]);
        }
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      // Reset to original values in case of error
      if (type === 'owner') {
        const originalOwnerProfile = await getUserProfile(owner || '');
        if (originalOwnerProfile && originalOwnerProfile.displayName) {
          setOwnerName(originalOwnerProfile.displayName);
        } else if (owner) {
          setOwnerName(owner.split('@')[0]);
        } else {
          setOwnerName('None');
        }
      } else if (assignee) {
        const originalAssigneeProfile = await getUserProfile(assignee);
        if (originalAssigneeProfile && originalAssigneeProfile.displayName) {
          setAssigneeName(originalAssigneeProfile.displayName);
        } else {
          setAssigneeName(assignee.split('@')[0]);
        }
      } else {
        setAssigneeName('None');
      }
    } finally {
      setDropdownOpen(null);
      setIsUpdating(false);
    }
  };
  
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
  
  // Handle document click to close dropdown
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (dropdownOpen) {
        setDropdownOpen(null);
      }
    };
    
    // Add event listener only when dropdown is open
    if (dropdownOpen) {
      document.addEventListener('click', handleDocumentClick);
      
      // Cleanup function
      return () => {
        document.removeEventListener('click', handleDocumentClick);
      };
    }
  }, [dropdownOpen]);

  // Render owner/assignee fields
  const renderUserField = (label: string, userName: string, type: 'owner' | 'assignee') => {
    // For non-admins, just show the names
    if (!isAdmin) {
      return (
        <div className="flex flex-col mb-2">
          <span className="text-xs font-medium text-gray-500">{label}:</span>
          <span className="text-sm text-gray-700">{userName}</span>
        </div>
      );
    }
    
    // For admins, show editable dropdown
    return (
      <div className="flex flex-col mb-2 relative">
        <span className="text-xs font-medium text-gray-500">{label}:</span>
        <button
          type="button"
          className={`text-sm text-gray-700 flex items-center justify-between p-1 rounded border ${
            isUpdating ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isUpdating) {
              toggleDropdown(type);
            }
          }}
          disabled={isUpdating}
        >
          <span className="truncate flex items-center">
            {isUpdating && <LoadingSpinner />}
            {userName}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        {dropdownOpen === type && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoadingUsers ? (
              <div className="p-2 text-center text-sm text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-2 text-center text-sm text-gray-500">No users found</div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {users.map((user) => (
                  <button
                    type="button"
                    key={user.uid}
                    className="w-full text-left text-sm p-2 hover:bg-gray-100 flex items-center justify-between"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUserSelect(user.uid, type);
                    }}
                  >
                    <span className="truncate">{user.displayName || user.email.split('@')[0]}</span>
                    {((type === 'owner' && owner === user.uid) || 
                     (type === 'assignee' && assignee === user.uid)) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
      
      {/* Last updated */}
      <div className="text-xs text-gray-500">
        <span>
          Updated: {formatDate(project.updatedAt)}
        </span>
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
        {/* Owner and Assignee fields at the top */}
        <div className="mb-3 border-b pb-2">
          {renderUserField('Owner', ownerName, 'owner')}
          {renderUserField('Assignee', assigneeName, 'assignee')}
        </div>
        
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