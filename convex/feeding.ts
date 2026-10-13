import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listFeedingLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("feedingLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addFeedingLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    mealType: v.string(),
    amountCups: v.optional(v.number()),
    foodBrand: v.optional(v.string()),
    timestamp: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("feedingLogs", {
      ...data,
      userId,
    });
  },
});
