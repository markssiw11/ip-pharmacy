import CryptoJS from "crypto-js";

/**
 * Encrypt a text using AES with key from backend
 * @param text - plaintext
 * @param key - AES key from backend (hex string)
 * @returns encrypted Base64 string
 */
export function encryptField(text?: string, key?: string): string {
  if (!text || !key) return "";

  const parsedKey = CryptoJS.enc.Hex.parse(key);

  const encrypted = CryptoJS.AES.encrypt(text, parsedKey, {
    mode: CryptoJS.mode.ECB, // match backend
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Base64
}
