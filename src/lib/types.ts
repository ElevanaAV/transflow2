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
  assignees: string[];
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
  assignees?: string[];
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