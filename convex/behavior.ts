import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listBehaviorLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("behaviorLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addBehaviorLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    behaviorType: v.string(),
    timestamp: v.string(),
    severity: v.string(),
    trigger: v.optional(v.string()),
    whatHelped: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("behaviorLogs", {
      ...data,
      userId,
    });
  },
});
