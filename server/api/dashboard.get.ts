import transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import selectedViewPeriode from "~/server/utils/selectedViewPeriode";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis, TopExpenseItem } from "~/types";

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

        // Fetch transactions for the active period sorted by newest first
        const allTransactions = await transactions
            .find(baseQuery)
            .sort({ createdAt: -1 })
            .populate("category")
            .lean();

        let incomeTotal = 0;
        let expenseTotal = 0;

        const expenseCategoryMap: Record<
            string,
            { name: string; amount: number; color?: string; icon?: string }
        > = {};

        for (const t of allTransactions) {
            const isIncome = t.type?.toLowerCase() === "income";
            const amount = t.amount || 0;

            if (isIncome) {
                incomeTotal += amount;
            } else {
                expenseTotal += amount;
                const cat = t.category && typeof t.category === "object" ? (t.category as any) : null;
                const catName = cat?.name || "General";
                if (!expenseCategoryMap[catName]) {
                    expenseCategoryMap[catName] = {
                        name: catName,
                        amount: 0,
                        color: cat?.color || "#6b7280",
                        icon: cat?.icon || "i-heroicons-tag",
                    };
                }
                expenseCategoryMap[catName].amount += amount;
            }
        }

        const balance = incomeTotal - expenseTotal;
        const transactionCount = allTransactions.length;

        // Top 5 spending categories
        const topExpenses: TopExpenseItem[] = Object.values(expenseCategoryMap)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((item) => ({
                ...item,
                percentage: expenseTotal > 0 ? Math.round((item.amount / expenseTotal) * 100) : 0,
            }));

        // Recent 8 transactions
        const recentTransactions = allTransactions.slice(0, 8);

        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {
                metrics: {
                    balance,
                    incomeTotal,
                    expenseTotal,
                    transactionCount,
                },
                recentTransactions,
                topExpenses,
            },
        };
    } catch (error) {
        logger.error(`Error in get dashboard data: ${error}`);
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
