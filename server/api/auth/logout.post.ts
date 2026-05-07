import jwt from "jsonwebtoken";
import Token from "~/server/model/token";

export default defineEventHandler(async (event) => {
    try {
        // try to get token from body or from cookie
        const body = await readBody<{ token?: string }>(event);
        let token = body.token;
        if (!token) {
            token = getCookie(event, 'jwt') as string | undefined;
        }
        if (token) {
            await useNitroApp().redis.del(token);
        }
        // clear jwt cookie (client-side token) and refresh token (httpOnly)
        deleteCookie(event, "jwt");
        const refreshCookie = getCookie(event, 'refresh_token') as string | undefined;
        if (refreshCookie) {
            try {
                await Token.deleteOne({ token: refreshCookie });
            } catch (err) {
                console.error('Failed to remove refresh token from DB', err);
            }
        }
        deleteCookie(event, 'refresh_token');
        setResponseStatus(event, 200);
        return {
            statusCode: 200,
            body: {message: "Logged out"},
        };
    } catch (error) {
        logger.error(`Error in logout handler: ${error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: {message: (error as Error).message},
        };
    }
});
