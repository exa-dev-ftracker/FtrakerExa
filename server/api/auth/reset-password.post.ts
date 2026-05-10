import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "~/server/model/users";
import ResetToken from "~/server/model/resetToken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token, newPassword } = body;
  const config = useRuntimeConfig();

  if (!token || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token and new password are required",
    });
  }

  // --- CEK TOKEN DI DB ---
  const tokenRecord = await ResetToken.findOne({ token, isUsed: false });
  if (!tokenRecord) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token tidak ditemukan, sudah kedaluwarsa, atau sudah digunakan",
    });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, config.secretJwtKey);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired reset token",
    });
  }

  // Ensure this token was actually meant for password reset
  if (decoded.intent !== 'password_reset') {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid token intent",
    });
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user password
  user.password = hashedPassword;
  await user.save();

  // Tandai token sudah digunakan (jangan dihapus agar riwayat 3 kali limit tetap ada)
  tokenRecord.isUsed = true;
  await tokenRecord.save();

  return {
    statusCode: 200,
    message: "Password reset successfully",
  };
});
