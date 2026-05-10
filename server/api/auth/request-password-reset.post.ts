import jwt from "jsonwebtoken";
import User from "~/server/model/users";
import ResetToken from "~/server/model/resetToken";
import { sendEmail } from "~/server/utils/sendEmail";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const tokenHeader = getCookie(event, "jwt") || getHeader(event, "Authorization")?.replace("Bearer ", "");

  if (!tokenHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(tokenHeader, config.secretJwtKey);
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid token",
    });
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  // --- CEK LIMIT REQUEST (Maksimal 3 kali dalam 24 jam) ---
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const requestCount = await ResetToken.countDocuments({
    id_user: user._id,
    createdAt: { $gte: oneDayAgo }
  });

  if (requestCount >= 3) {
    throw createError({
      statusCode: 429,
      statusMessage: "Maksimal request ganti password adalah 3 kali per 24 jam. Silakan coba lagi besok.",
    });
  }

  // Generate a short-lived reset token (expires in 15 minutes)
  const resetToken = jwt.sign(
    { email: user.email, intent: 'password_reset' },
    config.secretJwtKey,
    { expiresIn: '15m' }
  );

  // --- SAVE TOKEN TO DB ---
  const expireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit dari sekarang
  await ResetToken.create({
    id_user: user._id,
    token: resetToken,
    expireAt: expireAt
  });

  const requestUrl = getRequestURL(event);
  const resetLink = `${requestUrl.protocol}//${requestUrl.host}/reset-password?token=${resetToken}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password for FTraker. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you didn't request this, you can safely ignore this email. This link will expire in 15 minutes.</p>
      <p>Thanks,<br>FTraker Team</p>
    </div>
  `;

  try {
    await sendEmail(user.email, "Reset your FTraker password", emailHtml);
    return {
      statusCode: 200,
      message: "Password reset email sent",
    };
  } catch (err: any) {
    console.error(err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send reset email",
    });
  }
});
