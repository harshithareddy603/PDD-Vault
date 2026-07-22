import path from "path";
import fs from "fs";

const UPLOAD_PATH = process.env.LOCAL_UPLOAD_PATH || "./uploads";
const BASE_URL = process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";

export function ensureUploadDirs() {
  const dirs = ["avatars", "documents"];
  dirs.forEach((dir) => {
    const fullPath = path.join(UPLOAD_PATH, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

export function getPublicUrl(relativePath: string): string {
  return `${BASE_URL}/uploads/${relativePath}`;
}

export function deleteFile(relativePath: string): void {
  try {
    const fullPath = path.join(UPLOAD_PATH, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

export function generateSignedUrl(relativePath: string): string {
  const expires = Date.now() + 60 * 60 * 1000;
  return `${BASE_URL}/uploads/${relativePath}?expires=${expires}`;
}
