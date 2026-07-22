import { Router } from "express";
import * as familyController from "../controllers/familyController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", familyController.getAll);
router.post("/", familyController.create);
router.patch("/:id", familyController.update);
router.delete("/:id", familyController.remove);

export default router;
