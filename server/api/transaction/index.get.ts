import transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import selectedViewPeriode from "~/server/utils/selectedViewPeriode";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type {dataUserRedis} from "~/types";

// Ensure Category model is registered for populate
const _registerCategory = Category;

export default defineEventHandler(async (events) => {
    try {
        const runTimeConfig = useRuntimeConfig();
        const header = getHeader(events, "Authorization");
        const token = header?.split(" ")[1];
        if (!token) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                message: "Unauthorized: No token provided",
            }
        }
        const isValidToken = jwt.verify(
            token,
            runTimeConfig.secretJwtKey as string
        );
        if (!isValidToken) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                message: "Unauthorized: Invalid token",
            }
        }
        const {view, category} = getQuery(events) as { view: string; category?: string };
        const {lastPeriode, currentPeriode} = selectedViewPeriode(view);
        const user = await useNitroApp().redis.get(token);
        if (!user) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                message: "Unauthorized: User not found",
            }
        }
        const dataUser: dataUserRedis = JSON.parse(user);
        const baseQuery: Record<string, any> = { user: dataUser.id };
        if (category && category !== "all") {
            baseQuery.category = category;
        } else if (category === "none") {
            baseQuery.category = { $exists: false };
        }
        const sortQuery = { createdAt: -1 };
        if (view === "All") {
            const all = await transactions
                .find(baseQuery)
                .sort(sortQuery)
                .populate("category");
            setResponseStatus(events, 200);
            return {
                statusCode: 200,
                body: {
                    current: all,
                    last: [],
                },
            };
        }
        const current = await transactions
            .find({ ...baseQuery })
            .sort(sortQuery)
            .gte("createdAt", currentPeriode().start)
            .lte("createdAt", currentPeriode().end)
            .populate("category");
        const last = await transactions
            .find({ ...baseQuery })
            .sort(sortQuery)
            .gte("createdAt", lastPeriode().start)
            .lte("createdAt", lastPeriode().end)
            .populate("category");
        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {
                current,
                last,
            },
        };
    } catch (error) {
        logger.error(`Error in get transaction: ${error}`);
        if (error instanceof Error) {
            if (error.name === "JsonWebTokenError") {
                setResponseStatus(events, 401);
                return {
                    statusCode: 401,
                    message: "Unauthorized: Invalid token",
                }
            } else if (error.name === "TokenExpiredError") {
                setResponseStatus(events, 401);
                return {
                    statusCode: 401,
                    message: "Unauthorized: Token expired",
                }
            } else {
                setResponseStatus(events, 500);
                return {
                    statusCode: 500,
                    message: `Internal Server Error: ${error.message}`,
                }
            }
        } else {
            setResponseStatus(events, 500);
            return {
                statusCode: 500,
                message: "Internal Server Error",
            }
        }
    }
});
