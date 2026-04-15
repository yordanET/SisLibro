import { promises as fs } from "fs";
import path from "path";

export const MEDIA_DIR = path.join(process.cwd(), "imagenes");
export const COVERS_DIR = path.join(MEDIA_DIR, "portadas");

export async function ensureMediaDirs(): Promise<void> {
  await fs.mkdir(COVERS_DIR, { recursive: true });
}

export function sanitizeImageFileName(name: string): string {
  const baseName = path.basename(name);
  return baseName.replace(/[^\w.\- ()]/g, "_").trim();
}

export function isAllowedImage(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);
}

export function imageContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}
