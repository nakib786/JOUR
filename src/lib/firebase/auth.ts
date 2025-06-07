import {
  signOut,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { auth } from '../firebase';

// Auth functions

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

export async function resetPassword(email: string): Promise<void> {
  try {
    console.log('Attempting password reset for:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully');
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error sending password reset email:', {
      code: authError.code,
      message: authError.message
    });
    
    // Handle specific error cases
    if (authError.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (authError.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (authError.code === 'auth/too-many-requests') {
      throw new Error('Too many password reset requests. Please try again later.');
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