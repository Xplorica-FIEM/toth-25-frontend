/**
 * Background Sync Service
 * Syncs queued scans to backend when online
 */

import { getPendingScans, markScanSynced } from './riddleCache';

let syncInterval = null;
const SYNC_INTERVAL_MS = 30000; // 30 seconds

/**
 * Sync pending scans to backend
 */
async function syncPendingScans() {
  try {
    const pendingScans = await getPendingScans();
    
    if (pendingScans.length === 0) return;

    console.log(`🔄 Syncing ${pendingScans.length} pending scans...`);

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No auth token, skipping sync');
      return;
    }

    // Sync each scan
    for (const scan of pendingScans) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            riddleId: scan.riddleId,
            scannedAt: scan.scannedAt
          })
        });

        if (response.ok) {
          await markScanSynced(scan.queueId);
          console.log(`✅ Synced scan for riddle ${scan.riddleId}`);
        } else {
          console.warn(`⚠️ Failed to sync scan ${scan.queueId}:`, response.status);
        }
      } catch (error) {
        console.error(`❌ Error syncing scan ${scan.queueId}:`, error);
        // Continue with next scan
      }
    }

    console.log('🎉 Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

/**
 * Start background sync service
 */
export function startBackgroundSync() {
  if (syncInterval) return; // Already running

  console.log('🚀 Started background sync service');
  
  // Initial sync
  syncPendingScans();

  // Periodic sync
  syncInterval = setInterval(syncPendingScans, SYNC_INTERVAL_MS);

  // Sync on visibility change (when user returns to app)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        syncPendingScans();
      }
    });
  }

  // Sync on online event
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('📶 Network restored, syncing...');
      syncPendingScans();
    });
  }
}

/**
 * Stop background sync service
 */
export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('🛑 Stopped background sync service');
  }
}

/**
 * Trigger immediate sync
 */
export async function triggerSync() {
  await syncPendingScans();
}

export default {
  startBackgroundSync,
  stopBackgroundSync,
  triggerSync
};
