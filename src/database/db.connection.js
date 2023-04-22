import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
  await mongoClient.connect();
  console.log("Conectado com o MongoDb");
} catch (err) {
  console.error(err.message);
}

const db = mongoClient.db();

export default db;
