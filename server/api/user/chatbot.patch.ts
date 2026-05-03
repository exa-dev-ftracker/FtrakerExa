import Users from "~/server/model/users";
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
    const body = await readBody<{ chatbot_enabled: boolean }>(event);

    if (typeof body.chatbot_enabled !== 'boolean') {
      setResponseStatus(event, 400);
      return {
        statusCode: 400,
        body: { message: "chatbot_enabled must be a boolean value" },
      };
    }

    // Check if user has phone number registered
    const userDoc = await Users.findById(user.id);
    if (!userDoc || !userDoc.phone_number) {
      setResponseStatus(event, 400);
      return {
        statusCode: 400,
        body: { message: "Please register your WhatsApp phone number first" },
      };
    }

    // Update user with new chatbot status
    const updatedUser = await Users.findByIdAndUpdate(
      user.id,
      { chatbot_enabled: body.chatbot_enabled },
      { new: true }
    );

    if (!updatedUser) {
      setResponseStatus(event, 404);
      return {
        statusCode: 404,
        body: { message: "User not found" },
      };
    }

    const status = body.chatbot_enabled ? "enabled" : "disabled";
    logger.info(`User ${user.id} ${status} WhatsApp chatbot`);

    setResponseStatus(event, 200);
    return {
      statusCode: 200,
      body: {
        message: `WhatsApp chatbot ${status} successfully`,
        chatbot_enabled: body.chatbot_enabled,
      },
    };
  } catch (error) {
    logger.error(`Error updating chatbot status: ${(error as Error).message}`);
    setResponseStatus(event, 500);
    return {
      statusCode: 500,
      body: { message: (error as Error).message },
    };
  }
});

