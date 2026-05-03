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

    // Fetch user's WhatsApp settings
    const userDoc = await Users.findById(user.id).select(
      'phone_number chatbot_enabled name email'
    );

    if (!userDoc) {
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
        name: userDoc.name,
        email: userDoc.email,
        phone_number: userDoc.phone_number || null,
        chatbot_enabled: userDoc.chatbot_enabled || false,
      },
    };
  } catch (error) {
    logger.error(`Error fetching user settings: ${(error as Error).message}`);
    setResponseStatus(event, 500);
    return {
      statusCode: 500,
      body: { message: (error as Error).message },
    };
  }
});

