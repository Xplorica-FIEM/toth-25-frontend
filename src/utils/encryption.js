/**
 * Frontend Encryption/Decryption Utilities
 * Uses Web Crypto API for AES-256-CBC decryption
 * Compatible with backend encryption format: IV:EncryptedData
 */

// You'll need to set this environment variable in your .env.local file
// NEXT_PUBLIC_ENCRYPTION_KEY=your-256-bit-key-in-hex
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY && typeof window !== 'undefined') {
  console.warn('⚠️ NEXT_PUBLIC_ENCRYPTION_KEY not set - decryption will fail');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Import the encryption key for Web Crypto API
 */
async function importKey() {
  const keyBytes = hexToBytes(ENCRYPTION_KEY);
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );
}

/**
 * Decrypt AES-256-CBC encrypted data
 * @param {string} encryptedData - Format: "IV:EncryptedData" (hex encoded)
 * @returns {Promise<string>} - Decrypted plain text
 */
export async function decrypt(encryptedData) {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key not configured');
  }

  try {
    // Split IV and encrypted data
    const [ivHex, dataHex] = encryptedData.split(':');
    
    if (!ivHex || !dataHex) {
      throw new Error('Invalid encrypted data format');
    }

    // Convert hex to bytes
    const iv = hexToBytes(ivHex);
    const encryptedBytes = hexToBytes(dataHex);

    // Import key
    const key = await importKey();

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      encryptedBytes
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Decrypt QR code data (returns riddle id)
 * @param {string} encryptedQR - Encrypted riddle id
 * @returns {Promise<string>} - Plain riddle id
 */
export async function decryptQRData(encryptedQR) {
  const riddleId = await decrypt(encryptedQR);
  return riddleId; // Now returns just the riddle id string
}

/**
 * Decrypt cached riddle data
 * @param {string} encryptedData - Encrypted riddle JSON
 * @returns {Promise<object>} - {riddleName, puzzleText, orderNumber}
 */
export async function decryptRiddleData(encryptedData) {
  const json = await decrypt(encryptedData);
  return JSON.parse(json);
}

export default {
  decrypt,
  decryptQRData,
  decryptRiddleData
};
