/**
 * IndexedDB Cache Manager for Treasure Hunt
 * Stores encrypted riddles for offline access and queues offline scans
 */

const DB_NAME = 'TreasureHuntCache';
const DB_VERSION = 1;
const RIDDLES_STORE = 'riddles';
const OFFLINE_SCANS_STORE = 'offlineScans';

/**
 * Initialize IndexedDB database
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create riddles store if it doesn't exist
      if (!db.objectStoreNames.contains(RIDDLES_STORE)) {
        const riddleStore = db.createObjectStore(RIDDLES_STORE, { keyPath: 'id' });
        riddleStore.createIndex('orderNumber', 'orderNumber', { unique: false });
      }
      
      // Create offline scans store if it doesn't exist
      if (!db.objectStoreNames.contains(OFFLINE_SCANS_STORE)) {
        const scanStore = db.createObjectStore(OFFLINE_SCANS_STORE, { keyPath: 'id', autoIncrement: true });
        scanStore.createIndex('riddleId', 'riddleId', { unique: false });
        scanStore.createIndex('scannedAt', 'scannedAt', { unique: false });
      }
    };
  });
}

/**
 * Store encrypted riddles in IndexedDB
 * @param {Array} riddles - Array of {id, encryptedData}
 */
export async function cacheRiddles(riddles) {
  try {
    const db = await initDB();
    const transaction = db.transaction([RIDDLES_STORE], 'readwrite');
    const store = transaction.objectStore(RIDDLES_STORE);
    
    // Clear existing riddles first
    await store.clear();
    
    // Store each riddle
    for (const riddle of riddles) {
      await store.put({
        id: riddle.id,
        encryptedData: riddle.encryptedData,
        cachedAt: new Date().toISOString()
      });
    }
    
    await transaction.complete;
    console.log(`✅ Cached ${riddles.length} riddles in IndexedDB`);
    
    return { success: true, count: riddles.length };
  } catch (error) {
    console.error('❌ Error caching riddles:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get encrypted riddle by id from cache
 * @param {string} riddleId - The riddle id (e.g., "R7GPKX")
 * @returns {Promise<object|null>} - {id, encryptedData, cachedAt} or null
 */
export async function getCachedRiddle(riddleId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([RIDDLES_STORE], 'readonly');
    const store = transaction.objectStore(RIDDLES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(riddleId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error getting cached riddle:', error);
    return null;
  }
}

/**
 * Get all cached riddles
 * @returns {Promise<Array>} - Array of cached riddles
 */
export async function getAllCachedRiddles() {
  try {
    const db = await initDB();
    const transaction = db.transaction([RIDDLES_STORE], 'readonly');
    const store = transaction.objectStore(RIDDLES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error getting all cached riddles:', error);
    return [];
  }
}

/**
 * Check if riddles are cached
 * @returns {Promise<boolean>}
 */
export async function isCachePopulated() {
  try {
    const riddles = await getAllCachedRiddles();
    return riddles.length > 0;
  } catch (error) {
    console.error('❌ Error checking cache:', error);
    return false;
  }
}

/**
 * Clear riddle cache
 */
export async function clearRiddleCache() {
  try {
    const db = await initDB();
    const transaction = db.transaction([RIDDLES_STORE], 'readwrite');
    const store = transaction.objectStore(RIDDLES_STORE);
    await store.clear();
    console.log('✅ Riddle cache cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Queue an offline scan
 * @param {string} riddleId - The riddle ID (UUID)
 * @param {string} scannedAt - ISO timestamp
 */
export async function queueOfflineScan(riddleId, scannedAt = new Date().toISOString()) {
  try {
    const db = await initDB();
    const transaction = db.transaction([OFFLINE_SCANS_STORE], 'readwrite');
    const store = transaction.objectStore(OFFLINE_SCANS_STORE);
    
    await store.add({
      riddleId,
      scannedAt,
      queuedAt: new Date().toISOString()
    });
    
    console.log(`📥 Queued offline scan for riddle ${riddleId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error queuing offline scan:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all offline scans from queue
 * @returns {Promise<Array>} - Array of {id, riddleId, scannedAt, queuedAt}
 */
export async function getOfflineScans() {
  try {
    const db = await initDB();
    const transaction = db.transaction([OFFLINE_SCANS_STORE], 'readonly');
    const store = transaction.objectStore(OFFLINE_SCANS_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error getting offline scans:', error);
    return [];
  }
}

/**
 * Clear offline scan queue
 */
export async function clearOfflineScans() {
  try {
    const db = await initDB();
    const transaction = db.transaction([OFFLINE_SCANS_STORE], 'readwrite');
    const store = transaction.objectStore(OFFLINE_SCANS_STORE);
    await store.clear();
    console.log('✅ Offline scan queue cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing offline scans:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete specific offline scan by ID
 * @param {number} id - The scan ID
 */
export async function deleteOfflineScan(id) {
  try {
    const db = await initDB();
    const transaction = db.transaction([OFFLINE_SCANS_STORE], 'readwrite');
    const store = transaction.objectStore(OFFLINE_SCANS_STORE);
    await store.delete(id);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting offline scan:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get count of offline scans in queue
 * @returns {Promise<number>}
 */
export async function getOfflineScansCount() {
  try {
    const scans = await getOfflineScans();
    return scans.length;
  } catch (error) {
    console.error('❌ Error getting offline scans count:', error);
    return 0;
  }
}

/**
 * Check if IndexedDB is supported
 * @returns {boolean}
 */
export function isIndexedDBSupported() {
  return 'indexedDB' in window;
}

export default {
  cacheRiddles,
  getCachedRiddle,
  getAllCachedRiddles,
  isCachePopulated,
  clearRiddleCache,
  queueOfflineScan,
  getOfflineScans,
  clearOfflineScans,
  deleteOfflineScan,
  getOfflineScansCount,
  isIndexedDBSupported
};
