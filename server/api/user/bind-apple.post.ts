import Users from "~/server/model/users";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";

interface AppleTokenPayload {
    sub?: string;
    email?: string;
}

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

        // Verify account has an email or linked Google account
        if (!user.email && !user.google_id) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: {
                    message: "Account must have an email or be connected with Google first.",
                },
            };
        }

        const body = await readBody<{
            identityToken: string;
            email?: string | null;
        }>(event);

        if (!body?.identityToken) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "Identity token is required" },
            };
        }

        const decoded = jwt.decode(body.identityToken) as AppleTokenPayload | null;
        if (!decoded || !decoded.sub) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "Invalid Apple identity token" },
            };
        }

        const appleUserId = decoded.sub;
        const resolvedEmail = decoded.email || body.email || user.email;

        // Ensure Apple ID is not already linked to another account
        const existingAppleUser = await Users.findOne({ apple_id: appleUserId });
        if (existingAppleUser && existingAppleUser._id.toString() !== user._id.toString()) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "This Apple ID is already linked to another FTraker account." },
            };
        }

        user.apple_id = appleUserId;
        user.apple_email = resolvedEmail;
        await user.save();

        logger.info(`[Apple Bind] User ${user.email} successfully linked Apple ID: ${appleUserId}`);

        setResponseStatus(event, 200);
        return {
            statusCode: 200,
            body: {
                message: "Apple ID linked to your account successfully.",
                apple_id: user.apple_id,
                apple_email: user.apple_email,
                is_apple_linked: true,
            },
        };
    } catch (error: any) {
        logger.error(`[Apple Bind] Error: ${error.message || error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: { message: error.message || "Failed to bind Apple ID" },
        };
    }
});
