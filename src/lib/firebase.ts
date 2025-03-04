// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Development fallback configuration (does not contain actual keys)
const fallbackConfig = {
  apiKey: "FIREBASE_API_KEY_NEEDED",
  authDomain: "transflow2-0.firebaseapp.com", 
  projectId: "transflow2-0",
  storageBucket: "transflow2-0.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase singleton
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firestoreDb: Firestore;
let firebaseStorage: FirebaseStorage;

/**
 * Initialize Firebase if it hasn't been initialized already
 * @returns Object containing Firebase instances
 */
function initializeFirebase() {
  try {
    // Check if Firebase has already been initialized
    if (!getApps().length) {
      // Always use environment variables in production
      // The fallback should never be used in production
      const config = firebaseConfig;
      
      // Log which configuration is being used (without sensitive values)
      console.log('Firebase config source:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Environment variables' : 'Missing env vars!');
      console.log('Firebase project ID:', config.projectId || 'undefined');
      
      // Initialize the Firebase app
      firebaseApp = initializeApp(config);
      console.log('Firebase initialized successfully');
    } else {
      firebaseApp = getApps()[0];
    }

    // Initialize Firebase services
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    return { 
      app: firebaseApp, 
      auth: firebaseAuth, 
      firestore: firestoreDb, 
      storage: firebaseStorage 
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase. Check your configuration.');
  }
}

// Export initialized Firebase services
export const { app, auth, firestore, storage } = initializeFirebase();

// Export a function to get Firebase instances
export function getFirebase() {
  return { app, auth, firestore, storage };
}