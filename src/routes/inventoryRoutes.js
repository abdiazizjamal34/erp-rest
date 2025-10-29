import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import * as controller from "../controllers/inventoryController.js";
const router = Router();

router.get("/", authRequired, controller.list);
router.get("/:productId", authRequired, controller.getByProduct);
router.post("/adjust", authRequired, controller.manualAdjust);

export default router;
