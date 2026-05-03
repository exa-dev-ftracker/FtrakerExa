import Users from "~/server/model/users";
import { normalizePhoneNumber, isValidPhoneNumber } from "~/server/utils/phoneValidator";
import logger from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  try {
    // Get JWT token from cookies
    const token = getCookie(event, "jwt");
    if (!token) {
      setResponseStatus(event, 401);
      return {
        statusCode: 401,
        body: { message: "Unauthorized" },
      };
    }

    // Verify token and get user from Redis
    const runtimeConfig = useRuntimeConfig();
    const redis = useNitroApp().redis;
    const userData = await redis.get(token);

    if (!userData) {
      setResponseStatus(event, 401);
      return {
        statusCode: 401,
        body: { message: "Session expired" },
      };
    }

    const user = JSON.parse(userData as string);

    // Read request body
    const body = await readBody<{ phone_number: string }>(event);

    if (!body.phone_number) {
      setResponseStatus(event, 400);
      return {
        statusCode: 400,
        body: { message: "phone_number is required" },
      };
    }

    // Normalize phone number
    const normalizedNumber = normalizePhoneNumber(body.phone_number);

    if (!normalizedNumber || !isValidPhoneNumber(normalizedNumber)) {
      setResponseStatus(event, 400);
      return {
        statusCode: 400,
        body: {
          message: "Invalid phone number. Must start with country code (62) and be numeric."
        },
      };
    }

    // Update user with new phone number
    const updatedUser = await Users.findByIdAndUpdate(
      user.id,
      { phone_number: normalizedNumber },
      { new: true }
    );

    if (!updatedUser) {
      setResponseStatus(event, 404);
      return {
        statusCode: 404,
        body: { message: "User not found" },
      };
    }

    logger.info(`User ${user.id} updated phone number to ${normalizedNumber}`);

    setResponseStatus(event, 200);
    return {
      statusCode: 200,
      body: {
        message: "Phone number updated successfully",
        phone_number: normalizedNumber,
      },
    };
  } catch (error) {
    logger.error(`Error updating phone number: ${(error as Error).message}`);
    setResponseStatus(event, 500);
    return {
      statusCode: 500,
      body: { message: (error as Error).message },
    };
  }
});

