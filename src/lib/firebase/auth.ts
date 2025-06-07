import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError
} from 'firebase/auth';
import { auth } from '../firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export async function signInWithGoogle(): Promise<User | null> {
  try {
    console.log('Attempting Google sign-in...');
    console.log('Auth domain:', auth.app.options.authDomain);
    console.log('Project ID:', auth.app.options.projectId);
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user.email);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error signing in with Google:', {
      code: authError.code,
      message: authError.message,
      customData: authError.customData,
      stack: authError.stack
    });
    
    // Handle specific error cases
    if (authError.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (authError.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by browser. Please allow popups and try again.');
    } else if (authError.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (authError.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google sign-in. Please check Firebase console settings.');
    } else if (authError.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled. Please enable it in Firebase console.');
    } else if (authError.code === 'auth/invalid-api-key') {
      throw new Error('Invalid API key. Please check your Firebase configuration.');
    }
    
    throw error;
  }
}

// Alternative method using redirect (useful if popup is blocked)
export async function signInWithGoogleRedirect(): Promise<void> {
  try {
    console.log('Attempting Google sign-in with redirect...');
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error with Google redirect sign-in:', authError);
    throw error;
  }
}

// Check for redirect result (call this on app initialization)
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Google redirect sign-in successful:', result.user.email);
      return result.user;
    }
    return null;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error with redirect result:', authError);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  try {
    console.log('Attempting email sign-in for:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email sign-in successful:', result.user.email);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error signing in with email:', {
      code: authError.code,
      message: authError.message
    });
    
    // Handle specific error cases
    if (authError.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (authError.code === 'auth/wrong-password') {
      throw new Error('Incorrect password.');
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (authError.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (authError.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  try {
    console.log('Attempting email sign-up for:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Email sign-up successful:', result.user.email);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error signing up with email:', {
      code: authError.code,
      message: authError.message
    });
    
    // Handle specific error cases
    if (authError.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists.');
    } else if (authError.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    console.log('Signing out...');
    await signOut(auth);
    console.log('Sign-out successful');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? `Signed in as ${user.email}` : 'Signed out');
    callback(user);
  });
}

// Admin check (you can customize this based on your admin logic)
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  
  // Add your admin email addresses here
  const adminEmails = [
    'admin@kahani-roz.com',
    'your-admin-email@gmail.com',
    // Add your actual email here for testing
    'nakib@example.com', // Replace with your actual email
    user.email // Temporarily allow any logged-in user for testing
  ];
  
  const isUserAdmin = adminEmails.includes(user.email || '');
  console.log('Admin check for', user.email, ':', isUserAdmin);
  return isUserAdmin;
}

export function getCurrentUser(): User | null {
  const user = auth.currentUser;
  console.log('Current user:', user ? user.email : 'None');
  return user;
} 