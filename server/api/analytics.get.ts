import transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import selectedViewPeriode from "~/server/utils/selectedViewPeriode";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis, CategoryBreakdown } from "~/types";

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
        const { view = "Month" } = getQuery(events) as { view?: string };

        const { currentPeriode } = selectedViewPeriode(view);
        const period = currentPeriode();

        const baseQuery: Record<string, any> = { user: dataUser.id };
        if (period.start && period.end) {
            baseQuery.createdAt = {
                $gte: period.start,
                $lte: period.end,
            };
        }

        const allTransactions = await transactions
            .find(baseQuery)
            .sort({ createdAt: -1 })
            .populate("category")
            .lean();

        let incomeTotal = 0;
        let expenseTotal = 0;
        let largestTransaction = 0;

        const incomeCatMap: Record<
            string,
            { name: string; amount: number; color?: string; icon?: string }
        > = {};
        const expenseCatMap: Record<
            string,
            { name: string; amount: number; color?: string; icon?: string }
        > = {};

        for (const t of allTransactions) {
            const isIncome = t.type?.toLowerCase() === "income";
            const amount = t.amount || 0;

            if (amount > largestTransaction) {
                largestTransaction = amount;
            }

            const cat = t.category && typeof t.category === "object" ? (t.category as any) : null;
            const catName = cat?.name || "General";

            if (isIncome) {
                incomeTotal += amount;
                if (!incomeCatMap[catName]) {
                    incomeCatMap[catName] = {
                        name: catName,
                        amount: 0,
                        color: cat?.color || "#10b981",
                        icon: cat?.icon || "i-heroicons-tag",
                    };
                }
                incomeCatMap[catName].amount += amount;
            } else {
                expenseTotal += amount;
                if (!expenseCatMap[catName]) {
                    expenseCatMap[catName] = {
                        name: catName,
                        amount: 0,
                        color: cat?.color || "#f43f5e",
                        icon: cat?.icon || "i-heroicons-tag",
                    };
                }
                expenseCatMap[catName].amount += amount;
            }
        }

        const transactionCount = allTransactions.length;
        const netSavings = incomeTotal - expenseTotal;
        const averageTransaction =
            transactionCount > 0
                ? Math.round((incomeTotal + expenseTotal) / transactionCount)
                : 0;

        const incomeByCategory: CategoryBreakdown[] = Object.values(incomeCatMap)
            .sort((a, b) => b.amount - a.amount)
            .map((item) => ({
                ...item,
                percentage:
                    incomeTotal > 0
                        ? Math.round((item.amount / incomeTotal) * 100)
                        : 0,
            }));

        const expenseByCategory: CategoryBreakdown[] = Object.values(expenseCatMap)
            .sort((a, b) => b.amount - a.amount)
            .map((item) => ({
                ...item,
                percentage:
                    expenseTotal > 0
                        ? Math.round((item.amount / expenseTotal) * 100)
                        : 0,
            }));

        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {
                metrics: {
                    incomeTotal,
                    expenseTotal,
                    netSavings,
                    transactionCount,
                    averageTransaction,
                    largestTransaction,
                },
                incomeByCategory,
                expenseByCategory,
            },
        };
    } catch (error) {
        logger.error(`Error in get analytics data: ${error}`);
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
