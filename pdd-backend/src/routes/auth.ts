import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { avatarUpload } from "../middleware/upload";

const router = Router();

router.post("/signup", avatarUpload.single("avatar"), authController.signUp);
router.post("/signin", authController.signIn);
router.post("/signout", authenticate, authController.signOut);
router.get("/me", authenticate, authController.getMe);
router.post("/profile", authenticate, authController.updateProfile);
router.post("/avatar", authenticate, avatarUpload.single("avatar"), authController.updateAvatar);
router.get("/check-email", authController.checkEmail);
router.post("/reset-password", authController.resetPassword);

export default router;
