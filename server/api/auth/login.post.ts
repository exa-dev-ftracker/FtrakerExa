import users, {type User} from "~/server/model/users";
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
                    {email: user.email, name: user.name, id: user._id},
                    runtimeConfig.secretJwtKey,
                    {algorithm: "HS384"}
                );
                const dataUser = {
                    email: user.email,
                    name: user.name,
                    id: user._id,
                }
                const dataUserString = JSON.stringify(dataUser);
                await useNitroApp().redis.set(token, dataUserString, {
                    EX: 60 * 60 * 24 // expired 1 hari
                });
                setCookie(event, "jwt", token, {
                    secure: true,
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24,
                });
                setResponseStatus(event, 200);
                return {
                    statusCode: 200,
                    body: {message: "Success", token},
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
