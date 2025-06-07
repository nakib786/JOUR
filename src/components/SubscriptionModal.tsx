'use client';

import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email first
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <Mail className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Subscribe to Newsletter
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified about new stories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              required
              disabled={isLoading}
            />
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || status === 'success'}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Subscribed!</span>
              </>
            ) : (
              <span>Subscribe to Newsletter</span>
            )}
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </div>
  );
} 