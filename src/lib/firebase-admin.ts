import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;

try {
  // Check if admin app is already initialized
  if (getApps().length === 0) {
    // Initialize with service account (for production) or default credentials (for development)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Production: Use service account key
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'journal-448a1',
      });
    } else {
      // Development: Use default credentials (works with Firebase CLI login)
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'journal-448a1',
      });
    }
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  throw new Error('Failed to initialize Firebase Admin SDK');
}

// Initialize Firestore with admin privileges
export const adminDb: Firestore = getFirestore(adminApp);

export default adminApp; 