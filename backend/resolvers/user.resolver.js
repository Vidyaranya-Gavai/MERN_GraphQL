import { users } from "../dummyData/data.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const userResolver = {
  Query: {
    users: () => {
      return users;
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log(`Error in user query: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    authUser: async (_parent, _input, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.log(`Error in authuser: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;
        if (!username || !password || !name || !gender) {
          throw new Error("All fields are required...");
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error("User Already Exists...");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const user = new User({
          username,
          name,
          password: hashedPassword,
          gender,
          profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
        });
        await user.save();
        await context.login(user);
        return user;
      } catch (error) {
        console.log(`Error in signup: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;
        if (!username || !password) throw new Error("All fields are required");

        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        const existingUser = await User.findOne({ username });
        const validPassword = await bcrypt.compare(
          password,
          existingUser.password
        );
        if (!validPassword) {
          throw new Error("Invalid Username or Password");
        }

        await context.login(user);
        return user;
      } catch (err) {
        console.error("Error in login:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    logout: async (_parent, _input, context) => {
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          if (err) throw new Error(err.message);
        });
        context.res.clearCookie("connect.sid");
        return { message: "Logged out successfully" };
      } catch (error) {
        console.log(`Error in logout: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
};

export default userResolver;
