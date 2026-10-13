import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listWalkLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("walkLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addWalkLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    startTime: v.optional(v.string()),
    durationMin: v.number(),
    distanceMiles: v.optional(v.number()),
    peesCount: v.optional(v.number()),
    poopsCount: v.optional(v.number()),
    pullingRating: v.optional(v.string()),
    reactivityNotes: v.optional(v.string()),
    timestamp: v.optional(v.string()),
    route: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("walkLogs", {
      ...data,
      userId,
    });
  },
});
