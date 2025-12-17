// Private keys for each riddle (will be moved to backend later)
const privateKeys = {
  1: 'secret_key_riddle_1',
  2: 'secret_key_riddle_2',
  // Add more private keys as you add more riddles
};

// verifies if the key exists and if it doth match the decrypted key
// to be called after decrypting the key from qr code
export const verifyRiddleKey = (riddleNo, decryptedKey) => {
  const privateKey = privateKeys[riddleNo];
  
  if (!privateKey) {
    console.error(`No private key found for riddle ${riddleNo}`);
    return false;
  }
  
  return decryptedKey === privateKey;
};

// Add or remove riddles as needed

export const riddles = [
  {
    id: 1,
    background: '/toth3.png',
    content: (
      <>
        <h2>Riddle Me This...</h2>  
        <p>I can be cracked, but I have no shell.</p>
        <p>I can be told, but I have no voice.</p>
        <p>I can be kept, but I have no locks.</p>
        <br/>
        <h3>What am I?</h3>
      </>
    ),
    isAuthenticated: true, // proxy authentication
  },
  {
    id: 2,
    background: '/toth4.png', // Change to different background
    content: (
      <>
        <h2>Riddle Me This...</h2>  
        <p>Another riddle goes here...</p>
        <br/>
        <h3>What am I?</h3>
      </>
    ),
    isAuthenticated: false, // proxy authentication
  },
  // Add more riddles as needed
];

// Function to update specific riddle's authentication status
export const setRiddleAuthentication = (riddleNo, isAuthenticated) => {
  const riddle = riddles.find(r => r.id === riddleNo);
  if (riddle) {
    riddle.isAuthenticated = isAuthenticated;
    return true;
  }
  return false;
};

// Function to get specific riddle's authentication status
export const getRiddleAuthentication = (riddleNo) => {
  const riddle = riddles.find(r => r.id === riddleNo);
  return riddle ? riddle.isAuthenticated : false;
};
