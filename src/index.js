import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient } from "mongodb";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// Schemas
const usuarioSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
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
    const { error } = usuarioSchema.validate(req.body, { abortEarly: false })
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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor rodando na porta: ${port}`));
