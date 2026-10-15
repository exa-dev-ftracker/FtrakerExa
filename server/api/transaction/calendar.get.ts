import transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis } from "~/types";
import { resolveUserTimezone, createUtcFromZoned } from "~/server/utils/timezone";

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
      from,
      to,
      startDate,
      endDate,
      category,
      type,
      search,
    } = getQuery(events) as {
      from?: string;
      to?: string;
      startDate?: string;
      endDate?: string;
      category?: string;
      type?: string;
      search?: string;
    };

    const timezone = await resolveUserTimezone(events, dataUser.id);
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

    const rawFrom = from || startDate;
    const rawTo = to || endDate;

    let sUtc: Date;
    let eUtc: Date;

    if (rawFrom && rawTo) {
      const sStr = String(rawFrom).split("T")[0];
      const eStr = String(rawTo).split("T")[0];
      const sParts = sStr.split("-").map(Number);
      const eParts = eStr.split("-").map(Number);
      sUtc = createUtcFromZoned(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0, timezone);
      eUtc = createUtcFromZoned(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999, timezone);
    } else {
      // Default to current month if no from/to provided
      const now = new Date();
      const sParts = [now.getFullYear(), now.getMonth(), 1];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      sUtc = createUtcFromZoned(sParts[0], sParts[1], 1, 0, 0, 0, 0, timezone);
      eUtc = createUtcFromZoned(sParts[0], sParts[1], lastDay, 23, 59, 59, 999, timezone);
    }

    baseQuery.$or = [
      { date: { $gte: sUtc, $lte: eUtc } },
      { date: { $exists: false }, createdAt: { $gte: sUtc, $lte: eUtc } },
    ];

    const rawDocs = await transactions
      .find(baseQuery)
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .populate("category")
      .populate("linkedIncomeId", "description amount date type")
      .lean();

    const items = rawDocs.map((t: any) => ({
      ...t,
      date: t.date || t.createdAt,
    }));

    let totalIncome = 0;
    let totalExpense = 0;
    for (const item of items) {
      const t = String(item.type || "").toLowerCase();
      if (t === "income") {
        totalIncome += item.amount || 0;
      } else {
        totalExpense += item.amount || 0;
      }
    }

    setResponseStatus(events, 200);
    return {
      statusCode: 200,
      body: {
        items,
        total: items.length,
        from: rawFrom || sUtc.toISOString().split("T")[0],
        to: rawTo || eUtc.toISOString().split("T")[0],
        summary: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          count: items.length,
        },
      },
    };
  } catch (error) {
    logger.error(`Error in get calendar transactions: ${error}`);
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
      }
    }
    setResponseStatus(events, 500);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
});
