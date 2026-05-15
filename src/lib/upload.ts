import sharp from "sharp";
import crypto from "crypto";

const MAGIC_BYTES: Record<string, Uint8Array> = {
  jpeg: new Uint8Array([0xFF, 0xD8, 0xFF]),
  png: new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
  webp: new Uint8Array([0x52, 0x49, 0x46, 0x46]),
  gif: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
  avif: new Uint8Array([0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]),
};

export type OptimizeMode = "avatar" | "gallery";

const MODE_CONFIG: Record<OptimizeMode, { width: number; quality: number }> = {
  avatar: { width: 256, quality: 80 },
  gallery: { width: 1920, quality: 80 },
};

export function validateMagicBytes(buffer: Buffer, mime: string): boolean {
  if (mime === "image/svg+xml") return true;
  const ext = mime.split("/")[1]?.split("+")[0] ?? "";
  const magic = MAGIC_BYTES[ext];
  if (!magic) return false;
  return buffer.length >= magic.length && magic.every((b, i) => buffer[i] === b);
}

export async function optimizeImage(
  buffer: Buffer,
  mode: OptimizeMode = "gallery",
): Promise<Buffer> {
  const config = MODE_CONFIG[mode];
  return sharp(buffer)
    .rotate()
    .resize(config.width, undefined, { withoutEnlargement: true, fit: "inside" })
    .webp({ quality: config.quality, effort: 4 })
    .toBuffer();
}

export function generateFilename(): string {
  const ts = Date.now();
  const rand = crypto.randomUUID().slice(0, 8);
  return `${ts}-${rand}.webp`;
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
export const GALLERY_MAX_SIZE = 20 * 1024 * 1024;
export const GALLERY_MAX_FILES = 10;
