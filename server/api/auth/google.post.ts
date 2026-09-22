import {OAuth2Client} from "google-auth-library";
import users, {type User} from "~/server/model/users";
import Token from "~/server/model/token";
import jwt from "jsonwebtoken";
import logger from "~/server/utils/logger";
import seedCategories from "~/server/utils/seedCategories";

interface Decoded {
    email: string;
    email_verified: boolean;
    name: string;
    sub: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{ credential?: string; code?: string }>(event);
    const runTimeConfig = useRuntimeConfig();

    try {
        let email: string = "";
        let email_verified: boolean = false;
        let name: string = "";
        let sub: string = "";

        if (body?.code) {
            const client = new OAuth2Client(
                runTimeConfig.google.clientId,
                runTimeConfig.google.clientSecret,
                "postmessage"
            );
            const { tokens } = await client.getToken(body.code);
            if (tokens.id_token) {
                const decoded = await client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: runTimeConfig.google.clientId,
                });
                const payload = decoded.getPayload() as Decoded;
                email = payload.email;
                email_verified = payload.email_verified;
                name = payload.name;
                sub = payload.sub;
            } else if (tokens.access_token) {
                const userInfo: any = await $fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokens.access_token}` },
                });
                email = userInfo.email;
                email_verified = Boolean(userInfo.email_verified);
                name = userInfo.name || userInfo.email?.split("@")[0] || "User";
                sub = userInfo.sub;
            }
        } else if (body?.credential) {
            const client = new OAuth2Client(runTimeConfig.google.clientId);
            const decoded = await client.verifyIdToken({
                idToken: body.credential,
                audience: runTimeConfig.google.clientId,
            });
            const payload = decoded.getPayload() as Decoded;
            email = payload.email;
            email_verified = payload.email_verified;
            name = payload.name;
            sub = payload.sub;
        } else {
            setResponseStatus(event, 400);
            return {
                statusCode: 400,
                body: { message: "Google authorization code or credential is required" },
            };
        }

        if (!email_verified) {
            setResponseStatus(event, 401);
            return {
                statusCode: 401,
                body: { message: "Google email is not verified" },
            };
        }
        const emailIsUser: User | null = await users.findOne({
            $or: [
                { google_id: sub },
                { email: email },
                { google_email: email }
            ]
        });
        if (emailIsUser) {
            // Existing user - link Google ID if not yet linked
            if (!emailIsUser.google_id) {
                emailIsUser.google_id = sub;
                emailIsUser.google_email = email;
                await emailIsUser.save();
            }

            // Existing user - login
            const token = jwt.sign(
                {email, name: emailIsUser.name, id: emailIsUser._id, type: 'access'},
                runTimeConfig.secretJwtKey,
                {algorithm: "HS384", expiresIn: '15m'}
            );
            const refreshToken = jwt.sign({ id: emailIsUser._id, type: 'refresh' }, runTimeConfig.secretJwtKey, { algorithm: 'HS384', expiresIn: '7d' });
            const dataUser = {
                email: emailIsUser.email,
                name: emailIsUser.name,
                id: emailIsUser._id,
            };
            const dataUserString = JSON.stringify(dataUser);
            await useNitroApp().redis.set(token, dataUserString, {
                EX: 60 * 15 // expired 15 menit
            });
            try {
                const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const refreshDoc = new Token({ id_user: emailIsUser._id, token: refreshToken, expireAt });
                await refreshDoc.save();
            } catch (err) {
                console.error('Failed to save refresh token', err);
            }
            setCookie(event, "jwt", token, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: 60 * 15,
            });
            setCookie(event, "refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60,
            });
            setResponseStatus(event, 200);
            return {
                statusCode: 200,
                body: {message: "Login successful", token, user: dataUser},
            };
        } else {
            // New user - create account with Google link
            const newUser = new users({
                name: name,
                email: email,
                password: null, // No password for Google sign-up initially
                google_id: sub,
                google_email: email,
            });
            
            const savedUser = await newUser.save();
            await seedCategories(savedUser._id.toString());

            const token = jwt.sign(
                {email, name: savedUser.name, id: savedUser._id, type: 'access'},
                runTimeConfig.secretJwtKey,
                {algorithm: "HS384", expiresIn: '15m'}
            );
            const refreshToken = jwt.sign(
                { id: savedUser._id, type: 'refresh' },
                runTimeConfig.secretJwtKey,
                { algorithm: 'HS384', expiresIn: '7d' }
            );
            const dataUser = {
                email: savedUser.email,
                name: savedUser.name,
                id: savedUser._id,
            };
            const dataUserString = JSON.stringify(dataUser);
            await useNitroApp().redis.set(token, dataUserString, {
                EX: 60 * 15 // expired 15 menit
            });
            try {
                const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const refreshDoc = new Token({ id_user: savedUser._id, token: refreshToken, expireAt });
                await refreshDoc.save();
            } catch (err) {
                console.error('Failed to save refresh token', err);
            }
            setCookie(event, "jwt", token, {
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 15,
            });
            setCookie(event, "refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60,
            });
            setResponseStatus(event, 201);
            return {
                statusCode: 201,
                body: {message: "User created successfully", token, user: dataUser},
            };
        }
    } catch (error) {
        logger.error(`Error during Google authentication: ${error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: {message: "Server error"},
        };
    }
});
