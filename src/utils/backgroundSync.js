/**
 * Background Sync Service
 * Syncs queued scans to backend when online
 */

import { getPendingScans, markScanSynced, removeScanFromQueue } from './riddleCache';

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

    // Process in batches of 5
    const BATCH_SIZE = 5;
    for (let i = 0; i < pendingScans.length; i += BATCH_SIZE) {
      const batch = pendingScans.slice(i, i + BATCH_SIZE);
      
      try {
        const payload = {
          scans: batch.map(scan => ({
            riddleId: scan.riddleId,
            scannedAt: scan.scannedAt
          }))
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/scan/sync-offline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Synced batch of ${result.synced} scans`);
          
          // Remove synced records directly from queue to save space
          for (const scan of batch) {
            await removeScanFromQueue(scan.queueId);
          }
        } else {
          console.warn(`⚠️ Failed to sync batch starting with ${batch[0].riddleId}:`, response.status);
        }
      } catch (error) {
        console.error(`❌ Error syncing batch:`, error);
        // Continue with next batch
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
