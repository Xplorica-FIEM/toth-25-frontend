/**
 * Session Encryption Key Management
 * Generates a random encryption key per session for IndexedDB encryption
 */

const SESSION_KEY_NAME = 'toth_session_key';
const SESSION_TIMESTAMP = 'toth_session_timestamp';
const KEY_EXPIRY_HOURS = 24;

/**
 * Generate a random 256-bit encryption key
 * @returns {string} Hex-encoded 32-byte key
 */
function generateRandomKey() {
  const array = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create session encryption key
 * Key is stored in sessionStorage and expires after 24 hours
 * @returns {string} Hex-encoded encryption key
 */
export function getSessionKey() {
  if (typeof window === 'undefined') return null;

  // Check if key exists and is not expired
  const existingKey = sessionStorage.getItem(SESSION_KEY_NAME);
  const timestamp = sessionStorage.getItem(SESSION_TIMESTAMP);

  if (existingKey && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    const maxAge = KEY_EXPIRY_HOURS * 60 * 60 * 1000;

    if (age < maxAge) {
      return existingKey;
    }
  }

  // Generate new key
  const newKey = generateRandomKey();
  sessionStorage.setItem(SESSION_KEY_NAME, newKey);
  sessionStorage.setItem(SESSION_TIMESTAMP, Date.now().toString());

  console.log('🔑 Generated new session encryption key');
  return newKey;
}

/**
 * Clear session encryption key (on logout)
 */
export function clearSessionKey() {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem(SESSION_KEY_NAME);
  sessionStorage.removeItem(SESSION_TIMESTAMP);
  console.log('🗑️ Cleared session encryption key');
}

/**
 * Check if session key exists and is valid
 */
export function hasValidSessionKey() {
  if (typeof window === 'undefined') return false;
  
  const key = sessionStorage.getItem(SESSION_KEY_NAME);
  const timestamp = sessionStorage.getItem(SESSION_TIMESTAMP);

  if (!key || !timestamp) return false;

  const age = Date.now() - parseInt(timestamp);
  const maxAge = KEY_EXPIRY_HOURS * 60 * 60 * 1000;

  return age < maxAge;
}

export default {
  getSessionKey,
  clearSessionKey,
  hasValidSessionKey
};
