import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listSleepLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("sleepLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addSleepLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    type: v.string(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    durationMin: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("sleepLogs", {
      ...data,
      userId,
    });
  },
});
