'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } from '@/lib/firebase/auth';
import { getPosts, createPost } from '@/lib/firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Post } from '@/types';

export default function DebugPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      addTestResult(`Auth state: ${user ? `Logged in as ${user.email}` : 'Not logged in'}`);
    });

    return () => unsubscribe();
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testFirebaseConnection = async () => {
    try {
      addTestResult('Testing Firebase connection...');
      addTestResult(`Auth instance: ${auth ? 'OK' : 'FAILED'}`);
      addTestResult(`Firestore instance: ${db ? 'OK' : 'FAILED'}`);
      addTestResult(`Project ID: ${db.app.options.projectId}`);
    } catch (error) {
      addTestResult(`Firebase connection error: ${error}`);
    }
  };

  const testFirestoreRead = async () => {
    try {
      addTestResult('Testing Firestore read...');
      
      // Test journal_entries collection
      addTestResult('Testing journal_entries collection...');
      const fetchedPosts = await getPosts({ limitCount: 5 });
      setPosts(fetchedPosts);
      addTestResult(`Successfully fetched ${fetchedPosts.length} posts from journal_entries`);
      
      if (fetchedPosts.length > 0) {
        const firstPost = fetchedPosts[0];
        addTestResult(`First post structure: ${JSON.stringify({
          id: firstPost.id,
          title: firstPost.title,
          hasContent: !!firstPost.content,
          tags: firstPost.tags,
          mood: firstPost.mood,
          createdAt: firstPost.createdAt
        }, null, 2)}`);
      }
    } catch (error) {
      addTestResult(`Firestore read error: ${error}`);
    }
  };

  const testFirestoreWrite = async () => {
    if (!user) {
      addTestResult('Cannot test write - user not authenticated');
      return;
    }

    try {
      addTestResult('Testing Firestore write...');
      const testPost = {
        title: 'Test Post',
        content: 'This is a test post created from the debug page.',
        tags: ['test', 'debug'],
        mood: 'hopeful' as const,
        date: new Date(),
        reactions: { like: 0, hug: 0, support: 0 }
      };
      
      const postId = await createPost(testPost);
      addTestResult(`Successfully created test post with ID: ${postId}`);
    } catch (error) {
      addTestResult(`Firestore write error: ${error}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      addTestResult('Attempting Google sign-in...');
      await signInWithGoogle();
      addTestResult('Google sign-in successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      addTestResult(`Google sign-in error: ${errorMessage}`);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      setError('');
      addTestResult(`Attempting email sign-in for: ${email}`);
      await signInWithEmail(email, password);
      addTestResult('Email sign-in successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      addTestResult(`Email sign-in error: ${errorMessage}`);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setError('');
      addTestResult(`Attempting email sign-up for: ${email}`);
      await signUpWithEmail(email, password);
      addTestResult('Email sign-up successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      addTestResult(`Email sign-up error: ${errorMessage}`);
    }
  };

  const handleLogout = async () => {
    try {
      addTestResult('Attempting logout...');
      await logout();
      addTestResult('Logout successful');
    } catch (error) {
      addTestResult(`Logout error: ${error}`);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Firebase Debug Page
        </h1>

        {/* Current Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
          <p><strong>UID:</strong> {user ? user.uid : 'N/A'}</p>
          <p><strong>Project ID:</strong> {db.app.options.projectId}</p>
        </div>

        {/* Test Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testFirebaseConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
            >
              Test Firebase Connection
            </button>
            <button
              onClick={testFirestoreRead}
              className="bg-green-500 text-white px-4 py-2 rounded mr-4"
            >
              Test Firestore Read
            </button>
            <button
              onClick={testFirestoreWrite}
              className="bg-purple-500 text-white px-4 py-2 rounded mr-4"
              disabled={!user}
            >
              Test Firestore Write
            </button>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!user ? (
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="bg-red-500 text-white px-4 py-2 rounded mr-4"
              >
                Sign in with Google
              </button>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Email Authentication</h3>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="border rounded px-3 py-2 w-full"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="border rounded px-3 py-2 w-full"
                  />
                  <div className="space-x-2">
                    <button
                      onClick={handleEmailSignIn}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleEmailSignUp}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          )}
        </div>

        {/* Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Posts ({posts.length})</h2>
          <div className="space-y-2">
            {posts.map((post, index) => (
              <div key={post.id || index} className="border-b pb-2">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-gray-600">{post.content?.substring(0, 100)}...</p>
                <p className="text-xs text-gray-500">Tags: {post.tags?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {result}
              </div>
            ))}
          </div>
          <button
            onClick={() => setTestResults([])}
            className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            Clear Results
          </button>
        </div>
      </div>
    </div>
  );
} 