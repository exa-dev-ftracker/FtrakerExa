import users, { type User } from "~/server/model/users";
import Token from "~/server/model/token";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import seedCategories from "~/server/utils/seedCategories";

interface AppleTokenPayload {
    iss?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean | string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        identityToken: string;
        email?: string | null;
        name?: { firstName?: string; lastName?: string } | string | null;
    }>(event);

    const runTimeConfig = useRuntimeConfig();

    if (!body?.identityToken) {
        setResponseStatus(event, 400);
        return {
            statusCode: 400,
            body: { message: "Identity token is required" },
        };
    }

    try {
        const decoded = jwt.decode(body.identityToken) as AppleTokenPayload | null;

        if (!decoded || !decoded.sub) {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "Failed to decode Apple identity token" },
            };
        }

        const appleUserId = decoded.sub;
        const resolvedEmail = decoded.email || body.email || null;

        logger.info(`[Apple Auth] Authenticating Apple user: ${appleUserId}, email: ${resolvedEmail}`);

        // 1. Try finding user by apple_id
        let user: User | null = await users.findOne({ apple_id: appleUserId });

        // 2. If not found by apple_id, try finding by email and auto-link
        if (!user && resolvedEmail) {
            user = await users.findOne({ email: resolvedEmail });
            if (user) {
                user.apple_id = appleUserId;
                if (!user.apple_email) {
                    user.apple_email = resolvedEmail;
                }
                await user.save();
                logger.info(`[Apple Auth] Auto-linked Apple ID ${appleUserId} to existing account: ${user.email}`);
            }
        }

        let isNewUser = false;

        // 3. If still not found, create new account (Sign Up with Apple)
        if (!user) {
            isNewUser = true;
            let formattedName = "Apple User";

            if (body.name) {
                if (typeof body.name === "object") {
                    const fullName = `${body.name.firstName || ""} ${body.name.lastName || ""}`.trim();
                    if (fullName) formattedName = fullName;
                } else if (typeof body.name === "string" && body.name.trim()) {
                    formattedName = body.name.trim();
                }
            }

            const fallbackEmail = resolvedEmail || `apple_${appleUserId.slice(0, 10)}@privaterelay.appleid.com`;

            user = new users({
                name: formattedName,
                email: fallbackEmail,
                password: null,
                apple_id: appleUserId,
                apple_email: resolvedEmail,
            });

            await user.save();
            await seedCategories(user._id.toString());
            logger.info(`[Apple Auth] Created new user with Apple ID: ${user.email}`);
        }

        // 4. Issue JWT access token & refresh token
        const token = jwt.sign(
            { email: user.email, name: user.name, id: user._id, type: "access" },
            runTimeConfig.secretJwtKey,
            { algorithm: "HS384", expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id, type: "refresh" },
            runTimeConfig.secretJwtKey,
            { algorithm: "HS384", expiresIn: "7d" }
        );

        const dataUser = {
            email: user.email,
            name: user.name,
            id: user._id,
        };

        // Cache session in Redis (15 mins)
        await useNitroApp().redis.set(token, JSON.stringify(dataUser), {
            EX: 60 * 15,
        });

        // Persist refresh token in MongoDB
        try {
            const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const refreshDoc = new Token({ id_user: user._id, token: refreshToken, expireAt });
            await refreshDoc.save();
        } catch (err) {
            logger.error(`[Apple Auth] Failed to save refresh token: ${err}`);
        }

        // Set cookies
        setCookie(event, "jwt", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 15,
        });

        setCookie(event, "refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
        });

        const status = isNewUser ? 201 : 200;
        setResponseStatus(event, status);
        return {
            statusCode: status,
            body: {
                message: isNewUser ? "User created successfully" : "Login successful",
                token,
                user: dataUser,
            },
        };
    } catch (error: any) {
        logger.error(`[Apple Auth] Error during Apple authentication: ${error.message || error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: { message: "Server error during Apple authentication" },
        };
    }
});
