// src/lib/services/projectService.ts
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  orderBy,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  FirestoreError,
  writeBatch
} from 'firebase/firestore';
import { executeBatch } from '../firebase/batchOperations';
import { firestore } from '../firebase';
import { 
  Project, 
  ProjectFormData, 
  ProjectPhase, 
  PhaseStatus, 
  ErrorResponse, 
  ProjectPhases,
  Video,
  VideoFormData,
  StoredProject,
  ProjectUpdate,
  VideoUpdate
} from '../types';
import { handleError as globalHandleError } from '../errors/errorTypes';
import { FieldValue } from 'firebase/firestore';
import { PHASE_SEQUENCE } from '../constants';

const PROJECTS_COLLECTION = 'projects';
const VIDEOS_COLLECTION = 'videos';

/**
 * Converts Firestore document to Project object with proper typing
 */
const convertToProject = (doc: DocumentSnapshot | QueryDocumentSnapshot): Project => {
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is empty');
  }
  
  // Add missing fields with defaults
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    // Ensure these fields exist with defaults if missing
    owner: data.owner || data.createdBy,
    assignees: data.assignees || [data.createdBy],
    // Initialize empty phase assignments if missing
    phaseAssignments: data.phaseAssignments || {}
  } as Project;
};

/**
 * Converts Firestore document to Video object with proper typing
 */
const convertToVideo = (doc: DocumentSnapshot | QueryDocumentSnapshot): Video => {
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is empty');
  }
  
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  } as Video;
};

/**
 * Creates a standardized error response
 * @deprecated Use handleError from errorTypes.ts instead
 */
const createErrorResponse = (error: unknown, defaultMessage = 'An error occurred'): ErrorResponse => {
  const appError = globalHandleError(error);
  
  return {
    message: appError.message || defaultMessage,
    code: appError.code,
    details: appError.originalError
  };
};

/**
 * Creates default phases object with all phases set to NOT_STARTED
 */
const createDefaultPhases = (): ProjectPhases => {
  return PHASE_SEQUENCE.reduce((phases, phase) => {
    phases[phase] = PhaseStatus.NOT_STARTED;
    return phases;
  }, {} as ProjectPhases);
};

// -------------------------------
// Project CRUD Operations
// -------------------------------

/**
 * Creates a new project
 */
export const createProject = async (projectData: ProjectFormData, userId: string): Promise<Project> => {
  try {
    // Initialize project with default values for phases
    const newProject: Omit<Project, 'id'> = {
      ...projectData,
      // Convert single targetLanguage to array for backward compatibility
      targetLanguages: projectData.targetLanguage ? [projectData.targetLanguage] : [],
      createdBy: userId,
      owner: userId,
      assignees: [userId], // Keep for backward compatibility
      phaseAssignments: {}, // Empty phase assignments - no initial assignments
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      currentPhase: ProjectPhase.SUBTITLE_TRANSLATION,
      phases: createDefaultPhases()
    };

    const docRef = await addDoc(collection(firestore, PROJECTS_COLLECTION), newProject);
    
    // For better performance, construct the project directly instead of fetching it again
    return {
      ...newProject,
      id: docRef.id,
      // Convert server timestamps to Date objects for client use
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating project:', error);
    const errorResponse = createErrorResponse(error, 'Failed to create project');
    throw errorResponse;
  }
};

/**
 * Gets a project by ID
 */
export const getProject = async (projectId: string): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    return convertToProject(docSnap);
  } catch (error) {
    console.error('Error fetching project:', error);
    const errorResponse = createErrorResponse(error, `Failed to fetch project with ID ${projectId}`);
    throw errorResponse;
  }
};

