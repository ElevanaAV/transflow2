// src/lib/types.ts
/**
 * Import FieldValue type for Firestore timestamps
 */
import { FieldValue } from 'firebase/firestore';

/**
 * Translation Project phases
 */
export enum ProjectPhase {
  SUBTITLE_TRANSLATION = 'subtitle_translation',
  TRANSLATION_PROOFREADING = 'translation_proofreading',
  AUDIO_PRODUCTION = 'audio_production',
  AUDIO_REVIEW = 'audio_review'
}

/**
 * Phase status types
 */
export enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * Video status types
 */
export type VideoStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Record of all phases and their statuses
 */
export type ProjectPhases = Record<ProjectPhase, PhaseStatus>;

/**
 * Phase assignment structure with single assignee per phase
 */
export type PhaseAssignments = {
  [key in ProjectPhase]?: string;
};

/**
 * Project model interface - base type without ID
 */
export interface ProjectBase {
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguages: string[];
  createdAt: Date | number | FieldValue;
  updatedAt: Date | number | FieldValue;
  createdBy: string;
  owner: string;
  phaseAssignments: PhaseAssignments;
  phases: ProjectPhases;
  currentPhase: ProjectPhase;
}

/**
 * Project with optional ID (for new projects)
 */
export interface Project extends Partial<ProjectBase> {
  id?: string;
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguages: string[];
  createdBy: string;
  phases: ProjectPhases;
  currentPhase: ProjectPhase;
  createdAt: Date | number | FieldValue;
  updatedAt: Date | number | FieldValue;
  // These fields might be missing in existing data
  owner?: string;
  // Legacy field - keeping for backward compatibility
  assignees?: string[];
  // New field for single assignee per phase
  phaseAssignments?: PhaseAssignments;
}

/**
 * Project with required ID (for stored projects)
 */
export interface StoredProject extends ProjectBase {
  id: string;
}

/**
 * Form data for project creation/update
 */
export interface ProjectFormData {
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguages: string[];
}

/**
 * Video base interface
 */
export interface VideoBase {
  projectId: string;
  title: string;
  description?: string;
  sourceFileName: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceFileContent?: string;
  translatedFileName?: string;
  translatedFileContent?: string;
  originalTranslatedContent?: string;
  videoUrl?: string;
  audioUrl?: string;
  status: VideoStatus;
  createdAt: Date | number | FieldValue;
  updatedAt: Date | number | FieldValue;
  createdBy: string;
}

/**
 * Video interface with optional ID
 */
export interface Video extends VideoBase {
  id?: string;
}

/**
 * Video interface with required ID (for stored videos)
 */
export interface StoredVideo extends VideoBase {
  id: string;
}

/**
 * Form data for video creation/update
 */
export interface VideoFormData {
  title: string;
  description?: string;
  sourceFileName: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceFileContent?: string;
  translatedFileName?: string;
  translatedFileContent?: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Project stats summary
 */
export interface ProjectStats {
  activeProjects: number;
  inTranslation: number;
  inProofreading: number;
  inAudioProduction: number;
  inAudioReview: number;
}

/**
 * Type for updates to a project
 */
export type ProjectUpdate = {
  name?: string;
  description?: string;
  sourceLanguage?: string;
  targetLanguages?: string[];
  currentPhase?: ProjectPhase;
  owner?: string;
  // Legacy field - keeping for backward compatibility
  assignees?: string[];
  // New field for single assignee per phase
  phaseAssignments?: PhaseAssignments;
  updatedAt?: Date | FieldValue;
} & {
  [K in `phases.${ProjectPhase}`]?: PhaseStatus;
} & {
  [K in `phaseAssignments.${ProjectPhase}`]?: string;
}

/**
 * Type for video updates
 */
export type VideoUpdate = {
  title?: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  status?: string;
  translatedFileContent?: string;
  updatedAt?: Date | FieldValue;
}

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  TRANSLATOR = 'translator', 
  REVIEWER = 'reviewer',
  AUDIO_PRODUCER = 'audio_producer',
  USER = 'user'
}

/**
 * Base interface for user profile information
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isValidated: boolean;
  roles: UserRole[];
  bio?: string;
  skills?: string[];
  languages?: string[];
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
}

/**
 * Type for user profile updates
 */
export type UserProfileUpdate = Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>> & {
  updatedAt?: Date | FieldValue;
}