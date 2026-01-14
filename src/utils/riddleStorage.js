/**
 * Riddle Storage Utility
 * 
 * Uses completely separate storage for locked and unlocked riddles:
 * 
 * Storage structure:
 * - `locked-riddles-index`: Array of locked riddle IDs
 * - `locked-riddle-{id}`: Individual locked riddle data (encrypted puzzleText)
 * 
 * - `unlocked-riddles-index`: Array of unlocked riddle IDs  
 * - `unlocked-riddle-{id}`: Individual unlocked riddle data (decrypted puzzleText)
 * 
 * These two storage spaces are completely independent.
 */

// Index keys
const LOCKED_INDEX_KEY = 'locked-riddles-index';
const UNLOCKED_INDEX_KEY = 'unlocked-riddles-index';

// Data key prefixes - SEPARATE for locked and unlocked
const LOCKED_RIDDLE_PREFIX = 'locked-riddle-';
const UNLOCKED_RIDDLE_PREFIX = 'unlocked-riddle-';

// ==================== LOCKED RIDDLES ====================

/**
 * Get the storage key for a locked riddle
 */
function getLockedRiddleKey(riddleId) {
  return `${LOCKED_RIDDLE_PREFIX}${riddleId}`;
}

/**
 * Get locked riddles index (array of IDs)
 */
export function getLockedRiddlesIndex() {
  try {
    const index = localStorage.getItem(LOCKED_INDEX_KEY);
    return index ? JSON.parse(index) : [];
  } catch (err) {
    console.error('Failed to get locked riddles index:', err);
    return [];
  }
}

/**
 * Set locked riddles index
 */
