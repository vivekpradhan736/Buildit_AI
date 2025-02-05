import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to Create a User
export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first(); // Use .first() to return a single result

      // If user does not exist, create a new one
      if (!existingUser) {
        const result = await ctx.db.insert("users", {
          name: args.name,
          picture: args.picture,
          email: args.email,
          uid: args.uid,
          token: 1000000,
          perDayToken: 150000, // Set per day token
          lastResetTokenDate: new Date().toISOString().split("T")[0],
        });
        return result; // Return the created user for confirmation
      } else {
        return existingUser; // Return the existing user if already exists
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Error creating user: " + error.message); // Provide more error details
    }
  },
});

// Query to Get a User by Email
export const GetUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first(); // Use .first() for a single user retrieval
      return user || null; // Return null if user not found
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Unable to fetch user: " + error.message); // Add context to error
    }
  },
});

// Mutation to Update User's Token
export const UpdateToken = mutation({
  args: {
    token: v.number(),
    perDayToken: v.optional(v.number()), // Added perDayToken as an optional argument
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      // Create an update object based on the provided arguments
      const updateFields = {
        token: args.token,
      };

      // Only update perDayToken if it is provided
      if (args.perDayToken !== undefined) {
        updateFields.perDayToken = args.perDayToken;
      }

      const result = await ctx.db.patch(args.userId, updateFields);
      return result; // Return the updated result
    } catch (error) {
      console.error("Error updating token:", error);
      throw new Error("Unable to update token: " + error.message);
    }
  },
});


export const ResetPerDayToken = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Get the current date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Check if the last reset was today
      if (user.lastResetTokenDate === today) {
        return { message: "Per Day Token already reset today" };
      }

      // Reset perDayToken and update lastResetTokenDate
      await ctx.db.patch(args.userId, {
        perDayToken: 150000,
        lastResetTokenDate: today,
      });

      return { message: "Per Day Token reset successfully" };
    } catch (error) {
      console.error("Error resetting per day token:", error);
      throw new Error("Unable to reset per day token: " + error.message);
    }
  },
});

export const CheckAndResetPerDayToken = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get the current date
    const today = new Date().toISOString().split("T")[0];

    // If it's a new day, reset the perDayToken
    if (user.lastResetTokenDate !== today) {
      await ctx.db.patch(args.userId, {
        perDayToken: 150000,
        lastResetTokenDate: today,
      });
    }
  },
});
