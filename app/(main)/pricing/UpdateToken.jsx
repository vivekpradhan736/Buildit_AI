import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const UpdateToken = mutation({
  args: {
    token: v.number(), // Ensure the token argument is a number
    userId: v.id("users"), // Ensure the userId is of type 'id' for the 'users' table
  },
  handler: async (ctx, args) => {
    const { token, userId } = args;

    try {
      // Retrieve the user
      const user = await ctx.db.get(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Update the token
      await ctx.db.patch(userId, {
        token: token, // Set the new token value
      });

      console.log("Token updated successfully for user:", userId);
      return { success: true, message: "Token updated successfully", userId };

    } catch (error) {
      console.error("Error updating token:", error);
      throw new Error("Unable to update token");
    }
  },
});
