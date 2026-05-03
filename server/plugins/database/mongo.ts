import mongoose from "mongoose";
import logger from "~/server/utils/logger";

const runtimeConfig = useRuntimeConfig();

// Retry configuration
const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds

/**
 * Connect to MongoDB with exponential backoff retry strategy
 */
async function connectToMongoDB(attempt = 0): Promise<void> {
    try {
        await mongoose.connect(runtimeConfig.MONGODB_URL, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        logger.info("MongoDB connection established successfully");
    } catch (error) {
        if (attempt < MAX_RETRIES) {
            const delay = Math.min(INITIAL_DELAY * Math.pow(2, attempt), MAX_DELAY);
            logger.warn(
                `MongoDB connection failed (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`,
                error
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));

            // Recursive retry
            return connectToMongoDB(attempt + 1);
        } else {
            logger.error(`MongoDB connection failed after ${MAX_RETRIES} attempts:`, error);
            throw new Error("Failed to connect to MongoDB after maximum retries");
        }
    }
}

export default defineNitroPlugin(() => {
    connectToMongoDB();
})