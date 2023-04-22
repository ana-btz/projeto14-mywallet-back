import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import db from "../database/db.connection.js";

export async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;

  try {
    // Verificar se email já foi cadastrado
    const usuario = await db.collection("usuarios").findOne({ email });
    if (usuario)
      return res.status(409).send("Endereço de e-mail já cadastrado");

    // Criptografar senha
    const hash = bcrypt.hashSync(senha, 10);

    // Guardar dados do usuario no BD
    await db.collection("usuarios").insertOne({ nome, email, senha: hash });
    res.status(201).send("Usuário cadastrado com sucesso");
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function login(req, res) {
  const { email, senha } = req.body;

  try {
    // Validar se email existe
    const usuario = await db.collection("usuarios").findOne({ email });
    if (!usuario) return res.status(404).send("Usuário ou senha incorretos");

    // Validar senha
    const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);
    if (!senhaCorreta)
      return res.status(401).send("Usuário ou senha incorretos");

    // Criar o token
    const token = uuid();

    // Guardar token associado ao id do usuario
    await db.collection("sessoes").insertOne({ idUsuario: usuario._id, token });
    res.status(200).send(token);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
