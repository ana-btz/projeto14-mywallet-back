import { Router } from "express";
import {
  getTransacoes,
  postTransacao,
} from "../controllers/transactions.controller.js";
import { transacaoSchema } from "../schemas/transaction.schema.js";
import schemaValidation from "../middlewares/validateSchema.middleware.js";
import { authValidation } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authValidation); // usa authValidation para todas as rotas
router.post(
  "/nova-transacao/:tipo",
  schemaValidation(transacaoSchema),
  postTransacao
);
router.get("/home", getTransacoes);

export default router;
