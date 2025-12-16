import { verifyRiddleKey, setRiddleAuthentication } from '../data/riddles';

/**
 *  after getting and decrypting the key and riddle no from qr
 * call this function to authenticate the riddle.
 * Each riddle has independent authentication tracked in riddles.js
 * @param {number} riddleNo - The riddle number to authenticate
 * @param {string} decryptedKey - The decrypted key to verify
 * @returns {boolean} - Returns true if authentication successful, false otherwise
 */
export const authenticateRiddle = (riddleNo, decryptedKey) => {
  const isValid = verifyRiddleKey(riddleNo, decryptedKey);
  
  if (isValid) {
    setRiddleAuthentication(riddleNo, true);
    console.log(`Riddle ${riddleNo} authenticated successfully!`);
    return true;
  } else {
    console.log(`Invalid key for riddle ${riddleNo}`);
    return false;
  }
};
