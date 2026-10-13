import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Ephemeral Chat: aiMessages table was removed for privacy.

export const saveMemory = mutation({
  args: {
    fact: v.string(),
    category: v.optional(v.string()),
    puppyId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("memories", {
      userId,
      puppyId: args.puppyId,
      fact: args.fact,
      category: args.category,
      createdAt: new Date().toISOString(),
    });
  },
});

export const deleteMemory = mutation({
  args: { 
    memoryId: v.id("memories"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication required");

    const memory = await ctx.db.get(args.memoryId);
    if (memory?.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.memoryId);
  }
});
