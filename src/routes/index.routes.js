import { Router } from "express";
import authRoutes from "./auth.routes.js";
import transacoesRoutes from "./transactions.routes.js";

const router = Router();
router.use([authRoutes, transacoesRoutes]);

export default router;
