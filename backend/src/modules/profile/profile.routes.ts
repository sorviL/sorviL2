import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getProfileController, updateProfileController, uploadAvatarController } from "./profile.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.join(process.cwd(), "public", "avatars");

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, avatarsDir);
  },
  filename: (request, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `avatar-${uniqueSuffix}${ext}`;
    callback(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (request, file, callback) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(file.mimetype)) {
      callback(new Error("Tipo de arquivo inválido"));
      return;
    }
    callback(null, true);
  },
});

const profileRoutes = Router();

profileRoutes.get("/me", requireAuth, getProfileController);
profileRoutes.patch("/me", requireAuth, updateProfileController);
profileRoutes.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatarController);

export { profileRoutes };
