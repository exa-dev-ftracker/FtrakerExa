import Category from "~/server/model/category";
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
    const body = await readBody<{ _id: string; name?: string; type?: string; color?: string; icon?: string }>(events);
    if (!body || !body._id) {
      setResponseStatus(events, 400);
      return { statusCode: 400, body: { message: "Category _id is required" } };
    }
    const category = await Category.findOne({ _id: body._id, user: dataUser.id });
    if (!category) {
      setResponseStatus(events, 404);
      return { statusCode: 404, body: { message: "Category not found" } };
    }
    if (body.name !== undefined) category.name = body.name.trim();
    if (body.type !== undefined) category.type = body.type;
    if (body.color !== undefined) category.color = body.color;
    if (body.icon !== undefined) category.icon = body.icon;
    await category.save();
    broadcastToUser(dataUser.id, "category:changed", { action: "updated" });
    setResponseStatus(events, 200);
    return { statusCode: 200, body: category };
  } catch (error) {
    logger.error(`Error in updating category: ${error}`);
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
