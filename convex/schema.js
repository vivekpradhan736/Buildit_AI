import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
    token: v.optional(v.number()),
    perDayToken: v.optional(v.number()),
    lastResetTokenDate: v.optional(v.string()),
  }),
  workspace: defineTable({
    messages: v.any(),
    fileData: v.optional(v.any()),
    user: v.id("users"),
    githubUsername: v.optional(v.string()),
    repoName: v.optional(v.string()),
    githubURL: v.optional(v.string()),
    vercelURL: v.optional(v.string()),
    deployStatus: v.optional(v.string()),
  }),
  vercelDeployments: defineTable({
    userId: v.id("users"),
    accessToken: v.string(), // From Vercel OAuth
    teamId: v.optional(v.string()), // If deploying in team context
    projectId: v.optional(v.string()), // Vercel project ID
    repoId: v.optional(v.string()), // GitHub repo ID
    createdAt: v.string(), // ISO string
  }),
  githubTokens: defineTable({
    userId: v.string(),
    githubMail: v.string(),
    accessToken: v.string(),
    githubUsername: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),
});
