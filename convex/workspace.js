import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to Create a Workspace
export const CreateWorkspace = mutation({
  args: {
    messages: v.any(),
    user: v.id("users"),
    // image: v.optional(v.string()),
    githubURL: v.optional(v.string()),
    vercelURL: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const data = {
        messages: args.messages,
        user: args.user,
        deployStatus: "not_started",
      };

      // Only include URLs if they are provided
      if (args.githubURL) data.githubURL = args.githubURL;
      if (args.vercelURL) data.vercelURL = args.vercelURL;

      const result = await ctx.db.insert("workspace", data);
      return result;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw new Error("Unable to create workspace");
    }
  },
});
  

// Query to Get a Workspace by ID
export const GetWorkspace = query({
  args: {
    workspaceId: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db.get(args.workspaceId);
      if (!result) {
        throw new Error("Workspace not found");
      }
      return result;
    } catch (error) {
      console.error("Error fetching workspace:", error);
      throw new Error("Unable to fetch workspace");
    }
  },
});

// Mutation to Update Workspace Messages
export const UpdateMessages = mutation({
  args: {
    workspaceId: v.id("workspace"),
    messages: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db.patch(args.workspaceId, {
        messages: args.messages,
      });
      return result; // Returning the updated workspace
    } catch (error) {
      console.error("Error updating messages:", error);
      throw new Error("Unable to update messages");
    }
  },
});

// Mutation to Update Files in Workspace
export const UpdateFiles = mutation({
  args: {
    workspaceId: v.id("workspace"),
    files: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db.patch(args.workspaceId, {
        fileData: args.files,
      });
      return result; // Returning the updated workspace
    } catch (error) {
      console.error("Error updating files:", error);
      throw new Error("Unable to update files");
    }
  },
});

// Query to Get All Workspaces for a User
export const GetAllWorkspace = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db
        .query("workspace")
        .filter((q) => q.eq(q.field("user"), args.userId))
        .collect();
      return result; // Return the list of workspaces
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      throw new Error("Unable to fetch workspaces");
    }
  },
});

// Mutation to Delete a Workspace
export const DeleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.workspaceId);
      return { success: true, message: "Workspace deleted successfully" };
    } catch (error) {
      console.error("Error deleting workspace:", error);
      throw new Error("Unable to delete workspace");
    }
  },
});

// Query to Search Workspaces by content or messages
export const SearchWorkspaces = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Use a simple case-insensitive search in workspace's messages field
      const result = await ctx.db
        .query("workspace")
        .filter((q) =>
          q.and([
            q.eq(q.field("user"), args.userId),
            q.textContains(q.field("messages"), args.searchTerm),
          ])
        )
        .collect();

      return result; // Return the search result
    } catch (error) {
      console.error("Error searching workspaces:", error);
      throw new Error("Unable to search workspaces");
    }
  },
});

// Mutation to Update GitHub Repo URL in Workspace
export const UpdateGithubURL = mutation({
  args: {
    workspaceId: v.id("workspace"),
    githubUsername: v.optional(v.string()),
    repoName: v.optional(v.string()),
    githubURL: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db.patch(args.workspaceId, {
        githubUsername: args.githubUsername,
        repoName: args.repoName,
        githubURL: args.githubURL,
      });
      return result; // Return the updated workspace
    } catch (error) {
      console.error("Error updating GitHub URL:", error);
      throw new Error("Unable to update GitHub URL");
    }
  },
});

// Mutation to Update Vercel Deploy URL in Workspace
export const UpdateVercelURL = mutation({
  args: {
    workspaceId: v.id("workspace"),
    vercelURL: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db.patch(args.workspaceId, {
        vercelURL: args.vercelURL,
      });
      return result; // Return the updated workspace
    } catch (error) {
      console.error("Error updating GitHub URL:", error);
      throw new Error("Unable to update GitHub URL");
    }
  },
});

export const UpdateDeployStatus = mutation({
  args: {
    workspaceId: v.id("workspace"),
    deployStatus: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db.patch(args.workspaceId, {
        deployStatus: args.deployStatus,
      });
      return result; // Return the updated workspace
    } catch (error) {
      console.error("Error updating GitHub URL:", error);
      throw new Error("Unable to update GitHub URL");
    }
  },
});
