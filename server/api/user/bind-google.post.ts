import Users from "~/server/model/users";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import logger from "~/server/utils/logger";

interface GoogleDecoded {
    email: string;
    email_verified: boolean;
    name: string;
    sub: string;
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

        const body = await readBody<{ credential: string }>(event);
        if (!body?.credential) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "Google credential is required" },
            };
        }

        const client = new OAuth2Client(runtimeConfig.google.clientId);
        const ticket = await client.verifyIdToken({
            idToken: body.credential,
            audience: runtimeConfig.google.clientId,
        });

        const { email, email_verified, sub } = ticket.getPayload() as GoogleDecoded;

        if (!email_verified) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "Google email is not verified" },
            };
        }

        // Check if this Google account is already linked to another user
        const existingUser = await Users.findOne({ google_id: sub });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "This Google account is already linked to another FTraker account." },
            };
        }

        user.google_id = sub;
        user.google_email = email;
        await user.save();

        logger.info(`[Google Bind] User ${user.email} successfully linked Google account: ${email}`);

        setResponseStatus(event, 200);
        return {
            statusCode: 200,
            body: {
                message: "Google account linked successfully.",
                google_id: user.google_id,
                google_email: user.google_email,
                is_google_linked: true,
            },
        };
    } catch (error: any) {
        logger.error(`[Google Bind] Error: ${error.message || error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: { message: error.message || "Failed to bind Google account" },
        };
    }
});
