import jwt from 'jsonwebtoken';
import Token from '~/server/model/token';
import users, { type User } from '~/server/model/users';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const ROTATE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // rotasi hanya jika sisa umur < 1 hari

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

        // deteksi replay: refresh token yang sudah dirotasi dipakai lagi
        if (found.used) {
            // hapus SEMUA refresh token user => semua sesi logout
            await Token.deleteMany({ id_user: found.id_user });
            deleteCookie(event, 'refresh_token');
            deleteCookie(event, 'jwt');
            setResponseStatus(event, 401);
            return { statusCode: 401, body: { message: 'Refresh token reuse detected, all sessions revoked' } };
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

        const remaining = found.expireAt ? found.expireAt.getTime() - Date.now() : 0;
        if (remaining <= 0) {
            // sudah lewat masa berlaku, tidak diperpanjang
            await Token.deleteOne({ _id: found._id });
            deleteCookie(event, 'refresh_token');
            setResponseStatus(event, 401);
            return { statusCode: 401, body: { message: 'Refresh token expired' } };
        }

        // issue new access token
        const newAccessToken = jwt.sign({ email: user.email, name: user.name, id: user._id, type: 'access' }, runtimeConfig.secretJwtKey as string, { algorithm: 'HS384', expiresIn: '15m' });
        const dataUser = { email: user.email, name: user.name, id: user._id };
        await useNitroApp().redis.set(newAccessToken, JSON.stringify(dataUser), { EX: 60 * 15 });

        // rotasi hanya jika refresh token sudah mendekati expire (threshold)
        if (remaining < ROTATE_THRESHOLD_MS) {
            const newRefreshToken = jwt.sign(
                { id: user._id, type: 'refresh' },
                runtimeConfig.secretJwtKey as string,
                { algorithm: 'HS384', expiresIn: '7d' }
            );
            const expireAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

            // tandai token lama sebagai sudah dipakai (dasar deteksi replay)
            found.used = true;
            await found.save();

            const refreshDoc = new Token({ id_user: user._id, token: newRefreshToken, expireAt });
            await refreshDoc.save();

            setCookie(event, 'refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60,
            });
        }

        // set jwt cookie (non-httpOnly so client middleware can read it as before)
        setCookie(event, 'jwt', newAccessToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 15,
        });

        setResponseStatus(event, 200);
        return { statusCode: 200, body: { message: 'Token refreshed', token: newAccessToken } };
    } catch (error) {
        console.error('Error in refresh handler', error);
        setResponseStatus(event, 500);
        return { statusCode: 500, body: { message: 'Server error' } };
    }
});