// src/lib/runtime-config.ts
/**
 * This module contains runtime configuration that helps with asset loading and host validation
 */

// Get the base URL from environment or use a fallback
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the current window location
    return window.location.origin;
  }
  
  // Server-side: use the PUBLIC_URL environment variable or fallback to the production URL
  return process.env.NEXT_PUBLIC_APP_URL || 'https://transflow2-0.web.app';
};

// Get asset prefix for static resources
export const getAssetPrefix = () => {
  return process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
};

// Check if the current host is allowed
export const isAllowedHost = (host: string) => {
  if (!host) return true; // Handle undefined host
  
  const allowedHosts = [
    'transflow2-0.web.app',
    'transflow2-0.firebaseapp.com',
    'ssrtransflow2-0-25djctqurq-ue.a.run.app', // Cloud Function URL
    'firebasestorage.googleapis.com',
    'localhost',
    '127.0.0.1'
  ];
  
  const result = allowedHosts.some(allowedHost => 
    host === allowedHost || 
    host.endsWith(`.${allowedHost}`) ||
    host.includes('localhost:') ||
    host.includes('firebaseapp.com') ||
    host.includes('transflow2-0') ||
    host.includes('a.run.app')
  );
  
  // Log for debugging
  if (!result && typeof window !== 'undefined') {
    console.debug(`Host validation failed for: ${host}`);
  }
  
  return result;
};

// Get full asset URL for static resources
export const getAssetUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  
  const baseUrl = getBaseUrl();
  const assetPrefix = getAssetPrefix();
  
  // Make sure path has a leading slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${assetPrefix}${normalizedPath}`;
};

// Get Firebase Storage URL
export const getStorageUrl = (path: string) => {
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'transflow2-0.appspot.com';
  
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(normalizedPath)}?alt=media`;
};