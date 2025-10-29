import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import * as controller from "../controllers/returnController.js";
const router = Router();

router.get("/", authRequired, controller.list);
router.get("/:id", authRequired, controller.getById);
router.post("/", authRequired, controller.createReturn);

export default router;
