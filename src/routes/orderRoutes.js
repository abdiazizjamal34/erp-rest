import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import * as controller from "../controllers/orderController.js";
const router = Router();

router.get("/", authRequired, controller.list);
router.get("/:id", authRequired, controller.getById);
router.post("/", authRequired, controller.createOrder);
router.post("/:id/pay", authRequired, controller.addPayment);
router.put("/:id/status", authRequired, controller.updateStatus);

export default router;
