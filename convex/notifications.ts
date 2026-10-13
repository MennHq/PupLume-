import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listNotifications = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addNotification = mutation({
  args: {
    userId: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    category: v.string(),
    timestamp: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("notifications", {
      ...data,
      userId,
      read: false,
    });
  },
});

export const markNotificationRead = mutation({
  args: { 
    id: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;

    const normId = ctx.db.normalizeId("notifications", args.id);
    if (normId) {
      const item = await ctx.db.get(normId);
      if (item && (!userId || item.userId === userId)) {
        await ctx.db.patch(normId, { read: true });
        return;
      }
    }

    if (userId) {
      const item = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("read"), false))
        .first();
      if (item) {
        await ctx.db.patch(item._id, { read: true });
      }
    }
  },
});

export const markAllNotificationsRead = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return;

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const item of items) {
      await ctx.db.patch(item._id, { read: true });
    }
  },
});
