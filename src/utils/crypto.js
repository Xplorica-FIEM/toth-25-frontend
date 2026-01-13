export async function decryptAES(encryptedHex, secretKey, ivHex) {
  // Use the provided constant IV as fallback if not supplied
  const ACTIVE_IV = ivHex || "5fd6f5fbf658b265fe69aecb18cde27b";

  if (!encryptedHex || !secretKey) {
    throw new Error("Missing decryption parameters");
  }

  // Helper: Convert Hex string to Uint8Array
  const hexToBytes = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  };

  try {
    const iv = hexToBytes(ACTIVE_IV);
    const encryptedData = hexToBytes(encryptedHex);
    const textEncoder = new TextEncoder();
    const keyData = textEncoder.encode(secretKey);

    // To match Backend: Use raw string bytes directly.
    // Do NOT hash the key with SHA-256. 
    // Note: secretKey must be exactly 32 characters (bytes) for AES-256.

    // Import the key
    const validKey = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      validKey,
      encryptedData
    );

    const textDecoder = new TextDecoder();
    return textDecoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt riddle. Invalid key.");
  }
}