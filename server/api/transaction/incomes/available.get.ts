import transactions from "~/server/model/transactions";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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
                body: { message: "Unauthorized" },
            };
        }
        const isValidToken = jwt.verify(token, runTimeConfig.secretJwtKey as string);
        if (!isValidToken) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                body: { message: "Unauthorized" },
            };
        }
        const user = await useNitroApp().redis.get(token);
        if (!user) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                body: { message: "Unauthorized" },
            };
        }
        const userData: dataUserRedis = JSON.parse(user);

        const queryParams = getQuery(events) as { page?: string; limit?: string; search?: string };
        const pageNum = Math.max(1, parseInt(queryParams.page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(queryParams.limit as string) || 10));
        const skip = (pageNum - 1) * limitNum;

        const filter: Record<string, any> = {
            user: userData.id,
            type: { $regex: /^income$/i },
        };

        if (queryParams.search && String(queryParams.search).trim()) {
            filter.description = { $regex: String(queryParams.search).trim(), $options: "i" };
        }

        const total = await transactions.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);
        const hasMore = pageNum < totalPages;

        // Fetch user's incomes with pagination
        const incomes = await transactions.find(filter)
            .populate("category")
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const incomeIds = incomes.map((inc) => inc._id);
        const expenseAggregations = await transactions.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userData.id),
                    linkedIncomeId: { $in: incomeIds },
                    type: { $regex: /^expense$/i },
                },
            },
            {
                $group: {
                    _id: "$linkedIncomeId",
                    totalUsed: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const expenseMap = new Map<string, { totalUsed: number; count: number }>();
        for (const item of expenseAggregations) {
            expenseMap.set(String(item._id), {
                totalUsed: item.totalUsed || 0,
                count: item.count || 0,
            });
        }

        const result = incomes.map((inc: any) => {
            const usage = expenseMap.get(String(inc._id)) || { totalUsed: 0, count: 0 };
            const remaining = inc.amount - usage.totalUsed;
            const percentage = inc.amount > 0 ? (usage.totalUsed / inc.amount) * 100 : 0;

            return {
                ...inc,
                date: inc.date || inc.createdAt,
                totalUsed: usage.totalUsed,
                remainingAmount: remaining,
                expenseCount: usage.count,
                percentageUsed: Number(percentage.toFixed(1)),
            };
        });

        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {
                incomes: result,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasMore,
                },
            },
        };
    } catch (error) {
        logger.error(`Error in getting available incomes: ${error}`);
        setResponseStatus(events, 500);
        return {
            statusCode: 500,
            body: { message: "Internal server error" },
        };
    }
});
