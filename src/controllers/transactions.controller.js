import dayjs from "dayjs";
import db from "../database/db.connection.js";

export async function postTransacao(req, res) {
  const { valor, descricao } = req.body;
  const tipo = req.params.tipo;
  const sessao = res.locals.sessao;

  try {
    // Inserir os dados de transação no BD
    await db.collection("transacoes").insertOne({
      valor: +valor,
      descricao,
      tipo,
      data: dayjs().format("DD/MM"),
      idUsuario: sessao.idUsuario,
    });
    return res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function getTransacoes(req, res) {
  const sessao = res.locals.sessao;

  try {
    // Encontrar o usuario associado ao id (se for preciso no front)
    const usuario = await db
      .collection("usuarios")
      .findOne({ _id: sessao.idUsuario });
    if (!usuario) return res.status(404).send("Usuário não encontrado");

    // Não deve enviar a senha
    delete usuario.senha;

    // Encontrar as transações associadas ao usuário
    const transacoes = await db
      .collection("transacoes")
      .find({ idUsuario: sessao.idUsuario })
      .toArray();
    if (!transacoes) return res.sendStatus(404);

    const dadosUsuario = { usuario, transacoes: [...transacoes].reverse() };

    // enviar dados do usuário para o cliente
    res.status(200).send(dadosUsuario);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
