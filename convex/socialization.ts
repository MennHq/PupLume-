import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listSocialization = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("socialization")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updateSocializationStatus = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    category: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    lastUpdated: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const existing = await ctx.db
      .query("socialization")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(
        (q) =>
          q.eq(q.field("puppyId"), args.puppyId) &&
          q.eq(q.field("title"), args.title)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        notes: args.notes,
        lastUpdated: args.lastUpdated,
      });
      return existing._id;
    }

    const { userId: _, ...data } = args;

    return await ctx.db.insert("socialization", {
      ...data,
      userId,
    });
  },
});
