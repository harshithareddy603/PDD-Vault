import { Router } from "express";
import * as documentController from "../controllers/documentController";
import { authenticate } from "../middleware/auth";
import { documentUpload } from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.get("/", documentController.getAll);
router.post("/", documentUpload.single("file"), documentController.create);
router.patch("/:id", documentController.update);
router.delete("/:id", documentController.remove);
router.post("/delete-bulk", documentController.bulkDelete);
router.get("/:id/signed-url", documentController.getSignedUrl);

export default router;
