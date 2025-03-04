// src/context/AuthContext.tsx
'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { 
  User, 
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  createOrUpdateUserProfile, 
  getUserProfile, 
  setUserValidationStatus 
} from '@/lib/services/userService';
import { UserProfile, UserRole } from '@/lib/types';

// Define types for our context
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmReset: (code: string, newPassword: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateUserValidation: (isValidated: boolean) => Promise<UserProfile>;
  updateUserRoles: (roles: UserRole[]) => Promise<UserProfile>;
  getUserData: () => Promise<UserProfile | null>;
  isUserValidated: () => boolean;
  hasRole: (role: UserRole) => boolean;
  clearError: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear any error messages
  const clearError = () => setError(null);
  
  // Fetch user profile data from Firestore
  const fetchUserProfile = async (uid: string) => {
    setProfileLoading(true);
    try {
      const profile = await getUserProfile(uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile after successful login
      if (credential.user) {
        await fetchUserProfile(credential.user.uid);
      }
      
      return credential;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, displayName?: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Set the display name if provided
      if (displayName && user) {
        await updateProfile(user, { displayName });
      }
      
      // Create user profile in Firestore
      if (user) {
        // Default values for new users
        const newUserData = {
          email: user.email || '',
          displayName: user.displayName || displayName || '',
          photoURL: user.photoURL || '',
          isValidated: false, // New users start as unvalidated
          roles: [UserRole.USER] // Default role
        };
        
        // Create the profile
        const profile = await createOrUpdateUserProfile(user.uid, newUserData);
        setUserProfile(profile);
      }
      
      return userCredential;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      // Clear user profile on logout
      setUserProfile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };
  
  // Confirm password reset function
  const confirmReset = async (code: string, newPassword: string) => {
    setError(null);
    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };
  
  // Verify password reset code function
  const verifyResetCode = async (code: string) => {
    setError(null);
    try {
      return await verifyPasswordResetCode(auth, code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  // Update user profile function
  const updateUserProfile = async (displayName: string) => {
    setError(null);
    if (!user) {
      setError('No user is signed in');
      throw new Error('No user is signed in');
    }
    
    try {
      // Update Firebase auth profile
      await updateProfile(user, { displayName });
      // Force a re-render with the new user info
      setUser({ ...user });
      
      // Also update Firestore profile
      if (userProfile) {
        const updatedProfile = await createOrUpdateUserProfile(user.uid, {
          email: user.email || '',
          displayName
        });
        setUserProfile(updatedProfile);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };
  
  // Function to update user validation status
  const updateUserValidation = async (isValidated: boolean) => {
    setError(null);
    if (!user) {
      setError('No user is signed in');
      throw new Error('No user is signed in');
    }
    
    try {
      const updatedProfile = await setUserValidationStatus(user.uid, isValidated);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };
  
  // Function to update user roles
  const updateUserRoles = async (roles: UserRole[]) => {
    setError(null);
    if (!user) {
      setError('No user is signed in');
      throw new Error('No user is signed in');
    }
    
    try {
      const updatedProfile = await createOrUpdateUserProfile(user.uid, {
        email: user.email || '',
        roles
      });
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  };
  
  // Function to get latest user data
  const getUserData = async () => {
    if (!user) return null;
    
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };
  
  // Function to check if user is validated
  const isUserValidated = () => {
    return !!userProfile?.isValidated;
  };
  
  // Function to check if user has a specific role
  const hasRole = (role: UserRole) => {
    return !!userProfile?.roles?.includes(role);
  };

  // Subscribe to auth state changes when the component mounts
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? `User ID: ${currentUser.uid}` : 'No user');
      setUser(currentUser);
      
      // Fetch user profile from Firestore if user is logged in
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          
          // If no profile exists, create one
          if (!profile) {
            const newProfile = await createOrUpdateUserProfile(currentUser.uid, {
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              isValidated: false,
              roles: [UserRole.USER]
            });
            setUserProfile(newProfile);
          } else {
            setUserProfile(profile);
          }
        } catch (err) {
          console.error('Error fetching user profile on auth state change:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setUserProfile(null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    user,
    userProfile,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    confirmReset,
    verifyResetCode,
    updateUserProfile,
    updateUserValidation,
    updateUserRoles,
    getUserData,
    isUserValidated,
    hasRole,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;