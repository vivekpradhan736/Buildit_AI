import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const storeGithubToken = mutation({
  args: {
    userId: v.string(),
    githubMail: v.string(),
    accessToken: v.string(),
    githubUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const existingToken = await ctx.db
      .query('githubTokens')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    if (existingToken) {
      await ctx.db.patch(existingToken._id, {
        accessToken: args.accessToken,
        githubUsername: args.githubUsername,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await ctx.db.insert('githubTokens', {
        userId: args.userId,
        githubMail: args.githubMail,
        accessToken: args.accessToken,
        githubUsername: args.githubUsername,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

export const getGithubToken = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query('githubTokens')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();
    return tokenDoc ? { userId: tokenDoc.userId, githubMail: tokenDoc.githubMail, accessToken: tokenDoc.accessToken, githubUsername: tokenDoc.githubUsername } : null;
  },
});