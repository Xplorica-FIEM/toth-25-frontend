/**
 * IndexedDB Riddle Cache with Encryption
 * Stores riddles encrypted using random session key
 * Enables offline-first gameplay
 */

import { getSessionKey } from './sessionKey';

const DB_NAME = 'TothRiddleCache';
const DB_VERSION = 1;
const STORE_NAME = 'riddles';
const SCAN_QUEUE_STORE = 'scanQueue';

/**
 * Open IndexedDB connection
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Riddles store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const riddleStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        riddleStore.createIndex('orderNumber', 'orderNumber', { unique: false });
      }

      // Scan queue store (for offline sync)
      if (!db.objectStoreNames.contains(SCAN_QUEUE_STORE)) {
        const scanStore = db.createObjectStore(SCAN_QUEUE_STORE, { keyPath: 'queueId', autoIncrement: true });
        scanStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Encrypt text using session key
 */
async function encryptText(plainText) {
  const sessionKey = getSessionKey();
  if (!sessionKey) throw new Error('No session key available');

  const keyBytes = new Uint8Array(sessionKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data
  );

  // Return format: IV:EncryptedData (hex)
  const ivHex = Array.from(iv, b => b.toString(16).padStart(2, '0')).join('');
  const encryptedHex = Array.from(new Uint8Array(encrypted), b => b.toString(16).padStart(2, '0')).join('');
  
  return `${ivHex}:${encryptedHex}`;
}

/**
 * Decrypt text using session key
 */
async function decryptText(encryptedData) {
  const sessionKey = getSessionKey();
  if (!sessionKey) throw new Error('No session key available');

  const [ivHex, encryptedHex] = encryptedData.split(':');
  
  const keyBytes = new Uint8Array(sessionKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );

  const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const encrypted = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Store riddles in IndexedDB (encrypted)
 */
export async function cacheRiddles(riddles) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear old riddles
    await store.clear();

    // Encrypt and store each riddle
    for (const riddle of riddles) {
      const encryptedPuzzleText = await encryptText(riddle.puzzleText);
      
      const cachedRiddle = {
        id: riddle.id,
        riddleName: riddle.riddleName,
        encryptedPuzzleText,
        orderNumber: riddle.orderNumber,
        isActive: riddle.isActive,
        cachedAt: Date.now()
      };

      await store.put(cachedRiddle);
    }

    console.log(`✅ Cached ${riddles.length} riddles (encrypted)`);
    return true;
  } catch (error) {
    console.error('❌ Failed to cache riddles:', error);
    return false;
  }
}

/**
 * Get riddle from cache by ID (decrypted)
 */
export async function getCachedRiddle(riddleId) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const cachedRiddle = await new Promise((resolve, reject) => {
      const request = store.get(riddleId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!cachedRiddle) return null;

    // Decrypt puzzle text
    const puzzleText = await decryptText(cachedRiddle.encryptedPuzzleText);

    return {
      id: cachedRiddle.id,
      riddleName: cachedRiddle.riddleName,
      puzzleText,
      orderNumber: cachedRiddle.orderNumber,
      isActive: cachedRiddle.isActive
    };
  } catch (error) {
    console.error('❌ Failed to get cached riddle:', error);
    return null;
  }
}

/**
 * Get all cached riddles (decrypted)
 */
export async function getAllCachedRiddles() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const cachedRiddles = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Decrypt all riddles
    const decryptedRiddles = await Promise.all(
      cachedRiddles.map(async (cached) => {
        const puzzleText = await decryptText(cached.encryptedPuzzleText);
        return {
          id: cached.id,
          riddleName: cached.riddleName,
          puzzleText,
          orderNumber: cached.orderNumber,
          isActive: cached.isActive
        };
      })
    );

    return decryptedRiddles;
  } catch (error) {
    console.error('❌ Failed to get all cached riddles:', error);
    return [];
  }
}

/**
 * Queue scan event for background sync
 */
export async function queueScan(riddleId, scannedAt = new Date().toISOString()) {
  try {
    const db = await openDB();
    const transaction = db.transaction([SCAN_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SCAN_QUEUE_STORE);

    const scanEvent = {
      riddleId,
      scannedAt,
      timestamp: Date.now(),
      synced: false
    };

    await store.add(scanEvent);
    console.log(`📥 Queued scan for riddle ${riddleId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to queue scan:', error);
    return false;
  }
}

/**
 * Get pending scans (not synced to backend)
 */
export async function getPendingScans() {
  try {
    const db = await openDB();
    const transaction = db.transaction([SCAN_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(SCAN_QUEUE_STORE);

    const allScans = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return allScans.filter(scan => !scan.synced);
  } catch (error) {
    console.error('❌ Failed to get pending scans:', error);
    return [];
  }
}

/**
 * Mark scan as synced
 */
export async function markScanSynced(queueId) {
  try {
    const db = await openDB();
    const transaction = db.transaction([SCAN_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SCAN_QUEUE_STORE);

    const scan = await store.get(queueId);
    if (scan) {
      scan.synced = true;
      scan.syncedAt = Date.now();
      await store.put(scan);
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to mark scan as synced:', error);
    return false;
  }
}

/**
 * Clear all cache (on logout)
 */
export async function clearCache() {
  try {
    const db = await openDB();
    
    const riddleTransaction = db.transaction([STORE_NAME], 'readwrite');
    await riddleTransaction.objectStore(STORE_NAME).clear();

    const scanTransaction = db.transaction([SCAN_QUEUE_STORE], 'readwrite');
    await scanTransaction.objectStore(SCAN_QUEUE_STORE).clear();

    console.log('🗑️ Cleared riddle cache');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    return false;
  }
}

/**
 * Check if cache is populated
 */
export async function isCachePopulated() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const count = await new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return count > 0;
  } catch (error) {
    return false;
  }
}

export default {
  cacheRiddles,
  getCachedRiddle,
  getAllCachedRiddles,
  queueScan,
  getPendingScans,
  markScanSynced,
  clearCache,
  isCachePopulated
};
