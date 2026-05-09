import jwt from "jsonwebtoken";

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
    
    // Return user data from decoded token or Redis if needed
    // For now, token payload is enough
    return {
      statusCode: 200,
      body: {
        user: {
          email: decoded.email,
          name: decoded.name,
          id: decoded.id
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
