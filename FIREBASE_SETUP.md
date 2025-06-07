# Firebase Setup Guide

## Issues Identified

Your application is experiencing authentication and Firestore data fetching issues. Here's how to fix them:

## 1. Firestore Security Rules

Your Firestore database likely has restrictive security rules. Update your Firestore rules in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `journal-448a1`
3. Go to Firestore Database → Rules
4. Replace the rules with the content from `firestore.rules` file in your project root

## 2. Authentication Setup

### Enable Authentication Methods:
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
4. Add your domain to authorized domains if needed

### Create Test User:
1. Go to Authentication → Users
2. Add a new user with email and password
3. Use this for testing email authentication

## 3. Environment Variables (Optional)

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAzReYPL__y0cbwbNPUmPQly6Nb85ATfDw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=journal-448a1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=journal-448a1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=journal-448a1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1089498342346
NEXT_PUBLIC_FIREBASE_APP_ID=1:1089498342346:web:7c9b8f8cab9ff559b1a533
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-Q3FZCPF6ZM
```

## 4. Testing

1. Start your development server: `npm run dev`
2. Visit `/debug` to test Firebase connectivity
3. Try authentication and data operations

## 5. Common Issues & Solutions

### "Permission Denied" Errors:
- Check Firestore security rules
- Ensure user is authenticated for write operations
- Verify project ID matches

### Authentication Popup Blocked:
- Allow popups in browser
- Try email authentication instead

### No Data Fetching:
- Check browser console for errors
- Verify Firestore rules allow read access
- Check if collections exist in Firestore

### Admin Access Issues:
- Update admin emails in `src/lib/firebase/auth.ts`
- Replace `'nakib@example.com'` with your actual email
- Remove the temporary `user.email` line after testing

## 6. Adding Sample Data

If your Firestore is empty, you can:
1. Use the admin panel to create posts
2. Import sample data through Firebase Console
3. Use the debug page to create test posts

## 7. Production Considerations

Before deploying:
1. Remove permissive Firestore rules
2. Remove debug logging
3. Set proper admin email addresses
4. Use environment variables for sensitive data

## Debug Page

Visit `http://localhost:3000/debug` to:
- Test Firebase connection
- Try authentication methods
- Test Firestore read/write operations
- View detailed error messages

This page will help identify the specific issues with your setup. 