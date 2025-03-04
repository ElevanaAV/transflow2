// src/lib/services/userService.ts
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { firestore } from '../firebase';
import {
  UserProfile,
  UserProfileUpdate,
  UserRole
} from '../types';
import { handleError } from '../errors/errorTypes';

const USERS_COLLECTION = 'users';

/**
 * Converts Firestore document to UserProfile object
 */
const convertToUserProfile = (doc: DocumentSnapshot | QueryDocumentSnapshot): UserProfile => {
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is empty');
  }
  
  // Get email or create a default
  const email = data.email || '';
  
  // Format email for display if needed (remove domain part for cleaner UI)
  const emailForDisplay = email.split('@')[0] || '';
  
  return {
    uid: doc.id,
    email: email,
    // Prefer displayName, then email username part, then fallback to uid
    displayName: data.displayName || emailForDisplay || doc.id.substring(0, 8),
    photoURL: data.photoURL || null,
    isValidated: data.isValidated === true, // Ensure boolean
    roles: Array.isArray(data.roles) ? data.roles : [UserRole.USER],
    bio: data.bio || null,
    skills: Array.isArray(data.skills) ? data.skills : [],
    languages: Array.isArray(data.languages) ? data.languages : [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
  } as UserProfile;
};

/**
 * Creates or updates a user profile
 */
export const createOrUpdateUserProfile = async (
  uid: string,
  userData: UserProfileUpdate & { email: string }
): Promise<UserProfile> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      const updateData: UserProfileUpdate = {
        ...userData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      // Return updated user
      const updatedDoc = await getDoc(userRef);
      return convertToUserProfile(updatedDoc);
    } else {
      // Create new user profile
      const newUserProfile: UserProfile = {
        uid,
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        isValidated: userData.isValidated || false,
        roles: userData.roles || [UserRole.USER],
        bio: userData.bio || null,
        skills: userData.skills || [],
        languages: userData.languages || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, newUserProfile);
      
      return {
        ...newUserProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw handleError(error);
  }
};

/**
 * Gets a user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return convertToUserProfile(userDoc);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw handleError(error);
  }
};

/**
 * Sets a user's validation status
 */
export const setUserValidationStatus = async (
  uid: string,
  isValidated: boolean
): Promise<UserProfile> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${uid} not found`);
    }
    
    const updateData: UserProfileUpdate = {
      isValidated,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    // Return updated user
    const updatedDoc = await getDoc(userRef);
    return convertToUserProfile(updatedDoc);
  } catch (error) {
    console.error('Error updating user validation status:', error);
    throw handleError(error);
  }
};

/**
 * Gets all validated users
 */
/**
 * Gets all users that can be assigned to projects
 * 
 * NOTE: We removed the 'isValidated' filter and composite index requirement
 * to ensure compatibility across all environments.
 */
export const getValidatedUsers = async (): Promise<UserProfile[]> => {
  try {
    // Get all users without filtering by validation status
    const allUsersQuery = query(
      collection(firestore, USERS_COLLECTION)
    );
    
    const allUsersSnapshot = await getDocs(allUsersQuery);
    
    // Map all users to UserProfile objects
    const allUsers = allUsersSnapshot.docs.map(convertToUserProfile);
    
    // Sort by displayName
    allUsers.sort((a, b) => {
      // Handle missing displayNames
      const nameA = a.displayName || a.email || '';
      const nameB = b.displayName || b.email || '';
      return nameA.localeCompare(nameB);
    });
    
    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw handleError(error);
  }
};

/**
 * Gets users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<UserProfile[]> => {
  try {
    const usersQuery = query(
      collection(firestore, USERS_COLLECTION),
      where('roles', 'array-contains', role),
      where('isValidated', '==', true),
      orderBy('displayName')
    );
    
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(convertToUserProfile);
  } catch (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    throw handleError(error);
  }
};

/**
 * Gets all team members (users with roles beyond USER)
 */
export const getTeamMembers = async (): Promise<UserProfile[]> => {
  try {
    // We can't directly query for "roles not equal to [USER]" in Firestore
    // So we fetch all validated users and filter client-side
    const validatedUsers = await getValidatedUsers();
    
    return validatedUsers.filter(user => {
      // Users with more than one role or a role other than USER
      return user.roles.length > 1 || 
        (user.roles.length === 1 && user.roles[0] !== UserRole.USER);
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw handleError(error);
  }
};

/**
 * Gets users filtered by one or more roles
 */
export const getUsersByRoles = async (roles: UserRole[]): Promise<UserProfile[]> => {
  try {
    // We need to fetch all users and filter manually since Firestore
    // doesn't support OR queries with array-contains easily
    const validatedUsers = await getValidatedUsers();
    
    // If no roles specified, return all validated users
    if (!roles.length) {
      return validatedUsers;
    }
    
    // Filter users who have at least one of the specified roles
    return validatedUsers.filter(user => 
      user.roles.some(role => roles.includes(role))
    );
  } catch (error) {
    console.error(`Error fetching users with roles ${roles.join(', ')}:`, error);
    throw handleError(error);
  }
};

/**
 * Gets users eligible for assignment to a specific project phase
 */
export const getUsersForPhaseAssignment = async (phase: string): Promise<UserProfile[]> => {
  try {
    // Map phases to required roles
    const roleMap: Record<string, UserRole[]> = {
      subtitle_translation: [UserRole.TRANSLATOR],
      translation_proofreading: [UserRole.REVIEWER],
      audio_production: [UserRole.AUDIO_PRODUCER],
      audio_review: [UserRole.REVIEWER]
    };
    
    // Get required roles for the phase
    const requiredRoles = roleMap[phase] || [UserRole.ADMIN];
    
    // Get users with the required roles
    return await getUsersByRoles(requiredRoles);
  } catch (error) {
    console.error(`Error fetching users for phase ${phase}:`, error);
    throw handleError(error);
  }
};

/**
 * Checks if any admin users exist in the system
 */
export const adminExists = async (): Promise<boolean> => {
  try {
    const usersQuery = query(
      collection(firestore, USERS_COLLECTION),
      where('roles', 'array-contains', UserRole.ADMIN),
      limit(1)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if admin exists:', error);
    throw handleError(error);
  }
};

/**
 * Promotes a user to admin role
 * This should only be used for initial setup or by existing admins
 */
export const promoteToAdmin = async (userId: string): Promise<UserProfile> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const userData = userDoc.data();
    const currentRoles = userData.roles || [UserRole.USER];
    
    // Only add ADMIN role if it doesn't already exist
    if (!currentRoles.includes(UserRole.ADMIN)) {
      const updatedRoles = [...currentRoles, UserRole.ADMIN];
      
      await updateDoc(userRef, {
        roles: updatedRoles,
        isValidated: true, // Automatically validate admin users
        updatedAt: serverTimestamp()
      });
    }
    
    // Get updated user profile
    const updatedDoc = await getDoc(userRef);
    return convertToUserProfile(updatedDoc);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw handleError(error);
  }
};