import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listDocuments = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addDocument = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    category: v.string(),
    date: v.string(),
    fileType: v.string(),
    fileSize: v.string(),
    fileUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("documents", {
      ...data,
      userId,
    });
  },
});

export const deleteDocument = mutation({
  args: { 
    id: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;

    const normId = ctx.db.normalizeId("documents", args.id);
    if (normId) {
      const doc = await ctx.db.get(normId);
      if (doc && (!userId || doc.userId === userId)) {
        await ctx.db.delete(normId);
        return normId;
      }
    }

    if (userId) {
      const doc = await ctx.db
        .query("documents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("title"), args.id))
        .first();
      if (doc) {
        await ctx.db.delete(doc._id);
        return doc._id;
      }
    }

    return null;
  },
});
