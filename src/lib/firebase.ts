// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Official Firebase configuration from Firebase console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "transflow2-0.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "transflow2-0",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "transflow2-0.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize and export Firebase
function initializeFirebaseApp() {
  try {
    // Check if Firebase has already been initialized
    if (!getApps().length) {
      const app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
      
      // Initialize analytics if supported (browser-only)
      if (typeof window !== 'undefined') {
        isSupported().then(yes => yes && getAnalytics(app));
      }
      
      return app;
    } else {
      return getApps()[0];
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Using configuration:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket
    });
    
    // Rethrow the error to handle it at a higher level
    throw error;
  }
}

// Initialize Firebase app
const app = initializeFirebaseApp();

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Export initialized Firebase services
export { app, auth, firestore, storage };

// Export a function to get Firebase instances (for compatibility)
export function getFirebase() {
  return { app, auth, firestore, storage };
}