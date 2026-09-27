import Users from "~/server/model/users";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const token = getCookie(event, "jwt") || getHeader(event, "Authorization")?.replace("Bearer ", "");
    if (!token) {
      setResponseStatus(event, 401);
      return {
        statusCode: 401,
        body: { message: "Unauthorized" },
      };
    }

    let userId = "";
    const redis = useNitroApp().redis;
    const userData = await redis.get(token);

    if (userData) {
      const user = JSON.parse(userData as string);
      userId = user.id;
    } else {
      try {
        const decoded: any = jwt.verify(token, runtimeConfig.secretJwtKey);
        userId = decoded.id;
      } catch {
        setResponseStatus(event, 401);
        return {
          statusCode: 401,
          body: { message: "Session expired" },
        };
      }
    }

    const body = await readBody(event);
    const timezone = body?.timezone;
    if (!timezone || typeof timezone !== "string") {
      setResponseStatus(event, 400);
      return {
        statusCode: 400,
        body: { message: "Valid timezone string is required" },
      };
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { timezone },
      { new: true }
    );

    if (!updatedUser) {
      setResponseStatus(event, 404);
      return {
        statusCode: 404,
        body: { message: "User not found" },
      };
    }

    setResponseStatus(event, 200);
    return {
      statusCode: 200,
      body: {
        message: "Timezone updated successfully",
        timezone: updatedUser.timezone,
      },
    };
  } catch (error: any) {
    logger.error(`Error updating timezone: ${error.message || error}`);
    setResponseStatus(event, 500);
    return {
      statusCode: 500,
      body: { message: error.message || "Failed to update timezone" },
    };
  }
});