/**
 * Gets all projects for a user
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  if (!userId) {
    console.error('getUserProjects called with empty userId');
    throw new Error('User ID is required to fetch projects');
  }

  try {
    console.log(`Querying Firestore for projects for user ID=${userId}`);
    
    // Simplified approach - just look for createdBy since that's what we know exists
    const q = query(
      collection(firestore, PROJECTS_COLLECTION),
      where('createdBy', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Got ${querySnapshot.size} projects from Firestore`);
    
    const projects: Project[] = [];
    
    // Process each document and add owner/assignees if missing
    querySnapshot.docs.forEach(doc => {
      try {
        const data = doc.data();
        console.log(`Processing project: ${doc.id}`, data);
        
        // Fix missing fields in the data
        const project = {
          ...data,
          id: doc.id,
          // Convert timestamps
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          // Add missing fields with defaults if not present
          owner: data.owner || data.createdBy,
          assignees: data.assignees || [data.createdBy],
          phaseAssignments: data.phaseAssignments || {}
        } as Project;
        
        projects.push(project);
        
        // If fields are missing in the database, update them
        if (!data.owner || !data.assignees || !data.phaseAssignments) {
          const projectRef = doc.ref;
          const updates: Record<string, any> = {};
          
          if (!data.owner) {
            updates.owner = data.createdBy;
          }
          
          if (!data.assignees) {
            updates.assignees = [data.createdBy];
          }
          
          if (!data.phaseAssignments) {
            updates.phaseAssignments = {};
          }
          
          // Update the document with the missing fields
          if (Object.keys(updates).length > 0) {
            console.log(`Updating project ${doc.id} with missing fields:`, updates);
            updateDoc(projectRef, updates)
              .then(() => console.log(`Updated project ${doc.id} with missing fields`))
              .catch(err => console.error(`Failed to update project ${doc.id}:`, err));
          }
        }
      } catch (err) {
        console.error(`Error processing project ${doc.id}:`, err);
      }
    });
    
    // Sort by updatedAt in descending order
    projects.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date();
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date();
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Returning ${projects.length} projects in total`);
    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    const errorResponse = createErrorResponse(error, 'Failed to fetch user projects');
    throw errorResponse;
  }
};

/**
 * Gets all projects assigned to a user in any phase
 */
