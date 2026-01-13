export async function decryptAES(encryptedHex, secretKey, ivHex) {
  if (!encryptedHex || !secretKey || !ivHex) {
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
    const iv = hexToBytes(ivHex);
    const encryptedData = hexToBytes(encryptedHex);
    const textEncoder = new TextEncoder();
    const keyData = textEncoder.encode(secretKey);

    // Hash the secret key to ensure it's 256-bit (32 bytes) for AES-256
    const keyHash = await window.crypto.subtle.digest('SHA-256', keyData);

    // Import the key
    const validKey = await window.crypto.subtle.importKey(
      "raw",
      keyHash,
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