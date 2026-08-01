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
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{ credential: string }>(event);
    const runTimeConfig = useRuntimeConfig();
    const client = new OAuth2Client(runTimeConfig.google.clientId);

    try {
        const decoded = await client.verifyIdToken({
            idToken: body.credential,
            audience: runTimeConfig.google.clientId,
        });
        const {email, email_verified, name} = decoded.getPayload() as Decoded;
        if (!email_verified) {
            setResponseStatus(event, 401);
            return {
                statusCode: 401,
                body: {message: "Email not verified"},
            };
        }
        const emailIsUser: User | null = await users.findOne({email: email});
        if (emailIsUser) {
            // Existing user - login
            const token = jwt.sign(
                {email, name: emailIsUser.name, id: emailIsUser._id, type: 'access'},
                runTimeConfig.secretJwtKey,
                {algorithm: "HS384"}
            );
            const refreshToken = jwt.sign({ id: emailIsUser._id, type: 'refresh' }, runTimeConfig.secretJwtKey, { algorithm: 'HS384', expiresIn: '7d' });
            const dataUser = {
                email: emailIsUser.email,
                name: emailIsUser.name,
                id: emailIsUser._id,
            };
            const dataUserString = JSON.stringify(dataUser);
            await useNitroApp().redis.set(token, dataUserString, {
                EX: 60 * 60 * 24 // expired 1 hari
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
                maxAge: 60 * 60 * 24,
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
            // New user - create account without password
            const newUser = new users({
                name: name,
                email: email,
                password: null, // No password for Google sign-up initially
            });
            
            const savedUser = await newUser.save();
            await seedCategories(savedUser._id.toString());

            const token = jwt.sign(
                {email, name: savedUser.name, id: savedUser._id, type: 'access'},
                runTimeConfig.secretJwtKey,
                {algorithm: "HS384"}
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
                EX: 60 * 60 * 24 // expired 1 hari
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
                maxAge: 60 * 60 * 24,
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
