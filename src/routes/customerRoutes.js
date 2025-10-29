import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import * as controller from "../controllers/customerController.js";
const router = Router();

router.get("/", authRequired, controller.list);
router.get("/:id", authRequired, controller.getById);
router.post("/", authRequired, controller.create);
router.put("/:id", authRequired, controller.update);
router.delete("/:id", authRequired, controller.remove);

export default router;
