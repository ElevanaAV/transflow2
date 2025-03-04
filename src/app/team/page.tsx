'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { getTeamMembers, getUsersByRole, getUserProfile, setUserValidationStatus, createOrUpdateUserProfile } from '@/lib/services/userService';
import { UserProfile, UserRole } from '@/lib/types';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';

/**
 * Team Member Card component - Display-only version
 */
const TeamMemberCard = ({ member }: { member: UserProfile }) => {
  // Default avatar if no photo URL
  const avatarUrl = member.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.displayName || 'User');
  
  // Format role badges
  const roleBadges = member.roles.filter(role => role !== UserRole.USER).map(role => {
    let bgColor = 'bg-gray-100 text-gray-800';
    
    // Different colors for different roles
    switch(role) {
      case UserRole.ADMIN:
        bgColor = 'bg-red-100 text-red-800';
        break;
      case UserRole.TRANSLATOR:
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      case UserRole.REVIEWER:
        bgColor = 'bg-green-100 text-green-800';
        break;
      case UserRole.AUDIO_PRODUCER:
        bgColor = 'bg-purple-100 text-purple-800';
        break;
    }
    
    return (
      <span 
        key={role} 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
      >
        {role.replace('_', ' ')}
      </span>
    );
  });
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
            <img 
              src={avatarUrl}
              alt={member.displayName || 'Team member'}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + 
                  encodeURIComponent(member.displayName || 'User');
              }}
            />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{member.displayName || member.email}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {roleBadges}
            </div>
          </div>
        </div>
        
        {member.bio && (
          <p className="mt-4 text-sm text-gray-600">{member.bio}</p>
        )}
        
        {member.languages && member.languages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Languages</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {member.languages.map(lang => (
                <span 
                  key={lang} 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {member.skills && member.skills.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {member.skills.map(skill => (
                <span 
                  key={skill} 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Editable Team Member Component for admin mode
 */
const EditableTeamMember = ({ 
  member, 
  roleSelections,
  toggleRoleCheckbox,
  saveRoleChanges,
  toggleUserValidation
}: { 
  member: UserProfile;
  roleSelections: Record<string, Record<UserRole, boolean>>;
  toggleRoleCheckbox: (userId: string, role: UserRole) => void;
  saveRoleChanges: (userId: string) => Promise<void>;
  toggleUserValidation: (userId: string, currentStatus: boolean) => Promise<void>;
}) => {
  const avatarUrl = member.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.displayName || 'User');
  
  // All available roles for selection
  const availableRoles = [
    UserRole.ADMIN,
    UserRole.TRANSLATOR,
    UserRole.REVIEWER,
    UserRole.AUDIO_PRODUCER
  ];
  
  return (
    <li>
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200">
              {member.photoURL ? (
                <img 
                  src={member.photoURL} 
                  alt={member.displayName || 'User'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {member.displayName || 'No Name'}
              </h3>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={member.isValidated ? "primary" : "outline"}
              className={member.isValidated ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => toggleUserValidation(member.uid, member.isValidated)}
            >
              {member.isValidated ? 'Validated' : 'Validate'}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Roles</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableRoles.map(role => (
              <label key={role} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roleSelections[member.uid]?.[role] || false}
                  onChange={() => toggleRoleCheckbox(member.uid, role)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{role.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-4">
            <Button
              variant="primary"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => saveRoleChanges(member.uid)}
            >
              Save Roles
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
};

/**
 * Combined Team page component with admin management features
 */
export default function TeamPage() {
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  
  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // View mode state
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole | 'all'>('all');
  
  // Admin management state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roleSelections, setRoleSelections] = useState<Record<string, Record<UserRole, boolean>>>({});
  
  // Toggle between view and management mode for admins
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Check for 'mode=edit' in the URL and set edit mode if the user is an admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const modeParam = url.searchParams.get('mode');
        
        if (isAdmin && modeParam === 'edit') {
          setIsEditMode(true);
        } else if (isAdmin && !modeParam && isEditMode) {
          // If we're in edit mode but URL doesn't have the parameter,
          // update URL to include it for better sharing
          router.replace(`/team?mode=edit`);
        }
      } catch (err) {
        console.error('Error parsing URL:', err);
      }
    }
  }, [isAdmin, router, isEditMode]);
  
  // Fetch users data - either team members or all users based on mode
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (isAdmin && isEditMode) {
          console.log('Admin edit mode: fetching all users');
          // Admin in edit mode sees all users with management options
          const usersQuery = query(
            collection(firestore, 'users'),
            orderBy('email')
          );
          
          const querySnapshot = await getDocs(usersQuery);
          console.log(`Found ${querySnapshot.size} users in the system`);
          
          const userList = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              uid: doc.id,
              email: data.email || '',
              displayName: data.displayName || '',
              photoURL: data.photoURL || '',
              isValidated: data.isValidated || false,
              roles: data.roles || [UserRole.USER],
              bio: data.bio || '',
              skills: data.skills || [],
              languages: data.languages || [],
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            } as UserProfile;
          });
          
          setUsers(userList);
          
          // Initialize role selections with current roles
          const initialRoleSelections: Record<string, Record<UserRole, boolean>> = {};
          userList.forEach(user => {
            const userRoles: Record<UserRole, boolean> = {
              [UserRole.ADMIN]: false,
              [UserRole.TRANSLATOR]: false,
              [UserRole.REVIEWER]: false,
              [UserRole.AUDIO_PRODUCER]: false,
              [UserRole.USER]: true // Always checked
            };
            
            // Set selected roles to true
            user.roles.forEach(role => {
              userRoles[role] = true;
            });
            
            initialRoleSelections[user.uid] = userRoles;
          });
          
          setRoleSelections(initialRoleSelections);
        } else {
          console.log(`View mode: ${isAdmin ? 'admin' : 'non-admin'} user, activeRole=${activeRole}`);
          // View mode - show filtered team members
          let members: UserProfile[] = [];
          
          if (isAdmin) {
            // Admin can see all team members
            if (activeRole === 'all') {
              console.log('Admin fetching all team members');
              try {
                members = await getTeamMembers();
                console.log(`Found ${members.length} team members`);
              } catch (fetchErr) {
                console.error('Error fetching team members:', fetchErr);
                // Fallback to fetching all users if team members query fails
                const usersQuery = query(collection(firestore, 'users'));
                const querySnapshot = await getDocs(usersQuery);
                members = querySnapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                    uid: doc.id,
                    email: data.email || '',
                    displayName: data.displayName || '',
                    photoURL: data.photoURL || '',
                    isValidated: data.isValidated || false,
                    roles: data.roles || [UserRole.USER],
                    bio: data.bio || '',
                    skills: data.skills || [],
                    languages: data.languages || [],
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                  } as UserProfile;
                }).filter(user => 
                  // Filter for users with specialized roles
                  user.roles.some(role => role !== UserRole.USER)
                );
                console.log(`Fallback: Found ${members.length} users with specialized roles`);
              }
            } else {
              console.log(`Admin fetching users with role: ${activeRole}`);
              try {
                members = await getUsersByRole(activeRole);
                console.log(`Found ${members.length} users with role ${activeRole}`);
              } catch (fetchErr) {
                console.error(`Error fetching users with role ${activeRole}:`, fetchErr);
                // Fallback to filtering all users manually
                const usersQuery = query(collection(firestore, 'users'));
                const querySnapshot = await getDocs(usersQuery);
                members = querySnapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                    uid: doc.id,
                    email: data.email || '',
                    displayName: data.displayName || '',
                    photoURL: data.photoURL || '',
                    isValidated: data.isValidated || false,
                    roles: data.roles || [UserRole.USER],
                    bio: data.bio || '',
                    skills: data.skills || [],
                    languages: data.languages || [],
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                  } as UserProfile;
                }).filter(user => 
                  // Filter for users with the specific role
                  user.roles.includes(activeRole as UserRole)
                );
                console.log(`Fallback: Found ${members.length} users with role ${activeRole}`);
              }
            }
          } else {
            // Non-admins can only see admins and themselves
            console.log('Non-admin fetching admins and self');
            try {
              // First try to get current user profile
              if (user) {
                let currentUserProfile = null;
                try {
                  console.log(`Fetching current user profile: ${user.uid}`);
                  currentUserProfile = await getUserProfile(user.uid);
                } catch (profileErr) {
                  console.error('Error fetching current user profile:', profileErr);
                  // Create a minimal profile from auth data
                  currentUserProfile = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    isValidated: false,
                    roles: [UserRole.USER],
                    createdAt: new Date(),
                    updatedAt: new Date()
                  } as UserProfile;
                }
                
                // Then try to get admin users
                try {
                  console.log('Fetching admin users');
                  const adminUsers = await getUsersByRole(UserRole.ADMIN);
                  console.log(`Found ${adminUsers.length} admin users`);
                  
                  // Combine current user with admin users, filtering out duplicates
                  members = [
                    ...adminUsers.filter(admin => admin.uid !== user.uid),
                    currentUserProfile
                  ];
                } catch (adminErr) {
                  console.error('Error fetching admin users:', adminErr);
                  // Just show current user if admin fetch fails
                  members = [currentUserProfile];
                }
              }
            } catch (err) {
              console.error('Error in non-admin view setup:', err);
              // Last resort fallback - empty list
              members = [];
            }
          }
          
          console.log(`Setting team members: ${members.length}`);
          setTeamMembers(members);
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, isAdmin, isEditMode, activeRole]);
  
  // Role filter options for view mode
  const roleFilters = [
    { label: 'All Team', value: 'all' },
    { label: 'Translators', value: UserRole.TRANSLATOR },
    { label: 'Reviewers', value: UserRole.REVIEWER },
    { label: 'Audio Producers', value: UserRole.AUDIO_PRODUCER },
    { label: 'Admins', value: UserRole.ADMIN }
  ];
  
  // Admin management functions
  const toggleUserValidation = async (userId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    
    try {
      setError(null);
      setSuccess(null);
      
      await setUserValidationStatus(userId, !currentStatus);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.uid === userId 
            ? { ...u, isValidated: !currentStatus } 
            : u
        )
      );
      
      setSuccess('User validation status updated successfully.');
    } catch (err) {
      console.error('Error updating user validation:', err);
      setError('Failed to update user validation status.');
    }
  };
  
  const toggleRoleCheckbox = (userId: string, role: UserRole) => {
    if (!isAdmin || role === UserRole.USER) return; // Can't toggle USER role
    
    setRoleSelections(prev => {
      const userRoles = prev[userId] || {};
      return {
        ...prev,
        [userId]: {
          ...userRoles,
          [role]: !userRoles[role]
        }
      };
    });
  };
  
  const saveRoleChanges = async (userId: string) => {
    if (!isAdmin) return;
    
    try {
      setError(null);
      setSuccess(null);
      
      const userToUpdate = users.find(u => u.uid === userId);
      if (!userToUpdate) return;
      
      const selectedRoles: UserRole[] = [];
      
      // Add USER role by default
      selectedRoles.push(UserRole.USER);
      
      // Add all selected roles
      Object.entries(roleSelections[userId] || {}).forEach(([role, isSelected]) => {
        if (isSelected && role !== UserRole.USER) {
          selectedRoles.push(role as UserRole);
        }
      });
      
      await createOrUpdateUserProfile(userId, {
        email: userToUpdate.email,
        roles: selectedRoles
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.uid === userId 
            ? { ...u, roles: selectedRoles } 
            : u
        )
      );
      
      setSuccess('User roles updated successfully.');
    } catch (err) {
      console.error('Error updating user roles:', err);
      setError('Failed to update user roles.');
    }
  };
  
  if (!isAdmin && isEditMode) {
    // Non-admins shouldn't access edit mode
    setIsEditMode(false);
  }
  
  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'User Management' : 'Our Team'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode 
                ? 'Manage users, validation status, and role assignments.' 
                : 'Meet the people who make TranslationFlow possible.'}
            </p>
          </div>
          
          {isAdmin && (
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button
                variant="primary"
                className={isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                onClick={() => {
                  const newMode = !isEditMode;
                  setIsEditMode(newMode);
                  // Update URL to reflect mode
                  if (newMode) {
                    router.replace('/team?mode=edit');
                  } else {
                    router.replace('/team');
                  }
                }}
              >
                {isEditMode ? 'View Team' : 'Manage Users'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Success and error messages */}
        {success && (
          <Alert 
            type="success" 
            message={success} 
            dismissible
            onDismiss={() => setSuccess(null)}
            autoHideDuration={5000}
            className="mb-6"
          />
        )}
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            dismissible
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}
        
        {/* Role filters - only shown to admins in view mode */}
        {isAdmin && !isEditMode && (
          <div className="mb-6 flex flex-wrap gap-2">
            {roleFilters.map(filter => (
              <Button
                key={filter.value}
                variant={activeRole === filter.value ? "primary" : "outline"}
                className={activeRole === filter.value ? "bg-blue-600 hover:bg-blue-700" : ""}
                onClick={() => setActiveRole(filter.value as UserRole | 'all')}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {isAdmin && isEditMode ? (
              // Admin Edit Mode - Full user management
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-center">
                      <p className="text-gray-500">No users found in the system.</p>
                    </li>
                  ) : (
                    users.map(userProfile => (
                      <EditableTeamMember
                        key={userProfile.uid}
                        member={userProfile}
                        roleSelections={roleSelections}
                        toggleRoleCheckbox={toggleRoleCheckbox}
                        saveRoleChanges={saveRoleChanges}
                        toggleUserValidation={toggleUserValidation}
                      />
                    ))
                  )}
                </ul>
              </div>
            ) : (
              // View Mode - Team display
              <>
                {teamMembers.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No team members yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeRole === 'all' 
                        ? 'There are no team members in the system yet.' 
                        : `There are no team members with the role "${activeRole}".`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map(member => (
                      <TeamMemberCard key={member.uid} member={member} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}