import jwt from 'jsonwebtoken';
import Token from '~/server/model/token';
import users, { type User } from '~/server/model/users';

export default defineEventHandler(async (event) => {
    try {
        const runtimeConfig = useRuntimeConfig();
        const refreshToken = getCookie(event, 'refresh_token') as string | undefined;
        if (!refreshToken) {
            setResponseStatus(event, 401);
            return { statusCode: 401, body: { message: 'No refresh token' } };
        }

        // check in DB
        const found = await Token.findOne({ token: refreshToken });
        if (!found) {
            setResponseStatus(event, 401);
            return { statusCode: 401, body: { message: 'Invalid refresh token' } };
        }

        // verify
        let decoded: any = null;
        try {
            decoded = jwt.verify(refreshToken, runtimeConfig.secretJwtKey as string);
        } catch (err) {
            // invalid token
            setResponseStatus(event, 401);
            return { statusCode: 401, body: { message: 'Invalid refresh token' } };
        }
        
        if (decoded.type !== 'refresh') {
            setResponseStatus(event, 401);
            return { statusCode: 401, body: { message: 'Invalid token type' } };
        }

        const userId = decoded.id;
        const user: User | null = await users.findById(userId);
        if (!user) {
            setResponseStatus(event, 401);
            return { statusCode: 401, body: { message: 'User not found' } };
        }

        // issue new access token
        const newAccessToken = jwt.sign({ email: user.email, name: user.name, id: user._id, type: 'access' }, runtimeConfig.secretJwtKey as string, { algorithm: 'HS384' });
        const dataUser = { email: user.email, name: user.name, id: user._id };
        await useNitroApp().redis.set(newAccessToken, JSON.stringify(dataUser), { EX: 60 * 60 * 24 });

        // set jwt cookie (non-httpOnly so client middleware can read it as before)
        setCookie(event, 'jwt', newAccessToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
        });

        setResponseStatus(event, 200);
        return { statusCode: 200, body: { message: 'Token refreshed', token: newAccessToken } };
    } catch (error) {
        console.error('Error in refresh handler', error);
        setResponseStatus(event, 500);
        return { statusCode: 500, body: { message: 'Server error' } };
    }
});