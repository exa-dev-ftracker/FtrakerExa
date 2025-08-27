// server/plugins/redis.ts
import {createClient} from "redis";
import logger from "~/server/utils/logger";

export default defineNitroPlugin(async (nitroApp) => {
    const client = createClient({
        socket: {
            connectTimeout: 10000,
            reconnectStrategy: (retries) => {
                if (retries > 5) {
                    logger.error("Max retries reached for Redis connection");
                    return new Error("Max retries reached");
                }
                logger.warn(`Redis connection retry attempt: ${retries}`);
                return Math.min(retries * 1000, 5000); // Exponential backoff with a max delay of 5 seconds
            }
        },
        url: useRuntimeConfig().REDIS_URL as string,
    });

    client.on("error", (err) => {
        logger.error(`Redis Client Error: ${err}`);
    });
    client.on("connect", () => {
        logger.info("Redis client is connecting...");
    });
    client.on("ready", () => {
        logger.info("Redis client is ready to use");
    });
    client.on("end", () => {
        logger.warn("Redis connection has been closed");
    })


    try {
        await client.connect();
        logger.info("Redis connection established successfully");
    } catch (error) {
        logger.error(`Redis connection error: ${error}`);
        throw new Error("Failed to connect to Redis");
    }

    nitroApp.redis = client;
});
