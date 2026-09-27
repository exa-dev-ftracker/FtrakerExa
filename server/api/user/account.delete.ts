import Users from "~/server/model/users";
import Transactions from "~/server/model/transactions";
import Category from "~/server/model/category";
import Token from "~/server/model/token";
import ResetToken from "~/server/model/resetToken";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";

export default defineEventHandler(async (events) => {
    try {
        const runTimeConfig = useRuntimeConfig();
        const authHeader = getHeader(events, "Authorization");
        const token = authHeader?.split(" ")[1] || getCookie(events, "jwt");

        if (!token) {
            setResponseStatus(events, 401);
            return {
                statusCode: 401,
                body: { message: "Unauthorized. Please log in to delete your account." },
            };
        }

        let userId = "";
        try {
            const decoded: any = jwt.verify(token, runTimeConfig.secretJwtKey as string);
            userId = decoded.id;
        } catch {
            // Check redis fallback if jwt expired/session
            const redis = useNitroApp().redis;
            const userData = await redis.get(token);
            if (userData) {
                const parsed = JSON.parse(userData as string);
                userId = parsed.id;
            } else {
                setResponseStatus(events, 401);
                return {
                    statusCode: 401,
                    body: { message: "Session expired" },
                };
            }
        }

        const user = await Users.findById(userId);
        if (!user) {
            setResponseStatus(events, 404);
            return {
                statusCode: 404,
                body: { message: "User account not found" },
            };
        }

        // Apple App Store Guideline 5.1.1(v) Compliance:
        // Permanently erase user account and all personal financial data
        await Transactions.deleteMany({ user: userId });
        await Category.deleteMany({ user: userId });
        await Token.deleteMany({ id_user: userId });
        await ResetToken.deleteMany({ id_user: userId });

        // Clean up Redis session
        try {
            const redis = useNitroApp().redis;
            await redis.del(token);
        } catch (_) {}

        // Delete user record
        await Users.findByIdAndDelete(userId);

        // Delete authentication cookie
        deleteCookie(events, "jwt");

        logger.info(`[Account Deletion] User ${user.email} (${userId}) permanently deleted account and all data.`);

        setResponseStatus(events, 200);
        return {
            statusCode: 200,
            body: {
                message: "Your account and all associated financial records have been permanently deleted.",
            },
        };
    } catch (error: any) {
        logger.error(`[Account Deletion Error]: ${error.message || error}`);
        setResponseStatus(events, 500);
        return {
            statusCode: 500,
            body: { message: error.message || "Failed to delete account" },
        };
    }
});
