import Category from "~/server/model/category";
import transactions from "~/server/model/transactions";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import type { dataUserRedis } from "~/types";
import { broadcastToUser } from "~/server/utils/wsPeerManager";

export default defineEventHandler(async (events) => {
  try {
    const runTimeConfig = useRuntimeConfig();
    const header = getHeader(events, "Authorization");
    const token = header?.split(" ")[1];
    if (!token) {
      setResponseStatus(events, 401);
      return { statusCode: 401, body: { message: "Unauthorized" } };
    }
    jwt.verify(token, runTimeConfig.secretJwtKey as string);
    const user = await useNitroApp().redis.get(token);
    if (!user) {
      setResponseStatus(events, 401);
      return { statusCode: 401, body: { message: "Unauthorized" } };
    }
    const dataUser: dataUserRedis = JSON.parse(user);
    const body = await readBody<{ _id: string }>(events);
    if (!body || !body._id) {
      setResponseStatus(events, 400);
      return { statusCode: 400, body: { message: "Category _id is required" } };
    }
    const category = await Category.findOne({ _id: body._id, user: dataUser.id });
    if (!category) {
      setResponseStatus(events, 404);
      return { statusCode: 404, body: { message: "Category not found" } };
    }
    await transactions.updateMany(
      { user: dataUser.id, category: body._id },
      { $unset: { category: "" } }
    );
    await Category.deleteOne({ _id: body._id });
    broadcastToUser(dataUser.id, "category:changed", { action: "deleted", _senderClientId: getHeader(events, "x-client-id") || "" });
    setResponseStatus(events, 200);
    return { statusCode: 200, body: { message: "Category deleted" } };
  } catch (error) {
    logger.error(`Error in deleting category: ${error}`);
    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        setResponseStatus(events, 401);
        return { statusCode: 401, body: { message: "Unauthorized" } };
      }
    }
    setResponseStatus(events, 500);
    return { statusCode: 500, body: { message: "Internal Server Error" } };
  }
});
