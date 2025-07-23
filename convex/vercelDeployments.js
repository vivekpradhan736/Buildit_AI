import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or Update Vercel Deployment Info
export const SaveVercelToken = mutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    teamId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    repoId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("vercelDeployments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const data = {
      userId: args.userId,
      accessToken: args.accessToken,
      teamId: args.teamId,
      projectId: args.projectId,
      repoId: args.repoId,
      createdAt: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return { message: "Vercel token updated", id: existing._id };
    }

    const id = await ctx.db.insert("vercelDeployments", data);
    return { message: "Vercel token saved", id };
  },
});

// Get Vercel Deployment Info by userId
export const GetVercelDeployment = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const deployment = await ctx.db
      .query("vercelDeployments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return deployment ?? null;
  },
});

// Delete Vercel Deployment Info
export const DeleteVercelDeployment = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("vercelDeployments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!existing) throw new Error("No Vercel deployment record found");

    await ctx.db.delete(existing._id);
    return { message: "Vercel deployment deleted" };
  },
});
