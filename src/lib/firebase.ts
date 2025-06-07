// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAzReYPL__y0cbwbNPUmPQly6Nb85ATfDw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "journal-448a1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "journal-448a1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "journal-448a1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1089498342346",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1089498342346:web:7c9b8f8cab9ff559b1a533",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Q3FZCPF6ZM"
};

// Initialize Firebase app (singleton pattern)
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// Initialize Firebase services
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics: Analytics | null = 
  typeof window !== 'undefined' ? getAnalytics(app) : null;

// For development: connect to emulators if running locally
// Emulator connections are commented out for production deployment
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.log('Emulators not connected:', error);
//   }
// }

export default app; 