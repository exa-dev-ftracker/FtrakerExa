import transactions from "~/server/model/transactions";
import jwt from "jsonwebtoken";
import type {dataUserRedis} from "~/types";

export default defineEventHandler(async (events) => {
    try {
        const runTimeConfig = useRuntimeConfig();
        const header = getHeader(events, "Authorization");
        const token = header?.split(" ")[1];
        if (!token) {
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
            return {
                statusCode: 401,
                body: {message: "Unauthorized"},
            };
        }
        const user = await useNitroApp().redis.get(token);
        if (!user) {
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
            _id: string;
        }>(events);
        if (!body) {
            setResponseStatus(events, 400);
            return {
                statusCode: 400,
                body: {message: "Bad request"},
            };
        }
        const {amount, type, description, createdAt, _id} = body;
        const transaction = await transactions.findOne({_id});
        if (!transaction) {
            setResponseStatus(events, 404);
            return {
                statusCode: 404,
                body: {message: "Transaction not found"},
            };
        }
        if (transaction.user.toString() !== userData.id) {
            setResponseStatus(events, 403);
            return {
                statusCode: 403,
                body: {message: "Forbidden"},
            };
        }
        transaction.amount = amount;
        transaction.type = type;
        transaction.description = description;
        transaction.createdAt = createdAt
            ? new Date(createdAt)
            : transaction.createdAt;
        await transaction.save(); // Update the user's balance based on the transaction type
        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {message: "Transaction updated successfully"},
        };
    } catch (error) {
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
                message: "Internal Server Error",
            }
        }
    }
});
