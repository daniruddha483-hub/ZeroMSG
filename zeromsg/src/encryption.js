const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Generate a random 256-bit encryption key
export async function generateEncryptionKey() {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const rawKey = await crypto.subtle.exportKey("raw", key);

  return arrayBufferToBase64(rawKey);
}

// Convert a shared key into a usable CryptoKey
async function importEncryptionKey(secret) {
  const rawKey = base64ToArrayBuffer(secret);

  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

// Encrypt a message before sending it
export async function encryptMessage(message, secret) {
  const key = await importEncryptionKey(secret);

  // AES-GCM uses a fresh 12-byte IV for every message
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(message),
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(encrypted),
  };
}

// Decrypt a received message
export async function decryptMessage(encryptedData, secret) {
  const key = await importEncryptionKey(secret);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToArrayBuffer(encryptedData.iv),
    },
    key,
    base64ToArrayBuffer(encryptedData.ciphertext),
  );

  return decoder.decode(decrypted);
}

// Convert binary data to Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

// Convert Base64 back to binary data
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}
