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
  FirestoreError
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { 
  Project, 
  ProjectFormData, 
  ProjectPhase, 
  PhaseStatus, 
  ErrorResponse, 
  ProjectPhases,
  Video,
  VideoFormData
} from '../types';
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
  
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
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
 */
const createErrorResponse = (error: unknown, defaultMessage = 'An error occurred'): ErrorResponse => {
  if (error instanceof FirestoreError) {
    return {
      message: error.message,
      code: error.code,
      details: error
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error
    };
  }
  
  return {
    message: defaultMessage,
    details: error
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
      createdBy: userId,
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
  try {
    const q = query(
      collection(firestore, PROJECTS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToProject);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    const errorResponse = createErrorResponse(error, 'Failed to fetch user projects');
    throw errorResponse;
  }
};

/**
 * Updates an existing project
 */
export const updateProject = async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First get current project to validate it exists
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    // Remove id from update data and add updatedAt timestamp
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = projectData;
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataToUpdate);
    
    // Combine current data with updates for better performance
    const currentData = convertToProject(currentDoc);
    return {
      ...currentData,
      ...updateData,
      id: projectId,
      updatedAt: new Date()
    };
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
    
    const updateData: Record<string, PhaseStatus | ProjectPhase | FieldValue> = {
      [`phases.${phase}`]: status,
      updatedAt: serverTimestamp()
    };
    
    // If starting a new phase, update the current phase
    if (status === PhaseStatus.IN_PROGRESS) {
      updateData.currentPhase = phase;
    }
    
    await updateDoc(docRef, updateData);
    
    // Combine current data with updates for better performance
    return {
      ...currentProject,
      phases: {
        ...currentProject.phases,
        [phase]: status
      },
      ...(status === PhaseStatus.IN_PROGRESS ? { currentPhase: phase } : {}),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating project phase:', error);
    const errorResponse = createErrorResponse(error, `Failed to update phase status for project with ID ${projectId}`);
    throw errorResponse;
  }
};

/**
 * Deletes a project
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First check if the project exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Get all videos for this project and delete them first
    const videos = await getProjectVideos(projectId);
    const deletePromises = videos.map(video => deleteVideo(projectId, video.id));
    await Promise.all(deletePromises);
    
    // Then delete the project
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    const errorResponse = createErrorResponse(error, `Failed to delete project with ID ${projectId}`);
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