'use client';

import { useState, useRef } from 'react';
import { resetPassword } from '@/lib/firebase/auth';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { AuthTurnstile, type AuthTurnstileRef } from '@/components/AuthTurnstile';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<AuthTurnstileRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Turnstile token
    if (!turnstileToken) {
      setError('Please complete the security verification.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
      setEmail('');
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(errorMessage);
      // Reset Turnstile on error
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AnimatedLogo size="medium" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6">
              <p className="text-green-700 dark:text-green-300 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Turnstile Widget */}
            <div>
              <AuthTurnstile
                ref={turnstileRef}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null);
                  setError('Security verification failed. Please try again.');
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                  setError('Security verification expired. Please try again.');
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white rounded-lg px-4 py-2 hover:bg-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 