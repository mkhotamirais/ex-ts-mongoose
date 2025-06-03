import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGO_URI as string;

const db = mongoose.connect(uri, { dbName: "ex-ts-mongoose" });

export default db;
