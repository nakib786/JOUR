'use client';

import { useEffect } from 'react';
import { runAutoCleanupIfNeeded } from '@/lib/utils/trashCleanup';

export default function AutoCleanup() {
  useEffect(() => {
    // Run automatic cleanup when the app loads
    const performCleanup = async () => {
      try {
        await runAutoCleanupIfNeeded();
      } catch (error) {
        console.error('Failed to run automatic cleanup:', error);
      }
    };

    performCleanup();
  }, []);

  // This component doesn't render anything
  return null;
} 