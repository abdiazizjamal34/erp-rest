import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import * as controller from "../controllers/paymentController.js";
const router = Router();

router.get("/methods", authRequired, controller.listMethods);
router.post("/methods", authRequired, controller.createMethod);

export default router;
