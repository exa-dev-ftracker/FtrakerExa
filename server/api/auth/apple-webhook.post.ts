import users from "~/server/model/users";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";

interface AppleNotificationPayload {
    iss?: string;
    aud?: string;
    iat?: number;
    jti?: string;
    events?: string | {
        type: string;
        sub: string;
        event_time?: number;
    };
}

export default defineEventHandler(async (event) => {
    try {
        let rawBody: any = null;
        try {
            rawBody = await readBody(event);
        } catch {
            try {
                rawBody = await readRawBody(event, "utf-8");
            } catch { }
        }

        let jwtString = "";

        if (typeof rawBody === "object" && rawBody !== null) {
            jwtString = rawBody.payload || rawBody.signedPayload || "";
        } else if (typeof rawBody === "string") {
            try {
                const parsed = JSON.parse(rawBody);
                jwtString = parsed.payload || parsed.signedPayload || rawBody;
            } catch {
                // If it's URL-encoded format: payload=...
                const params = new URLSearchParams(rawBody);
                jwtString = params.get("payload") || params.get("signedPayload") || rawBody;
            }
        }

        if (!jwtString) {
            logger.warn("[Apple Webhook] Received request without JWT payload");
            setResponseStatus(event, 400);
            return { statusCode: 400, message: "Missing payload" };
        }

        const decoded = jwt.decode(jwtString) as AppleNotificationPayload | null;

        if (!decoded) {
            logger.warn("[Apple Webhook] Failed to decode Apple notification JWT");
            setResponseStatus(event, 400);
            return { statusCode: 400, message: "Invalid JWT" };
        }

        let eventsData: { type?: string; sub?: string } = {};

        if (typeof decoded.events === "string") {
            try {
                eventsData = JSON.parse(decoded.events);
            } catch (e) {
                logger.error(`[Apple Webhook] Failed to parse events JSON string: ${e}`);
            }
        } else if (typeof decoded.events === "object" && decoded.events !== null) {
            eventsData = decoded.events;
        }

        const eventType = eventsData.type || "";
        const appleUserId = eventsData.sub || (decoded as any).sub;

        logger.info(`[Apple Webhook] Received event: '${eventType}' for Apple user: '${appleUserId}'`);

        if (!appleUserId) {
            logger.warn("[Apple Webhook] No Apple user identifier (sub) found in event");
            setResponseStatus(event, 200);
            return { statusCode: 200, message: "No sub found, ignored" };
        }

        // Handle account removal / revocation events from Apple
        if (eventType === "consent-revoked" || eventType === "account-delete") {
            const user = await users.findOne({ apple_id: appleUserId });

            if (user) {
                user.apple_id = null;
                user.apple_email = null;
                await user.save();
                logger.info(
                    `[Apple Webhook] Successfully unlinked Apple ID for user '${user.email}' due to event '${eventType}'`
                );
            } else {
                logger.info(`[Apple Webhook] No user found matching Apple ID: ${appleUserId}`);
            }
        } else {
            logger.info(`[Apple Webhook] Unhandled event type: ${eventType}`);
        }

        // Always return 200 OK to Apple to acknowledge receipt
        setResponseStatus(event, 200);
        return { statusCode: 200, message: "Notification handled" };
    } catch (error: any) {
        logger.error(`[Apple Webhook] Error processing notification: ${error.message || error}`);
        setResponseStatus(event, 500);
        return { statusCode: 500, message: "Internal server error" };
    }
});
