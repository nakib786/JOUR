import { cleanupExpiredTrashItems } from '@/lib/firebase/firestore';

/**
 * Automatically cleanup expired trash items
 * This function should be called periodically (e.g., daily) to maintain the 12-month retention policy
 */
export async function autoCleanupTrash(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    console.log('Starting automatic trash cleanup...');
    const deletedCount = await cleanupExpiredTrashItems();
    console.log(`Automatic trash cleanup completed. Deleted ${deletedCount} expired items.`);
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    console.error('Error during automatic trash cleanup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if trash cleanup should run based on last cleanup time
 * Returns true if cleanup should run (once per day)
 */
export function shouldRunCleanup(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lastCleanup = localStorage.getItem('lastTrashCleanup');
  if (!lastCleanup) return true;
  
  const lastCleanupTime = new Date(lastCleanup);
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return lastCleanupTime < oneDayAgo;
}

/**
 * Mark that cleanup has been performed
 */
export function markCleanupPerformed(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('lastTrashCleanup', new Date().toISOString());
}

/**
 * Run automatic cleanup if needed
 * This can be called on app startup or periodically
 */
export async function runAutoCleanupIfNeeded(): Promise<void> {
  if (!shouldRunCleanup()) {
    console.log('Trash cleanup not needed yet');
    return;
  }
  
  const result = await autoCleanupTrash();
  if (result.success) {
    markCleanupPerformed();
    if (result.deletedCount && result.deletedCount > 0) {
      console.log(`Auto-cleanup: ${result.deletedCount} expired items removed from trash`);
    }
  } else {
    console.error('Auto-cleanup failed:', result.error);
  }
} 