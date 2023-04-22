import db from "../database/db.connection.js";

export async function authValidation(req, res, next) {
  const { auth } = req.headers; // auth -> Bearer token

  // Verificar se foi enviado o token
  if (!auth) return res.sendStatus(401);

  // Formatar o token para o formato esperado
  const token = auth?.replace("Bearer", "");

  try {
    // Verificar se token existe no BD
    const sessao = await db.collection("sessoes").findOne({ token });
    if (!sessao) return res.status(401).send("Token inválido");

    res.locals.sessao = sessao; // guardar sessao em uma variáve local da resposta da requisição
  } catch (error) {
    res.status(500).send(error.message);
  }

  next();
}
