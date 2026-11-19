import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from 'dotenv'
dotenv.config({
    path: "./.env"
})
const connectDB = async () => {
    try {
        const connectionInstants = await mongoose.connect(`${process.env.MONGODB_URI}`);
    } catch (error) {
        console.log("MONGODB connection failed", error)
        process.exit(1)
    }
}

export default connectDB;