// src/lib/constants.ts
import { ProjectPhase, PhaseStatus } from './types';

/**
 * Display labels for project phases
 */
export const PHASE_LABELS = {
  [ProjectPhase.SUBTITLE_TRANSLATION]: 'Subtitle Translation',
  [ProjectPhase.TRANSLATION_PROOFREADING]: 'Translation Proofreading',
  [ProjectPhase.AUDIO_PRODUCTION]: 'Audio Production',
  [ProjectPhase.AUDIO_REVIEW]: 'Audio Review',
};

/**
 * Descriptions for project phases
 */
export const PHASE_DESCRIPTIONS = {
  [ProjectPhase.SUBTITLE_TRANSLATION]: 'Translate subtitles from source language to target languages',
  [ProjectPhase.TRANSLATION_PROOFREADING]: 'Review and finalize translations',
  [ProjectPhase.AUDIO_PRODUCTION]: 'Record audio for the translated content',
  [ProjectPhase.AUDIO_REVIEW]: 'Review audio recordings and finalize',
};

/**
 * Color classes for each phase status
 */
export const STATUS_COLORS = {
  [PhaseStatus.NOT_STARTED]: 'bg-gray-200 text-gray-500',
  [PhaseStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-500',
  [PhaseStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-500',
};

/**
 * Background color classes for each phase status (for cards and indicators)
 */
export const STATUS_BG_COLORS = {
  [PhaseStatus.NOT_STARTED]: 'bg-gray-200',
  [PhaseStatus.IN_PROGRESS]: 'bg-blue-200',
  [PhaseStatus.COMPLETED]: 'bg-green-200',
};

/**
 * Status text labels
 */
export const STATUS_LABELS = {
  [PhaseStatus.NOT_STARTED]: 'Not Started',
  [PhaseStatus.IN_PROGRESS]: 'In Progress',
  [PhaseStatus.COMPLETED]: 'Completed',
};

/**
 * Canonical phase sequence
 */
export const PHASE_SEQUENCE = [
  ProjectPhase.SUBTITLE_TRANSLATION,
  ProjectPhase.TRANSLATION_PROOFREADING,
  ProjectPhase.AUDIO_PRODUCTION,
  ProjectPhase.AUDIO_REVIEW,
] as const;

/**
 * Next phase mapping
 */
export const NEXT_PHASE: Partial<Record<ProjectPhase, ProjectPhase>> = {
  [ProjectPhase.SUBTITLE_TRANSLATION]: ProjectPhase.TRANSLATION_PROOFREADING,
  [ProjectPhase.TRANSLATION_PROOFREADING]: ProjectPhase.AUDIO_PRODUCTION,
  [ProjectPhase.AUDIO_PRODUCTION]: ProjectPhase.AUDIO_REVIEW,
};

/**
 * Format date for display
 */
export const formatDate = (date: unknown): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  if (typeof date === 'number' && !isNaN(date)) {
    return new Date(date).toLocaleDateString();
  }
  return 'Unknown date';
};

/**
 * Calculate project overall progress based on completed phases
 */
export const calculateProjectProgress = (phases: Record<ProjectPhase, PhaseStatus>): number => {
  const totalPhases = Object.keys(phases).length;
  const completedPhases = Object.values(phases).filter(status => status === PhaseStatus.COMPLETED).length;
  return totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
};