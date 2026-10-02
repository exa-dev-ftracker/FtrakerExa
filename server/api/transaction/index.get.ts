import transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import selectedViewPeriode from "~/server/utils/selectedViewPeriode";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis } from "~/types";

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

        const {
            view = "Month",
            category,
            startDate,
            endDate,
            page,
            limit,
            search,
            type,
            sort = "newest",
        } = getQuery(events) as {
            view?: string;
            category?: string;
            startDate?: string;
            endDate?: string;
            page?: string;
            limit?: string;
            search?: string;
            type?: string;
            sort?: string;
        };

        const isPaginated = page !== undefined || limit !== undefined;
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

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

        const { linkedIncomeId } = getQuery(events) as { linkedIncomeId?: string };
        if (linkedIncomeId) {
            baseQuery.linkedIncomeId = linkedIncomeId;
        }

        // Sorting options with stable _id tiebreaker for deterministic pagination
        let sortQuery: Record<string, any> = { date: -1, createdAt: -1, _id: -1 };
        if (sort === "oldest") {
            sortQuery = { date: 1, createdAt: 1, _id: 1 };
        } else if (sort === "highest") {
            sortQuery = { amount: -1, date: -1, createdAt: -1, _id: -1 };
        } else if (sort === "lowest") {
            sortQuery = { amount: 1, date: 1, createdAt: 1, _id: 1 };
        }

        const timezone = await resolveUserTimezone(events, dataUser.id);


        // Apply date range
        if (view === "Custom") {
            if (startDate && endDate) {
                const sStr = String(startDate).split("T")[0];
                const eStr = String(endDate).split("T")[0];
                const s = new Date(`${sStr}T00:00:00.000`);
                const e = new Date(`${eStr}T23:59:59.999`);
                const sUtc = createUtcFromZoned(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0, timezone);
                const eUtc = createUtcFromZoned(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999, timezone);
                baseQuery.$or = [
                    { date: { $gte: sUtc, $lte: eUtc } },
                    { date: { $exists: false }, createdAt: { $gte: sUtc, $lte: eUtc } },
                ];
            }
        } else if (view !== "All") {
            const { currentPeriode } = selectedViewPeriode(view, timezone);
            const period = currentPeriode();
            if (period.start && period.end) {
                baseQuery.$or = [
                    { date: { $gte: period.start, $lte: period.end } },
                    { date: { $exists: false }, createdAt: { $gte: period.start, $lte: period.end } },
                ];
            }
        }


        // Paginated mode (used by infinite scroll in transactions page)
        if (isPaginated) {
            const total = await transactions.countDocuments(baseQuery);
            const currentDocs = await transactions
                .find(baseQuery)
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum)
                .populate("category")
                .populate("linkedIncomeId", "description amount date type");

            const current = currentDocs.map((t) => {
                const obj = t.toObject ? t.toObject() : { ...t };
                if (obj.date && obj.createdAt && String(obj.date).includes("2026-09-28T23:32:05") && !String(obj.createdAt).includes("2026-09-28T23:32:05")) {
                    obj.date = obj.createdAt;
                }
                return obj;
            });

            const totalPages = Math.ceil(total / limitNum);
            const hasMore = pageNum < totalPages;

            setResponseStatus(events, 200);
            return {
                statusCode: 200,
                body: {
                    current,
                    last: [],
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages,
                        hasMore,
                    },
                },
            };
        }

        // Legacy / Unpaginated mode (used by Dashboard and Analytics)
        if (view === "Custom" || view === "All") {
            const current = await transactions
                .find(baseQuery)
                .sort(sortQuery)
                .populate("category")
                .populate("linkedIncomeId", "description amount date type");

            setResponseStatus(events, 200);
            return {
                statusCode: 200,
                body: {
                    current,
                    last: [],
                },
            };
        }

        // Periodic comparison for Dashboard (current vs last period)
        const { lastPeriode, currentPeriode } = selectedViewPeriode(view, timezone);
        const currP = currentPeriode();
        const lastP = lastPeriode();
        const currentQuery: Record<string, any> = { ...baseQuery };
        if (currP.start && currP.end) {
            currentQuery.$or = [
                { date: { $gte: currP.start, $lte: currP.end } },
                { date: { $exists: false }, createdAt: { $gte: currP.start, $lte: currP.end } },
            ];
        }
        const lastQuery: Record<string, any> = { ...baseQuery };
        if (lastP.start && lastP.end) {
            lastQuery.$or = [
                { date: { $gte: lastP.start, $lte: lastP.end } },
                { date: { $exists: false }, createdAt: { $gte: lastP.start, $lte: lastP.end } },
            ];
        }

        const current = await transactions
            .find(currentQuery)
            .sort(sortQuery)
            .populate("category")
            .populate("linkedIncomeId", "description amount date type");

        const last = await transactions
            .find(lastQuery)
            .sort(sortQuery)
            .populate("category")
            .populate("linkedIncomeId", "description amount date type");


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
