import Category from "~/server/model/category";
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
      return { statusCode: 401, body: { message: "Unauthorized" } };
    }
    jwt.verify(token, runTimeConfig.secretJwtKey as string);
    const user = await useNitroApp().redis.get(token);
    if (!user) {
      setResponseStatus(events, 401);
      return { statusCode: 401, body: { message: "Unauthorized" } };
    }
    const dataUser: dataUserRedis = JSON.parse(user);
    const body = await readBody<{ name: string; type?: string; color?: string; icon?: string }>(events);
    if (!body || !body.name || !body.name.trim()) {
      setResponseStatus(events, 400);
      return { statusCode: 400, body: { message: "Category name is required" } };
    }
    const existing = await Category.findOne({ user: dataUser.id, name: body.name.trim() });
    if (existing) {
      setResponseStatus(events, 409);
      return { statusCode: 409, body: { message: "Category already exists" } };
    }
    const category = new Category({
      user: dataUser.id,
      name: body.name.trim(),
      type: body.type || null,
      color: body.color || "#6366f1",
      icon: body.icon || "i-heroicons-tag",
    });
    await category.save();
    setResponseStatus(events, 201);
    return { statusCode: 201, body: category };
  } catch (error) {
    logger.error(`Error in creating category: ${error}`);
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
