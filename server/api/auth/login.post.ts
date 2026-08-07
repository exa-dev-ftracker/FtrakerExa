import users, {type User} from "~/server/model/users";
import Token from "~/server/model/token";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import logger from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
    try {

        const runtimeConfig = useRuntimeConfig();
        const body = await readBody<{ email: string; password: string }>(event);
        const user: User | null = await users.findOne({email: body.email});
        if (user) {
            // Check if user has a password (Google sign-up users might not)
            if (!user.password) {
                setResponseStatus(event, 401);
                return {
                    statusCode: 401,
                    body: {message: "Please use Google Sign In or set a password first"},
                };
            }

            const isUserPassword = bcrypt.compareSync(body.password, user.password);
            if (isUserPassword) {
                const token = jwt.sign(
                    {email: user.email, name: user.name, id: user._id, type: 'access'},
                    runtimeConfig.secretJwtKey,
                    {algorithm: "HS384", expiresIn: '15m'}
                );
                // create refresh token (longer lived) and store it server-side
                const refreshToken = jwt.sign(
                    {id: user._id, type: 'refresh'},
                    runtimeConfig.secretJwtKey,
                    {algorithm: "HS384", expiresIn: '7d'}
                );
                const dataUser = {
                    email: user.email,
                    name: user.name,
                    id: user._id,
                }
                const dataUserString = JSON.stringify(dataUser);
                await useNitroApp().redis.set(token, dataUserString, {
                    EX: 60 * 15 // expired 15 menit
                });
                // Persist refresh token in DB with expireAt
                try {
                    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                    const refreshDoc = new Token({ id_user: user._id, token: refreshToken, expireAt });
                    await refreshDoc.save();
                } catch (err) {
                    // ignore DB errors for refresh token but log
                    console.error('Failed to save refresh token', err);
                }
                setCookie(event, "jwt", token, {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: "strict",
                    maxAge: 60 * 15,
                });
                // set httpOnly refresh token cookie
                setCookie(event, "refresh_token", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60,
                });
                setResponseStatus(event, 200);
                return {
                    statusCode: 200,
                    body: {message: "Success", token, user: dataUser},
                };
            } else {
                setResponseStatus(event, 401);
                return {
                    statusCode: 401,
                    body: {message: "Password is incorrect"},
                };
            }
        } else {
            setResponseStatus(event, 401);
            return {
                statusCode: 401,
                body: {message: "Email or password is incorrect"},
            };
        }
    } catch (error) {
        logger.error(`Error in login handler: ${error}`);
        setResponseStatus(event, 500);
        return {
            statusCode: 500,
            body: {message: "Server error"},
        };
    }
});
