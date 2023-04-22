import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuid } from 'uuid';

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// Schemas
const cadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
});

const transacaoSchema = joi.object({
    valor: joi.number().min(0).required(),
    descricao: joi.string().required()
});

// Conexão com o MongoDb
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect();
    console.log("Conectado com o MongoDb");

} catch (err) {
    console.error(err.message);
}

const db = mongoClient.db();

// Requisições
app.post("/cadastro", async (req, res) => {
    const { nome, email, senha } = req.body;

    // Validar os dados recebidos pelo body
    const { error } = cadastroSchema.validate(req.body, { abortEarly: false })
    if (error) return res.status(422).send(error.details.map(d => d.message));

    try {
        // Verificar se email já foi cadastrado
        const usuario = await db.collection("usuarios").findOne({ email });
        if (usuario) return res.status(409).send("Endereço de e-mail já cadastrado");

        // Criptografar senha 
        const hash = bcrypt.hashSync(senha, 10);

        // Guardar dados do usuario no BD
        await db.collection("usuarios").insertOne({ nome, email, senha: hash });
        res.sendStatus(201);

    } catch (error) {
        res.status(500).send(error.message);
    }

});

app.post("/", async (req, res) => {
    const { email, senha } = req.body;

    // Validar os dados recebidos pelo body
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(422).send(error.details.map(d => d.message));

    try {
        // Validar se email existe
        const usuario = await db.collection("usuarios").findOne({ email });
        if (!usuario) return res.status(404).send("Usuário ou senha incorretos");

        // Validar senha
        const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);
        if (!senhaCorreta) return res.status(401).send("Usuário ou senha incorretos");

        // Criar o token
        const token = uuid();

        // Guardar token associado ao id do usuario
        await db.collection("sessoes").insertOne({ idUsuario: usuario._id, token });
        res.status(200).send(token);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/nova-transacao/:tipo", async (req, res) => {
    const { valor, descricao } = req.body;
    const { auth } = req.headers; // auth -> Bearer token
    const tipo = req.params.tipo;

    // Verificar se foi enviado o token 
    if (!auth) return res.sendStatus(401);

    // Formatar o token para o formato esperado
    const token = auth?.replace("Bearer", "");

    // Validar os dados recebidos pelo body
    const { error } = transacaoSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(422).send(error.details.map(d => d.message));

    try {
        // Verificar se token existe no BD
        const sessao = await db.collection("sessoes").findOne({ token });
        if (!sessao) return res.status(401).send("Token inválido");

        // Inserir os dados de transação no BD
        await db.collection("transacoes").insertOne({
            tipo,
            valor: +valor,
            descricao,
            idUsuario: sessao.idUsuario
        });
        return res.sendStatus(200);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/home", async (req, res) => {
    const { auth } = req.headers;

    // Verificar se token foi enviado
    if (!auth) return res.sendStatus(401);

    // converter token para o formato esperado
    const token = auth.replace("Baerer ", "");

    try {
        // Encontrar o id do usuário associado ao token
        const sessao = await db.collection("sessoes").findOne({ token });
        if (!sessao) return res.status(401).send("Token inválido");

        // Encontrar o usuario associado ao id (se for preciso no front)
        const usuario = await db.collection("usuarios").findOne({ _id: sessao.idUsuario });
        if (!usuario) return res.status(404).send("Usuário não encontrado");

        // Encontrar as transações associadas ao usuário
        const transacoes = await db.collection("transacoes").find({ idUsuario: sessao.idUsuario }).toArray();
        if (!transacoes) return res.sendStatus(404);

        const dadosUsuario = { usuario, transacoes };

        res.status(200).send(dadosUsuario);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor rodando na porta: ${port}`));
