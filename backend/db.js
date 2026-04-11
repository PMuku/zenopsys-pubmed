import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const clientOptions = { serverApi: { version: "1", strict: true, deprecationErrors: true } };

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/your_database_name";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Successfully connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
};

export default connectDB;