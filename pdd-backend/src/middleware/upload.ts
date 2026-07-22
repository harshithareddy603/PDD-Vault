import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_PATH = process.env.LOCAL_UPLOAD_PATH || "./uploads";

function createStorage(subfolder: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(UPLOAD_PATH, subfolder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

export const avatarUpload = multer({
  storage: createStorage("avatars"),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed for avatars"));
  },
});

export const documentUpload = multer({
  storage: createStorage("documents"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/", "application/pdf"];
    if (allowed.some((t) => file.mimetype.startsWith(t))) cb(null, true);
    else cb(new Error("Only images and PDFs are allowed for documents"));
  },
});
