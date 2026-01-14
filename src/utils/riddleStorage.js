/**
 * Riddle Storage Utility
 * 
 * Stores riddle data in separate localStorage keys to avoid quota limits.
 * 
 * Storage structure:
 * - `locked-riddles-index`: Array of locked riddle IDs
 * - `unlocked-riddles-index`: Array of unlocked riddle IDs  
 * - `riddle-data-{id}`: Individual riddle data for each riddle
 */

const LOCKED_INDEX_KEY = 'locked-riddles-index';
const UNLOCKED_INDEX_KEY = 'unlocked-riddles-index';
const RIDDLE_DATA_PREFIX = 'riddle-data-';

/**
 * Get the storage key for a specific riddle's data
 */
function getRiddleDataKey(riddleId) {
  return `${RIDDLE_DATA_PREFIX}${riddleId}`;
}

/**
 * Store a single riddle's data
 */
export function storeRiddleData(riddleId, data) {
  try {
    localStorage.setItem(getRiddleDataKey(riddleId), JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Failed to store riddle ${riddleId}:`, err);
    return false;
  }
}

/**
 * Get a single riddle's data
 */
export function getRiddleData(riddleId) {
  try {
    const data = localStorage.getItem(getRiddleDataKey(riddleId));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Failed to get riddle ${riddleId}:`, err);
    return null;
  }
}

/**
 * Remove a single riddle's data
 */
export function removeRiddleData(riddleId) {
  try {
    localStorage.removeItem(getRiddleDataKey(riddleId));
  } catch (err) {
    console.error(`Failed to remove riddle ${riddleId}:`, err);
  }
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
 * Store all locked riddles (from server response)
 * @param {Object} riddlesMap - Object with riddle IDs as keys and riddle data as values
 */
export function storeLockedRiddles(riddlesMap) {
  const ids = [];
  for (const [id, data] of Object.entries(riddlesMap)) {
    storeRiddleData(id, { ...data, isLocked: true });
    ids.push(id);
  }
  setLockedRiddlesIndex(ids);
}

/**
 * Store all unlocked riddles (from server response)
 * @param {Object} riddlesMap - Object with riddle IDs as keys and riddle data as values
 */
export function storeUnlockedRiddles(riddlesMap) {
  const ids = [];
  for (const [id, data] of Object.entries(riddlesMap)) {
    storeRiddleData(id, { ...data, isLocked: false, isSolved: true });
    ids.push(id);
  }
  setUnlockedRiddlesIndex(ids);
}

/**
 * Get a locked riddle's data by ID
 */
export function getLockedRiddle(riddleId) {
  const lockedIndex = getLockedRiddlesIndex();
  if (!lockedIndex.includes(riddleId)) {
    return null;
  }
  return getRiddleData(riddleId);
}

/**
 * Get an unlocked riddle's data by ID
 */
export function getUnlockedRiddle(riddleId) {
  const unlockedIndex = getUnlockedRiddlesIndex();
  if (!unlockedIndex.includes(riddleId)) {
    return null;
  }
  return getRiddleData(riddleId);
}

/**
 * Get all locked riddles (returns array of riddle data)
 */
export function getAllLockedRiddles() {
  const ids = getLockedRiddlesIndex();
  return ids.map(id => getRiddleData(id)).filter(Boolean);
}

/**
 * Get all unlocked riddles (returns array of riddle data)
 */
export function getAllUnlockedRiddles() {
  const ids = getUnlockedRiddlesIndex();
  return ids.map(id => getRiddleData(id)).filter(Boolean);
}

/**
 * Move a riddle from locked to unlocked
 * @param {string} riddleId - The riddle ID
 * @param {Object} unlockedData - The unlocked riddle data (with decrypted puzzleText)
 */
export function unlockRiddle(riddleId, unlockedData) {
  // Remove from locked index
  const lockedIndex = getLockedRiddlesIndex();
  const newLockedIndex = lockedIndex.filter(id => id !== riddleId);
  setLockedRiddlesIndex(newLockedIndex);
  
  // Add to unlocked index
  const unlockedIndex = getUnlockedRiddlesIndex();
  if (!unlockedIndex.includes(riddleId)) {
    unlockedIndex.push(riddleId);
    setUnlockedRiddlesIndex(unlockedIndex);
  }
  
  // Update riddle data with unlocked content
  storeRiddleData(riddleId, {
    ...unlockedData,
    id: riddleId,
    isLocked: false,
    isSolved: true,
    scannedAt: unlockedData.scannedAt || new Date().toISOString()
  });
}

/**
 * Check if there are any locked riddles available
 */
export function hasLockedRiddles() {
  const ids = getLockedRiddlesIndex();
  return ids.length > 0;
}

/**
 * Clear all riddle storage (for logout)
 */
export function clearAllRiddleStorage() {
  // Clear indexes
  localStorage.removeItem(LOCKED_INDEX_KEY);
  localStorage.removeItem(UNLOCKED_INDEX_KEY);
  
  // Clear all riddle data keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(RIDDLE_DATA_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Also clear legacy keys
  localStorage.removeItem('locked-riddles');
  localStorage.removeItem('unlocked-riddles');
}

/**
 * Migrate from old storage format to new distributed format
 * This handles backward compatibility
 */
export function migrateFromLegacyStorage() {
  try {
    // Check if migration is needed
    const hasLegacyLocked = localStorage.getItem('locked-riddles');
    const hasLegacyUnlocked = localStorage.getItem('unlocked-riddles');
    
    if (!hasLegacyLocked && !hasLegacyUnlocked) {
      return; // No legacy data
    }
    
    // Migrate locked riddles
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
    
    // Migrate unlocked riddles
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
    
    console.log('✅ Migrated from legacy riddle storage format');
  } catch (err) {
    console.error('Migration from legacy storage failed:', err);
  }
}
