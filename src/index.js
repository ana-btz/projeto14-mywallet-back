import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

const app = express();
const PORT = 5000;

dotenv.config();
app.use(cors());

const mongoClient = new MongoClient(process.env.DATABASE_URL)

try {
    await mongoClient.connect();
    console.log("Conectado com o Mongodb")

} catch (err) {
    console.error(err);
}

app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`));
