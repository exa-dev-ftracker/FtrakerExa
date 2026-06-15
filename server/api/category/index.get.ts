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
      return { statusCode: 401, message: "Unauthorized: No token provided" };
    }
    jwt.verify(token, runTimeConfig.secretJwtKey as string);
    const user = await useNitroApp().redis.get(token);
    if (!user) {
      setResponseStatus(events, 401);
      return { statusCode: 401, message: "Unauthorized: User not found" };
    }
    const dataUser: dataUserRedis = JSON.parse(user);
    const categories = await Category.find({ user: dataUser.id }).sort({ name: 1 });
    setResponseStatus(events, 200);
    return { statusCode: 200, body: categories };
  } catch (error) {
    logger.error(`Error in get categories: ${error}`);
    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        setResponseStatus(events, 401);
        return { statusCode: 401, message: "Unauthorized" };
      }
    }
    setResponseStatus(events, 500);
    return { statusCode: 500, message: "Internal Server Error" };
  }
});
