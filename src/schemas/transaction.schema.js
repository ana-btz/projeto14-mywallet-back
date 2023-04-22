import joi from "joi";

export const transacaoSchema = joi.object({
  valor: joi.number().min(0).required(),
  descricao: joi.string().required(),
});
