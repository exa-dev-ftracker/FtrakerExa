import transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis } from "~/types";

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
                body: { message: "Unauthorized: No token provided" },
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
                body: { message: "Unauthorized: Invalid token" },
            };
        }

        const user = await useNitroApp().redis.get(token);
        if (!user) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                body: { message: "Unauthorized: User not found in session" },
            };
        }
        const userData: dataUserRedis = JSON.parse(user);

        const query = getQuery(events) as { id?: string };
        if (!query.id) {
            setResponseStatus(events, 400);
            return {
                statusCode: 400,
                body: { message: "Transaction ID is required" },
            };
        }

        const transaction = await transactions
            .findOne({
                _id: query.id,
                user: userData.id,
            })
            .populate("category")
            .populate("linkedIncomeId")
            .lean();

        if (!transaction) {
            setResponseStatus(events, 404);
            return {
                statusCode: 404,
                body: { message: "Transaction not found" },
            };
        }

        let extraDetails: Record<string, any> = {};

        // If income, fetch all expenses funded by this income
        if (transaction.type?.toLowerCase() === "income") {
            const linkedExpenses = await transactions
                .find({
                    linkedIncomeId: transaction._id,
                    user: userData.id,
                })
                .populate("category")
                .sort({ date: -1, createdAt: -1 })
                .lean();

            const totalUsed = linkedExpenses.reduce((sum, item: any) => sum + (item.amount || 0), 0);
            const remainingAmount = transaction.amount - totalUsed;
            const percentageUsed = transaction.amount > 0 ? (totalUsed / transaction.amount) * 100 : 0;

            extraDetails = {
                linkedExpenses: linkedExpenses.map((e: any) => ({
                    ...e,
                    date: e.date || e.createdAt,
                })),
                totalUsed,
                remainingAmount,
                expenseCount: linkedExpenses.length,
                percentageUsed: Number(percentageUsed.toFixed(1)),
            };
        } else if (transaction.linkedIncomeId) {
            // If expense, fetch linked income's burn-down status
            const incomeDoc: any = transaction.linkedIncomeId;
            if (incomeDoc && incomeDoc._id) {
                const siblingExpenses = await transactions
                    .find({
                        linkedIncomeId: incomeDoc._id,
                        user: userData.id,
                    })
                    .lean();

                const totalUsedOnIncome = siblingExpenses.reduce((sum, item: any) => sum + (item.amount || 0), 0);
                const remainingOnIncome = incomeDoc.amount - totalUsedOnIncome;
                const percentageUsedOnIncome = incomeDoc.amount > 0 ? (totalUsedOnIncome / incomeDoc.amount) * 100 : 0;

                extraDetails = {
                    linkedIncomeDetails: {
                        _id: incomeDoc._id,
                        description: incomeDoc.description,
                        amount: incomeDoc.amount,
                        date: incomeDoc.date || incomeDoc.createdAt,
                        totalUsed: totalUsedOnIncome,
                        remainingAmount: remainingOnIncome,
                        expenseCount: siblingExpenses.length,
                        percentageUsed: Number(percentageUsedOnIncome.toFixed(1)),
                    },
                };
            }
        }

        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {
                ...transaction,
                date: (transaction as any).date || (transaction as any).createdAt,
                ...extraDetails,
            },
        };
    } catch (error) {
        logger.error(`Error in get transaction detail: ${error}`);
        setResponseStatus(events, 500);
        return {
            statusCode: 500,
            body: { message: "Internal server error" },
        };
    }
});
