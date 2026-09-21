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
            const parsed = JSON.parse(userData as string);
            userId = parsed.id;
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

        const user = await Users.findById(userId);
        if (!user) {
            setResponseStatus(event, 404);
            return {
                statusCode: 404,
                body: { message: "User not found" },
            };
        }

        if (!user.apple_id) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "Your account is not linked to an Apple ID." },
            };
        }

        // Security: Ensure user has another authentication method (Google or Password) to avoid lockout
        if (!user.google_id && !user.password) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: {
                    message: "Cannot unbind Apple ID. Please link your Google account or set a password first to prevent losing account access.",
                },
            };
        }

        user.apple_id = null;
        user.apple_email = null;
        await user.save();

        logger.info(`[Apple Unbind] User ${user.email} successfully unlinked Apple ID`);

        setResponseStatus(event, 200);
        return {
            statusCode: 200,
            body: {
                message: "Apple ID unlinked from your account successfully.",
                is_apple_linked: false,
                apple_id: null,
                apple_email: null,
            },
        };
    } catch (error: any) {
        logger.error(`[Apple Unbind] Error: ${error.message || error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: { message: error.message || "Failed to unbind Apple ID" },
        };
    }
});
