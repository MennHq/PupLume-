import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return null;

    return await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const saveSettings = mutation({
  args: {
    userId: v.optional(v.string()),
    pottyAlerts: v.boolean(),
    feedingAlerts: v.boolean(),
    trainingAlerts: v.boolean(),
    medAlerts: v.boolean(),
    units: v.string(),
    activePuppyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required to save settings");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const updatedAt = new Date().toISOString();
    const { userId: _, ...data } = args;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...data,
        updatedAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("userSettings", {
      ...data,
      userId,
      updatedAt,
    });
  },
});
