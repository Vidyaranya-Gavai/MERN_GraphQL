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
        const user = await context.getuser();
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
          profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
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
        const user = await context.authenticate("graphql-local", {
          username,
          password,
        });

        await context.login(user);
        return user;
      } catch (error) {
        console.log(`Error in login: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },

    logout: async (_parent, _input, context) => {
      try {
        await context.logout();
        req.session.destroy((err) => {
          if (err) throw new Error(err.message);
        });
        res.clearCookie("connect.sid");
        return { message: "Logged out successfully" };
      } catch (error) {
        console.log(`Error in logout: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
};

export default userResolver;