export const getAssignedProjects = async (userId: string): Promise<Project[]> => {
  if (!userId) {
    console.error('getAssignedProjects called with empty userId');
    throw new Error('User ID is required to fetch assigned projects');
  }

  try {
    console.log(`Querying Firestore for projects assigned to user ID=${userId}`);
    
    // Get all projects - we'll filter client-side
    // This is not efficient but Firestore doesn't support querying nested fields easily
    const projectsSnapshot = await getDocs(collection(firestore, PROJECTS_COLLECTION));
    
    const assignedProjects: Project[] = [];
    
    // Process each document and check if the user is assigned to any phase
    projectsSnapshot.docs.forEach(doc => {
      try {
        const data = doc.data();
        const project = convertToProject(doc);
        
        // Check if the user is assigned to any phase
        if (project.phaseAssignments) {
          const isAssigned = Object.values(project.phaseAssignments).includes(userId);
          if (isAssigned) {
            assignedProjects.push(project);
          }
        }
      } catch (err) {
        console.error(`Error processing project ${doc.id}:`, err);
      }
    });
    
    // Sort by updatedAt in descending order
    assignedProjects.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date();
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date();
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Returning ${assignedProjects.length} assigned projects in total`);
    return assignedProjects;
  } catch (error) {
    console.error('Error fetching assigned projects:', error);
    const errorResponse = createErrorResponse(error, 'Failed to fetch assigned projects');
    throw errorResponse;
  }
};

/**
 * Updates an existing project
 */
export const updateProject = async (projectId: string, projectData: ProjectUpdate): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First get current project to validate it exists
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    // Ensure updatedAt is set
    const dataToUpdate: ProjectUpdate = {
      ...projectData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataToUpdate);
    
    // Combine current data with updates for better performance
    const currentData = convertToProject(currentDoc);
    
    // Create updated project with type safety
    const updatedProject: Project = {
      ...currentData,
      ...(projectData.name !== undefined && { name: projectData.name }),
      ...(projectData.description !== undefined && { description: projectData.description }),
      ...(projectData.sourceLanguage !== undefined && { sourceLanguage: projectData.sourceLanguage }),
      ...(projectData.targetLanguages !== undefined && { targetLanguages: projectData.targetLanguages }),
      ...(projectData.currentPhase !== undefined && { currentPhase: projectData.currentPhase }),
      ...(projectData.owner !== undefined && { owner: projectData.owner }),
      ...(projectData.assignees !== undefined && { assignees: projectData.assignees }),
      ...(projectData.phaseAssignments !== undefined && { phaseAssignments: projectData.phaseAssignments }),
      id: projectId,
      updatedAt: new Date()
    };
    
    // Update phases if needed
    Object.entries(projectData).forEach(([key, value]) => {
      if (key.startsWith('phases.')) {
        const phase = key.split('.')[1] as ProjectPhase;
        updatedProject.phases[phase] = value as PhaseStatus;
      } else if (key.startsWith('phaseAssignments.')) {
        const phase = key.split('.')[1] as ProjectPhase;
        if (!updatedProject.phaseAssignments) {
          updatedProject.phaseAssignments = {};
        }
        updatedProject.phaseAssignments[phase] = value as string;
      }
    });
    
    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    const errorResponse = createErrorResponse(error, `Failed to update project with ID ${projectId}`);
    throw errorResponse;
  }
};

/**
 * Updates the phase status of a project
 */
export const updateProjectPhaseStatus = async (
  projectId: string, 
  phase: ProjectPhase, 
  status: PhaseStatus
): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First get current project to validate it exists
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const currentProject = convertToProject(currentDoc);
    
    // Create a strongly-typed update object
    const updateData: ProjectUpdate = {
      [`phases.${phase}`]: status,
      updatedAt: serverTimestamp()
    };
    
    // If starting a new phase, update the current phase
    if (status === PhaseStatus.IN_PROGRESS) {
      updateData.currentPhase = phase;
    }
    
    await updateDoc(docRef, updateData);
    
    // Create new project object with updated phases
    const updatedPhases = { ...currentProject.phases };
    updatedPhases[phase] = status;
    
    // Return updated project
    return {
      ...currentProject,
      phases: updatedPhases,
      ...(status === PhaseStatus.IN_PROGRESS ? { currentPhase: phase } : {}),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating project phase:', error);
    // Use our new error handling
    const appError = globalHandleError(error);
    const errorResponse = createErrorResponse(
      error, 
      `Failed to update phase status for project with ID ${projectId}`
    );
    throw errorResponse;
  }
};

/**
 * Assigns a user to a specific project phase
 */
export const assignUserToPhase = async (
  projectId: string,
  phase: ProjectPhase,
  userId: string | null // null to unassign
): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First get current project to validate it exists
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const currentProject = convertToProject(currentDoc);
    
    // Create a strongly-typed update object
    const updateData: ProjectUpdate = {
      [`phaseAssignments.${phase}`]: userId || null,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    
    // Create updated phase assignments
    const updatedPhaseAssignments = { 
      ...(currentProject.phaseAssignments || {})
    };
    
    if (userId) {
      updatedPhaseAssignments[phase] = userId;
    } else {
      // If userId is null, remove the assignment
      delete updatedPhaseAssignments[phase];
    }
    
    // Return updated project
    return {
      ...currentProject,
      phaseAssignments: updatedPhaseAssignments,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error assigning user to phase:', error);
    const errorResponse = createErrorResponse(
      error, 
      `Failed to assign user to phase for project with ID ${projectId}`
    );
    throw errorResponse;
  }
};

/**
 * Deletes a project and all associated data
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First check if the project exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Get all videos for this project
    const videos = await getProjectVideos(projectId);
    
    // Prepare batch operations for all deletions
    const operations = [
      // Delete the project document
      { type: 'delete', ref: docRef }
    ];
    
    // Add all video deletions to the batch
    videos.forEach(video => {
      const videoRef = doc(firestore, PROJECTS_COLLECTION, projectId, VIDEOS_COLLECTION, video.id as string);
      operations.push({ type: 'delete', ref: videoRef });
    });
    
    // Execute all deletions in batches
    await executeBatch(operations);
    
    console.log(`Successfully deleted project ${projectId} with ${videos.length} videos`);
  } catch (error) {
    console.error('Error deleting project:', error);
    // Use our improved error handling
    const appError = globalHandleError(error);
    const errorResponse = createErrorResponse(
      error, 
      `Failed to delete project with ID ${projectId}`
    );
    throw errorResponse;
  }
};

// -------------------------------
// Video CRUD Operations
// -------------------------------

/**
 * Creates a new video for a project
 */
export const createVideo = async (projectId: string, videoData: VideoFormData, userId: string): Promise<Video> => {
  try {
    // First check if the project exists
    await getProject(projectId);
    
    // Initialize the video with default values
    const newVideo: Omit<Video, 'id'> = {
      ...videoData,
      projectId,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending'
    };
    
    // Create the subcollection path
    const videosCollectionRef = collection(firestore, PROJECTS_COLLECTION, projectId, VIDEOS_COLLECTION);
    const docRef = await addDoc(videosCollectionRef, newVideo);
    
    // Return the created video with an ID
    return {
      ...newVideo,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating video:', error);
    const errorResponse = createErrorResponse(error, 'Failed to create video');
    throw errorResponse;
  }
};

/**
 * Gets a video by ID
 */
export const getVideo = async (projectId: string, videoId: string): Promise<Video> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId, VIDEOS_COLLECTION, videoId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Video with ID ${videoId} not found in project ${projectId}`);
    }
    
    return convertToVideo(docSnap);
  } catch (error) {
    console.error('Error fetching video:', error);
    const errorResponse = createErrorResponse(error, `Failed to fetch video with ID ${videoId}`);
    throw errorResponse;
  }
};

