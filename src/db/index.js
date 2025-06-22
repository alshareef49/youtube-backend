import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { createLoggerUtil } from "../utils/logger.js";

const logger = createLoggerUtil("db");

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        logger.info(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB