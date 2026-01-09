/**
 * localStorage Riddle Cache with Encryption
 * Stores riddles encrypted using random session key
 * Enables offline-first gameplay
 * Uses localStorage for maximum device compatibility
 */

import { getSessionKey } from './sessionKey';

// localStorage keys
const RIDDLES_CACHE_KEY = 'toth_riddles_cache';
const SCAN_QUEUE_KEY = 'toth_scan_queue';
const CACHE_META_KEY = 'toth_cache_meta';

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
 * Store riddles in localStorage (encrypted)
 */
export async function cacheRiddles(riddles) {
  try {
    // Validate riddles have puzzleText
    const invalidRiddles = riddles.filter(r => !r.puzzleText || r.puzzleText.trim() === '');
    if (invalidRiddles.length > 0) {
      console.error('⚠️ Found riddles without puzzleText:', invalidRiddles.map(r => r.riddleName));
      throw new Error(`${invalidRiddles.length} riddles have empty puzzleText`);
    }

    console.log(`🔐 Encrypting ${riddles.length} riddles...`);
    
    const encryptedRiddles = await Promise.all(
      riddles.map(async (riddle) => {
        const encryptedText = await encryptText(riddle.puzzleText);
        console.log(`  ✓ ${riddle.riddleName}: ${riddle.puzzleText.length} chars → ${encryptedText.length} encrypted chars`);
        
        return {
          id: riddle.id,
          riddleName: riddle.riddleName,
          encryptedPuzzleText: encryptedText,
          orderNumber: riddle.orderNumber,
          isActive: riddle.isActive,
          cachedAt: Date.now()
        };
      })
    );

    localStorage.setItem(RIDDLES_CACHE_KEY, JSON.stringify(encryptedRiddles));
    localStorage.setItem(CACHE_META_KEY, JSON.stringify({
      cachedAt: Date.now(),
      count: riddles.length
    }));

    console.log(`✅ Cached ${riddles.length} riddles (encrypted in localStorage)`);
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
    const cached = localStorage.getItem(RIDDLES_CACHE_KEY);
    if (!cached) {
      console.log('⚠️ No riddles in cache');
      return null;
    }

    const riddles = JSON.parse(cached);
    const cachedRiddle = riddles.find(r => r.id === riddleId);

    if (!cachedRiddle) {
      console.log('⚠️ Riddle not found in cache:', riddleId);
      return null;
    }

    console.log('🔐 Found encrypted riddle:', cachedRiddle.riddleName);
    console.log('🔐 Encrypted text length:', cachedRiddle.encryptedPuzzleText?.length);

    // Decrypt puzzle text
    let puzzleText = '';
    try {
      puzzleText = await decryptText(cachedRiddle.encryptedPuzzleText);
      console.log('✅ Decrypted text length:', puzzleText?.length);
    } catch (decryptError) {
      console.error('❌ Decryption failed:', decryptError);
      return null;
    }

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
    const cached = localStorage.getItem(RIDDLES_CACHE_KEY);
    if (!cached) return [];

    const cachedRiddles = JSON.parse(cached);

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
    const queue = getScanQueue();
    
    const scanEvent = {
      queueId: Date.now() + Math.random(), // Simple unique ID
      riddleId,
      scannedAt,
      timestamp: Date.now(),
      synced: false
    };

    queue.push(scanEvent);
    localStorage.setItem(SCAN_QUEUE_KEY, JSON.stringify(queue));
    
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
    const queue = getScanQueue();
    return queue.filter(scan => !scan.synced);
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
    const queue = getScanQueue();
    const scanIndex = queue.findIndex(scan => scan.queueId === queueId);
    
    if (scanIndex !== -1) {
      queue[scanIndex].synced = true;
      queue[scanIndex].syncedAt = Date.now();
      localStorage.setItem(SCAN_QUEUE_KEY, JSON.stringify(queue));
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to mark scan as synced:', error);
    return false;
  }
}

/**
 * Helper: Get scan queue from localStorage
 */
function getScanQueue() {
  try {
    const queue = localStorage.getItem(SCAN_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Clear all cache (on logout)
 */
export async function clearCache() {
  try {
    localStorage.removeItem(RIDDLES_CACHE_KEY);
    localStorage.removeItem(SCAN_QUEUE_KEY);
    localStorage.removeItem(CACHE_META_KEY);
    console.log('🗑️ Cleared riddle cache from localStorage');
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
    const cached = localStorage.getItem(RIDDLES_CACHE_KEY);
    if (!cached) return false;
    
    const riddles = JSON.parse(cached);
    return riddles && riddles.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Clean up old IndexedDB (migration helper)
 * Automatically removes legacy IndexedDB storage
 */
export async function cleanupOldIndexedDB() {
  try {
    if (typeof indexedDB !== 'undefined') {
      // Delete the old TothRiddleCache database
      await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('TothRiddleCache');
        request.onsuccess = () => {
          console.log('🗑️ Cleaned up old IndexedDB');
          resolve();
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
          console.warn('⚠️ IndexedDB deletion blocked - close other tabs');
          resolve();
        };
      });
    }
  } catch (error) {
    console.log('Note: Old IndexedDB cleanup skipped');
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
  isCachePopulated,
  cleanupOldIndexedDB
};