/**
 * Gets all videos for a project
 */
export const getProjectVideos = async (projectId: string): Promise<Video[]> => {
  try {
    // First check if the project exists
    await getProject(projectId);
    
    const videosCollectionRef = collection(firestore, PROJECTS_COLLECTION, projectId, VIDEOS_COLLECTION);
    const q = query(videosCollectionRef, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToVideo);
  } catch (error) {
    console.error('Error fetching project videos:', error);
    const errorResponse = createErrorResponse(error, `Failed to fetch videos for project with ID ${projectId}`);
    throw errorResponse;
  }
};

/**
 * Updates an existing video
 */
export const updateVideo = async (projectId: string, videoId: string, updateData: Partial<Video>): Promise<Video> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId, VIDEOS_COLLECTION, videoId);
    
    // First check if the video exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Video with ID ${videoId} not found in project ${projectId}`);
    }
    
    // Remove id and projectId from update data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, projectId: __, ...dataToUpdate } = updateData;
    
    // Add updatedAt timestamp
    const finalUpdateData = {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, finalUpdateData);
    
    // Return the updated video
    const currentVideo = convertToVideo(docSnap);
    return {
      ...currentVideo,
      ...dataToUpdate,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating video:', error);
    const errorResponse = createErrorResponse(error, `Failed to update video with ID ${videoId}`);
    throw errorResponse;
  }
};

/**
 * Updates the status of a video
 */
export const updateVideoStatus = async (projectId: string, videoId: string, status: string): Promise<Video> => {
  try {
    return await updateVideo(projectId, videoId, { status });
  } catch (error) {
    console.error('Error updating video status:', error);
    const errorResponse = createErrorResponse(error, `Failed to update status for video with ID ${videoId}`);
    throw errorResponse;
  }
};

/**
 * Deletes a video
 */
export const deleteVideo = async (projectId: string, videoId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId, VIDEOS_COLLECTION, videoId);
    
    // First check if the video exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Video with ID ${videoId} not found in project ${projectId}`);
    }
    
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting video:', error);
    const errorResponse = createErrorResponse(error, `Failed to delete video with ID ${videoId}`);
    throw errorResponse;
  }
};