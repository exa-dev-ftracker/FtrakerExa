import jwt from "jsonwebtoken";
import Users from "~/server/model/users";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const token = getCookie(event, "jwt") || getHeader(event, "Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, runtimeConfig.secretJwtKey) as { email: string; name: string; id: string };
    
    const userDoc = await Users.findById(decoded.id).select("email name timezone");

    return {
      statusCode: 200,
      body: {
        user: {
          email: userDoc?.email || decoded.email,
          name: userDoc?.name || decoded.name,
          id: decoded.id,
          timezone: userDoc?.timezone || "UTC",
        }
      }
    };
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid token",
    });
  }
});
