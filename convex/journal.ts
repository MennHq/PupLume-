import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listJournalEntries = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("journalEntries")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
      .collect();
  },
});

export const addJournalEntry = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    date: v.string(),
    notes: v.string(),
    mediaUrl: v.optional(v.string()),
    milestoneBadge: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("journalEntries", {
      ...data,
      userId,
    });
  },
});

export const deleteJournalEntry = mutation({
  args: {
    id: v.id("journalEntries"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;

    const entry = await ctx.db.get(args.id);
    if (!entry || (userId && entry.userId !== userId)) {
      throw new Error("Journal entry not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
