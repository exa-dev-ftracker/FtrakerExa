import Users, { type User } from "~/server/model/users";
import bcrypt from "bcrypt";
import seedCategories from "~/server/utils/seedCategories";

export default defineEventHandler(async (events) => {
  try {
    const body = await readBody<{
      email: string;
      password: string;
      name: string;
    }>(events);
    const { email, password, name } = body;
    const hashPassword = bcrypt.hashSync(password, 10);
    const user = new Users({ email, password: hashPassword, name });
    await user.save();
    await seedCategories(user._id.toString());
    setResponseStatus(events, 201);
    return {
      statusCode: 201,
      body: { message: "User created successfully" },
    };
  } catch (error) {
    if ((error as Error).message.includes("duplicate key")) {
      setResponseStatus(events, 409);
      return {
        statusCode: 409,
        body: { message: (error as Error).message },
      };
    } else {
      setResponseStatus(events, 500);
      return {
        statusCode: 500,
        body: { message: (error as Error).message },
      };
    }
  }
});
