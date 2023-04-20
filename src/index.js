import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// Conexão com o MongoDb
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect();
    console.log("Conectado com o MongoDb");

} catch (err) {
    console.error(err.message);
}

const db = mongoClient.db("mywallet");

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor rodando na porta: ${port}`));
