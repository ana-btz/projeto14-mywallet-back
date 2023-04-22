import { Router } from "express";
import { cadastrar, login } from "../controllers/auth.controller.js";
import schemaValidation from "../middlewares/validateSchema.middleware.js";
import { cadastroSchema } from "../schemas/auth.schema.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/cadastro", schemaValidation(cadastroSchema), cadastrar);
router.post("/", schemaValidation(loginSchema), login);

export default router;
