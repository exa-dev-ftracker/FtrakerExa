import transactions from "~/server/model/transactions";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type {dataUserRedis} from "~/types";
import { broadcastToUser } from "~/server/utils/wsPeerManager";

export default defineEventHandler(async (events) => {
    try {
        const runTimeConfig = useRuntimeConfig();
        const header = getHeader(events, "Authorization");
        const token = header?.split(" ")[1];
        if (!token) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                body: {message: "Unauthorized"},
            };
        }
        const isValidToken = jwt.verify(
            token,
            runTimeConfig.secretJwtKey as string
        );
        if (!isValidToken) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                body: {message: "Unauthorized"},
            };
        }
        const user = await useNitroApp().redis.get(token);
        if (!user) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                body: {message: "Unauthorized"},
            };
        }
        const userData: dataUserRedis = JSON.parse(user);
        const body = await readBody<{
            amount: number;
            type: string;
            description: string;
            createdAt?: string;
            category?: string;
        }>(events);
        if (!body || !body.category) {
            setResponseStatus(events, 400);
            return {
                statusCode: 400,
                body: {message: "Category is required"},
            };
        }
        const {amount, type, description, createdAt, category} = body;
        const transaction = new transactions({
            user: userData.id,
            amount,
            type,
            description,
            createdAt,
            category: category || undefined,
        });
        await transaction.save();
        broadcastToUser(userData.id, "transaction:created", { _id: transaction._id });
        setResponseStatus(events, 201);
        return {
            statusCode: 201,
            body: {message: "Transaction created successfully"},
        };
    } catch (error) {
        // Log the error for debugging purposes
        logger.error(`Error in creating transaction: ${error}`);
        // If the error is a JWT error, set status to 401
        if (error instanceof Error) {
            if (error.name === "JsonWebTokenError") {
                setResponseStatus(events, 401);
                return {
                    statusCode: 401,
                    body: {message: "Unauthorized: Invalid token"},
                }
            } else if (error.name === "TokenExpiredError") {
                setResponseStatus(events, 401);
                return {
                    statusCode: 401,
                    body: {message: "Unauthorized: Token expired"},
                }
            } else {
                setResponseStatus(events, 500);
                return {
                    statusCode: 500,
                    body: {message: `Internal Server Error: ${error.message}`},
                }
            }
        } else {
            setResponseStatus(events, 500);
            return {
                statusCode: 500,
                body: {message: "Internal Server Error"},
            }
        }
    }
});
