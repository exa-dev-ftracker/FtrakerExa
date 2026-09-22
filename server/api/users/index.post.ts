import Users, { type User } from "~/server/model/users";
import bcrypt from "bcrypt";
import seedCategories from "~/server/utils/seedCategories";
import logger from "~/server/utils/logger";

export default defineEventHandler(async (events) => {
  try {
    const body = await readBody<{
      email: string;
      password: string;
      name: string;
    }>(events);

    if (!body?.email || !body?.password || !body?.name) {
      setResponseStatus(events, 400);
      return {
        statusCode: 400,
        body: { message: "Name, email, and password are required" },
      };
    }

    const email = body.email.trim().toLowerCase();
    const { password, name } = body;

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      setResponseStatus(events, 409);
      return {
        statusCode: 409,
        body: { message: "Email is already registered. Please use another email or log in." },
      };
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    const user = new Users({ email, password: hashPassword, name: name.trim() });
    await user.save();
    await seedCategories(user._id.toString());
    setResponseStatus(events, 201);
    return {
      statusCode: 201,
      body: { message: "User created successfully" },
    };
  } catch (error: any) {
    logger.error(`Registration error: ${error?.message || error}`);
    if (error?.code === 11000 || error?.message?.includes("duplicate key") || error?.message?.includes("E11000")) {
      setResponseStatus(events, 409);
      return {
        statusCode: 409,
        body: { message: "Email is already registered. Please use another email or log in." },
      };
    } else {
      setResponseStatus(events, 500);
      return {
        statusCode: 500,
        body: { message: error?.message || "Internal server error during registration" },
      };
    }
  }
});
