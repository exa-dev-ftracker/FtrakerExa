import Users from "~/server/model/users";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  try {
    // Get JWT token from cookies or Authorization header
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

    // Verify token from Redis or fallback to JWT decode
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

    // Fetch user details including OAuth connection info
    const userDoc = await Users.findById(userId).select(
      'phone_number chatbot_enabled name email google_id google_email apple_id apple_email password'
    );

    if (!userDoc) {
      setResponseStatus(event, 404);
      return {
        statusCode: 404,
        body: { message: "User not found" },
      };
    }

    // Determine if the user was originally registered via Apple (e.g. has Apple ID and no password / relay email)
    const isAppleRegistered = Boolean(
      userDoc.apple_id && (!userDoc.password || userDoc.email?.includes('privaterelay.appleid.com'))
    );

    // If user is NOT registered via Apple (registered via Email/Password or direct Google),
    // Google account is already fixed to their verified primary email.
    const isGoogleLinked = isAppleRegistered ? Boolean(userDoc.google_id) : true;
    const googleEmail = userDoc.google_email || (!isAppleRegistered ? userDoc.email : null);

    setResponseStatus(event, 200);
    return {
      statusCode: 200,
      body: {
        name: userDoc.name,
        email: userDoc.email,
        phone_number: userDoc.phone_number || null,
        chatbot_enabled: userDoc.chatbot_enabled || false,
        google_id: userDoc.google_id || null,
        google_email: googleEmail,
        is_google_linked: isGoogleLinked,
        is_apple_registered: isAppleRegistered,
        apple_id: userDoc.apple_id || null,
        apple_email: userDoc.apple_email || null,
        is_apple_linked: Boolean(userDoc.apple_id),
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