export function setLockedRiddlesIndex(ids) {
  try {
    localStorage.setItem(LOCKED_INDEX_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to set locked riddles index:', err);
  }
}

/**
 * Store a single locked riddle
 */
function storeLockedRiddleData(riddleId, data) {
  try {
    localStorage.setItem(getLockedRiddleKey(riddleId), JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Failed to store locked riddle ${riddleId}:`, err);
    return false;
  }
}

/**
 * Get a single locked riddle's data
 */
function getLockedRiddleData(riddleId) {
  try {
    const data = localStorage.getItem(getLockedRiddleKey(riddleId));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Failed to get locked riddle ${riddleId}:`, err);
    return null;
  }
}

/**
 * Remove a single locked riddle
 */
function removeLockedRiddleData(riddleId) {
  try {
    localStorage.removeItem(getLockedRiddleKey(riddleId));
  } catch (err) {
    console.error(`Failed to remove locked riddle ${riddleId}:`, err);
  }
}

/**
 * Store all locked riddles (from server response)
 * @param {Object} riddlesMap - Object with riddle IDs as keys and riddle data as values
 */
export function storeLockedRiddles(riddlesMap) {
  const ids = [];
  let storedCount = 0;
  let failedCount = 0;
  
  for (const [id, data] of Object.entries(riddlesMap)) {
    const success = storeLockedRiddleData(id, { ...data, id, isLocked: true });
    if (success) {
      storedCount++;
    } else {
      failedCount++;
      console.warn(`⚠️ Could not store locked riddle ${id}`);
    }
    ids.push(id);
  }
  
  setLockedRiddlesIndex(ids);
  
  if (failedCount > 0) {
    console.warn(`⚠️ Stored ${storedCount}/${ids.length} locked riddles. ${failedCount} failed.`);
  }
}

/**
 * Get a locked riddle by ID
 */
export function getLockedRiddle(riddleId) {
  const lockedIndex = getLockedRiddlesIndex();
  if (!lockedIndex.includes(riddleId)) {
    return null;
  }
  return getLockedRiddleData(riddleId);
}

/**
 * Get all locked riddles (returns array)
 */
export function getAllLockedRiddles() {
  const ids = getLockedRiddlesIndex();
  return ids.map(id => getLockedRiddleData(id)).filter(Boolean);
}

/**
 * Check if there are any locked riddles available
 */
export function hasLockedRiddles() {
  const ids = getLockedRiddlesIndex();
  return ids.length > 0;
}

// ==================== UNLOCKED RIDDLES ====================

/**
 * Get the storage key for an unlocked riddle
 */
function getUnlockedRiddleKey(riddleId) {
  return `${UNLOCKED_RIDDLE_PREFIX}${riddleId}`;
}

/**
 * Get unlocked riddles index (array of IDs)
 */
export function getUnlockedRiddlesIndex() {
  try {
    const index = localStorage.getItem(UNLOCKED_INDEX_KEY);
    return index ? JSON.parse(index) : [];
  } catch (err) {
    console.error('Failed to get unlocked riddles index:', err);
    return [];
  }
}

/**
 * Set unlocked riddles index
 */
export function setUnlockedRiddlesIndex(ids) {
  try {
    localStorage.setItem(UNLOCKED_INDEX_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to set unlocked riddles index:', err);
  }
}

/**
 * Store a single unlocked riddle
 */
function storeUnlockedRiddleData(riddleId, data) {
  try {
    localStorage.setItem(getUnlockedRiddleKey(riddleId), JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Failed to store unlocked riddle ${riddleId}:`, err);
    return false;
  }
}

/**
 * Get a single unlocked riddle's data
 */
function getUnlockedRiddleData(riddleId) {
  try {
    const data = localStorage.getItem(getUnlockedRiddleKey(riddleId));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Failed to get unlocked riddle ${riddleId}:`, err);
    return null;
  }
}

/**
 * Remove a single unlocked riddle
 */
function removeUnlockedRiddleData(riddleId) {
  try {
    localStorage.removeItem(getUnlockedRiddleKey(riddleId));
  } catch (err) {
    console.error(`Failed to remove unlocked riddle ${riddleId}:`, err);
  }
}

/**
 * Store all unlocked riddles
 * @param {Object} riddlesMap - Object with riddle IDs as keys and riddle data as values
 */
export function storeUnlockedRiddles(riddlesMap) {
  const ids = [];
  let storedCount = 0;
  let failedCount = 0;
  
  for (const [id, data] of Object.entries(riddlesMap)) {
    const success = storeUnlockedRiddleData(id, { ...data, id, isLocked: false, isSolved: true });
    if (success) {
      storedCount++;
    } else {
      failedCount++;
      console.warn(`⚠️ Could not store unlocked riddle ${id}`);
    }
    ids.push(id);
  }
  
  setUnlockedRiddlesIndex(ids);
  
  if (failedCount > 0) {
    console.warn(`⚠️ Stored ${storedCount}/${ids.length} unlocked riddles. ${failedCount} failed.`);
  }
}

/**
 * Get an unlocked riddle by ID
 */
export function getUnlockedRiddle(riddleId) {
  const unlockedIndex = getUnlockedRiddlesIndex();
  if (!unlockedIndex.includes(riddleId)) {
    return null;
  }
  return getUnlockedRiddleData(riddleId);
}

/**
 * Get all unlocked riddles (returns array)
 */
export function getAllUnlockedRiddles() {
  const ids = getUnlockedRiddlesIndex();
  return ids.map(id => getUnlockedRiddleData(id)).filter(Boolean);
}

// ==================== UNLOCK OPERATION ====================

/**
 * Move a riddle from locked to unlocked
 * @param {string} riddleId - The riddle ID
 * @param {Object} unlockedData - The unlocked riddle data (with decrypted puzzleText)
 */
export function unlockRiddle(riddleId, unlockedData) {
  // 1. Remove from locked storage
  const lockedIndex = getLockedRiddlesIndex();
  if (lockedIndex.includes(riddleId)) {
    const newLockedIndex = lockedIndex.filter(id => id !== riddleId);
    setLockedRiddlesIndex(newLockedIndex);
    removeLockedRiddleData(riddleId);
  }
  
  // 2. Add to unlocked storage
  const unlockedIndex = getUnlockedRiddlesIndex();
  if (!unlockedIndex.includes(riddleId)) {
    unlockedIndex.push(riddleId);
    setUnlockedRiddlesIndex(unlockedIndex);
  }
  
  // 3. Store the unlocked riddle data (with decrypted puzzleText)
  storeUnlockedRiddleData(riddleId, {
    ...unlockedData,
    id: riddleId,
    isLocked: false,
    isSolved: true,
    scannedAt: unlockedData.scannedAt || new Date().toISOString()
  });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Clear all riddle storage (for logout)
 */
export function clearAllRiddleStorage() {
  // Clear indexes
  localStorage.removeItem(LOCKED_INDEX_KEY);
  localStorage.removeItem(UNLOCKED_INDEX_KEY);
  
  // Clear all locked and unlocked riddle data keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(LOCKED_RIDDLE_PREFIX) || key.startsWith(UNLOCKED_RIDDLE_PREFIX))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Also clear legacy keys
  localStorage.removeItem('locked-riddles');
  localStorage.removeItem('unlocked-riddles');
  
  // Clear old format keys (riddle-data-*)
  const oldKeysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('riddle-data-')) {
      oldKeysToRemove.push(key);
    }
  }
  oldKeysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Migrate from old storage format to new distributed format
 */
export function migrateFromLegacyStorage() {
  try {
    // Check for legacy formats
    const hasLegacyLocked = localStorage.getItem('locked-riddles');
    const hasLegacyUnlocked = localStorage.getItem('unlocked-riddles');
    
    // Also check for old riddle-data-* format
    let hasOldFormat = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('riddle-data-')) {
        hasOldFormat = true;
        break;
      }
    }
    
    if (!hasLegacyLocked && !hasLegacyUnlocked && !hasOldFormat) {
      return; // No migration needed
    }
    
    // Migrate from 'locked-riddles' / 'unlocked-riddles' format
    if (hasLegacyLocked) {
      try {
        const lockedMap = JSON.parse(hasLegacyLocked);
        if (typeof lockedMap === 'object' && !Array.isArray(lockedMap)) {
          storeLockedRiddles(lockedMap);
        }
        localStorage.removeItem('locked-riddles');
      } catch (e) {
        console.error('Failed to migrate locked riddles:', e);
      }
    }
    
    if (hasLegacyUnlocked) {
      try {
        const unlockedMap = JSON.parse(hasLegacyUnlocked);
        if (typeof unlockedMap === 'object' && !Array.isArray(unlockedMap)) {
          storeUnlockedRiddles(unlockedMap);
        }
        localStorage.removeItem('unlocked-riddles');
      } catch (e) {
        console.error('Failed to migrate unlocked riddles:', e);
      }
    }
    
    // Migrate from riddle-data-* format to new separate format
    if (hasOldFormat) {
      const oldLockedIndex = localStorage.getItem('locked-riddles-index');
      const oldUnlockedIndex = localStorage.getItem('unlocked-riddles-index');
      
      if (oldLockedIndex) {
        try {
          const lockedIds = JSON.parse(oldLockedIndex);
          const lockedMap = {};
          lockedIds.forEach(id => {
            const data = localStorage.getItem(`riddle-data-${id}`);
            if (data) {
              lockedMap[id] = JSON.parse(data);
            }
          });
          if (Object.keys(lockedMap).length > 0) {
            storeLockedRiddles(lockedMap);
          }
        } catch (e) {
          console.error('Failed to migrate old locked format:', e);
        }
      }
      
      if (oldUnlockedIndex) {
        try {
          const unlockedIds = JSON.parse(oldUnlockedIndex);
          const unlockedMap = {};
          unlockedIds.forEach(id => {
            const data = localStorage.getItem(`riddle-data-${id}`);
            if (data) {
              unlockedMap[id] = JSON.parse(data);
            }
          });
          if (Object.keys(unlockedMap).length > 0) {
            storeUnlockedRiddles(unlockedMap);
          }
        } catch (e) {
          console.error('Failed to migrate old unlocked format:', e);
        }
      }
      
      // Clean up old riddle-data-* keys
      const oldKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('riddle-data-')) {
          oldKeys.push(key);
        }
      }
      oldKeys.forEach(key => localStorage.removeItem(key));
    }
    
    console.log('✅ Migrated to new riddle storage format');
  } catch (err) {
    console.error('Migration from legacy storage failed:', err);
  }
}

// ==================== LEGACY EXPORTS FOR COMPATIBILITY ====================

/**
 * @deprecated Use getLockedRiddle or getUnlockedRiddle instead
 */
export function getRiddleData(riddleId) {
  // Try unlocked first (more likely to be accessed)
  const unlocked = getUnlockedRiddleData(riddleId);
  if (unlocked) return unlocked;
  
  // Fall back to locked
  return getLockedRiddleData(riddleId);
}

/**
 * @deprecated Use storeLockedRiddles or storeUnlockedRiddles instead
 */
export function storeRiddleData(riddleId, data) {
  if (data.isLocked === false || data.isSolved === true) {
    return storeUnlockedRiddleData(riddleId, data);
  }
  return storeLockedRiddleData(riddleId, data);
}
