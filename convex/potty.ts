import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listPottyLogs = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("pottyLogs")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addPottyLog = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    type: v.string(),
    location: v.string(),
    timestamp: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("pottyLogs", {
      ...data,
      userId,
    });
  },
});

export const deletePottyLog = mutation({
  args: { 
    id: v.id("pottyLogs"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;

    const log = await ctx.db.get(args.id);
    if (!log || (userId && log.userId !== userId)) {
      throw new Error("Log not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
