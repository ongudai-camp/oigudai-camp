import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const hex = process.env.IDENTITY_ENCRYPTION_KEY;
  if (!hex || hex.length < 64) {
    throw new Error("IDENTITY_ENCRYPTION_KEY must be at least 64 hex characters");
  }
  return Buffer.from(hex.slice(0, 64), "hex");
}

function deriveKey(userId: number): Buffer {
  const master = getMasterKey();
  return Buffer.from(crypto.hkdfSync("sha256", master, `uid:${userId}`, "identity-doc", 32));
}

export function encryptIdentityData(plaintext: Record<string, unknown>, userId: number): string {
  const key = deriveKey(userId);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const json = JSON.stringify(plaintext);
  let encrypted = cipher.update(json, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

export function decryptIdentityData(ciphertext: string, userId: number): Record<string, unknown> {
  const key = deriveKey(userId);
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted data format");
  const [ivB64, tagB64, data] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}
