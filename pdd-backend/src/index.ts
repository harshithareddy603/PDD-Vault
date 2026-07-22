import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { ensureUploadDirs } from "./utils/storage";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import familyRoutes from "./routes/family";
import documentRoutes from "./routes/documents";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_PATH = process.env.LOCAL_UPLOAD_PATH || "./uploads";

ensureUploadDirs();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads/avatars", express.static(path.join(UPLOAD_PATH, "avatars")));

app.use("/api/auth", authRoutes);
app.use("/api/family-members", familyRoutes);
app.use("/api/documents", documentRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
