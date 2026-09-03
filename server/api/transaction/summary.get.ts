import transactions from "~/server/model/transactions";
import selectedViewPeriode from "~/server/utils/selectedViewPeriode";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis } from "~/types";

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
                message: "Unauthorized: Invalid token",
            };
        }

        const user = await useNitroApp().redis.get(token);
        if (!user) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                message: "Unauthorized: User not found",
            };
        }

        const dataUser: dataUserRedis = JSON.parse(user);
        const { view = "Month", category, startDate, endDate, search, type } = getQuery(events) as {
            view?: string;
            category?: string;
            startDate?: string;
            endDate?: string;
            search?: string;
            type?: string;
        };

        const baseQuery: Record<string, any> = { user: dataUser.id };

        if (category && category !== "all") {
            if (category === "none") {
                baseQuery.category = { $exists: false };
            } else {
                baseQuery.category = category;
            }
        }

        if (type && type !== "All") {
            baseQuery.type = { $regex: new RegExp(`^${type}$`, "i") };
        }

        if (search && search.trim()) {
            baseQuery.description = { $regex: search.trim(), $options: "i" };
        }

        // Apply date filters based on view
        if (view === "Custom") {
            if (startDate && endDate) {
                baseQuery.createdAt = {
                    $gte: new Date(`${startDate}T00:00:00.000Z`),
                    $lte: new Date(`${endDate}T23:59:59.999Z`),
                };
            }
        } else if (view !== "All") {
            const { currentPeriode } = selectedViewPeriode(view);
            const period = currentPeriode();
            if (period.start && period.end) {
                baseQuery.createdAt = {
                    $gte: period.start,
                    $lte: period.end,
                };
            }
        }

        const items = await transactions.find(baseQuery).select("amount type").lean();

        let totalIncome = 0;
        let totalExpense = 0;
        let incomeCount = 0;
        let expenseCount = 0;

        for (const item of items) {
            const t = item.type?.toLowerCase();
            if (t === "income") {
                totalIncome += item.amount || 0;
                incomeCount++;
            } else {
                totalExpense += item.amount || 0;
                expenseCount++;
            }
        }

        const balance = totalIncome - totalExpense;
        const totalCount = items.length;

        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {
                totalIncome,
                totalExpense,
                balance,
                totalCount,
                incomeCount,
                expenseCount,
            },
        };
    } catch (error) {
        logger.error(`Error in get transaction summary: ${error}`);
        if (error instanceof Error) {
            if (error.name === "JsonWebTokenError") {
                setResponseStatus(events, 401);
                return {
                    statusCode: 401,
                    message: "Unauthorized: Invalid token",
                };
            } else if (error.name === "TokenExpiredError") {
                setResponseStatus(events, 401);
                return {
                    statusCode: 401,
                    message: "Unauthorized: Token expired",
                };
            } else {
                setResponseStatus(events, 500);
                return {
                    statusCode: 500,
                    message: `Internal Server Error: ${error.message}`,
                };
            }
        } else {
            setResponseStatus(events, 500);
            return {
                statusCode: 500,
                message: "Internal Server Error",
            };
        }
    }
});
