import transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import selectedViewPeriode from "~/server/utils/selectedViewPeriode";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis } from "~/types";
import mongoose from "mongoose";

// Ensure Category model is registered for populate
const _registerCategory = Category;

interface CursorPayload {
    id: string;
    date?: string;
    amount?: number;
}

function decodeCursor(token?: string): CursorPayload | null {
    if (!token) return null;
    try {
        const json = Buffer.from(token, "base64url").toString("utf-8");
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function encodeCursor(payload: CursorPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

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
            cursor,
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
            cursor?: string;
            search?: string;
            type?: string;
            sort?: string;
        };

        const isPaginated = page !== undefined || limit !== undefined || cursor !== undefined;
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

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

        // Clone baseQuery for accurate total count before cursor constraints
        const countQuery = { ...baseQuery };

        // Parse and apply cursor condition if present
        const parsedCursor = decodeCursor(cursor);
        if (parsedCursor && parsedCursor.id && mongoose.Types.ObjectId.isValid(parsedCursor.id)) {
            const cursorId = new mongoose.Types.ObjectId(parsedCursor.id);
            const cursorDate = parsedCursor.date ? new Date(parsedCursor.date) : null;
            const cursorAmount = parsedCursor.amount !== undefined ? Number(parsedCursor.amount) : null;

            let cursorCondition: any = null;
            if (sort === "oldest") {
                if (cursorDate && !isNaN(cursorDate.getTime())) {
                    cursorCondition = {
                        $or: [
                            { date: { $gt: cursorDate } },
                            { date: cursorDate, _id: { $gt: cursorId } },
                        ],
                    };
                } else {
                    cursorCondition = { _id: { $gt: cursorId } };
                }
            } else if (sort === "highest") {
                if (cursorAmount !== null && !isNaN(cursorAmount)) {
                    cursorCondition = {
                        $or: [
                            { amount: { $lt: cursorAmount } },
                            { amount: cursorAmount, _id: { $lt: cursorId } },
                        ],
                    };
                } else {
                    cursorCondition = { _id: { $lt: cursorId } };
                }
            } else if (sort === "lowest") {
                if (cursorAmount !== null && !isNaN(cursorAmount)) {
                    cursorCondition = {
                        $or: [
                            { amount: { $gt: cursorAmount } },
                            { amount: cursorAmount, _id: { $gt: cursorId } },
                        ],
                    };
                } else {
                    cursorCondition = { _id: { $gt: cursorId } };
                }
            } else {
                // newest
                if (cursorDate && !isNaN(cursorDate.getTime())) {
                    cursorCondition = {
                        $or: [
                            { date: { $lt: cursorDate } },
                            { date: cursorDate, _id: { $lt: cursorId } },
                        ],
                    };
                } else {
                    cursorCondition = { _id: { $lt: cursorId } };
                }
            }

            if (cursorCondition) {
                if (!baseQuery.$and) {
                    baseQuery.$and = [];
                }
                baseQuery.$and.push(cursorCondition);
            }
        }

        // Paginated mode (used by infinite scroll in transactions page)
        if (isPaginated) {
            const total = await transactions.countDocuments(countQuery);
            let rawDocs: any[] = [];

            if (parsedCursor) {
                // Cursor pagination seek: limitNum + 1 (no skip)
                rawDocs = await transactions
                    .find(baseQuery)
                    .sort(sortQuery)
                    .limit(limitNum + 1)
                    .populate("category")
                    .populate("linkedIncomeId", "description amount date type");
            } else {
                // First page or fallback offset: limitNum + 1
                const skip = (pageNum - 1) * limitNum;
                rawDocs = await transactions
                    .find(baseQuery)
                    .sort(sortQuery)
                    .skip(skip)
                    .limit(limitNum + 1)
                    .populate("category")
                    .populate("linkedIncomeId", "description amount date type");
            }

            const hasMore = rawDocs.length > limitNum;
            const currentDocs = hasMore ? rawDocs.slice(0, limitNum) : rawDocs;

            let nextCursor: string | null = null;
            if (hasMore && currentDocs.length > 0) {
                const lastItem = currentDocs[currentDocs.length - 1];
                const rawD = lastItem.date || lastItem.createdAt;
                nextCursor = encodeCursor({
                    id: String(lastItem._id),
                    date: rawD ? new Date(rawD).toISOString() : undefined,
                    amount: lastItem.amount,
                });
            }

            const current = currentDocs.map((t) => {
                const obj = t.toObject ? t.toObject() : { ...t };
                if (obj.date && obj.createdAt && String(obj.date).includes("2026-09-28T23:32:05") && !String(obj.createdAt).includes("2026-09-28T23:32:05")) {
                    obj.date = obj.createdAt;
                }
                return obj;
            });

            const totalPages = Math.ceil(total / limitNum);

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
                        nextCursor,
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
