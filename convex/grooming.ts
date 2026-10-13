import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listGroomingTasks = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("groomingTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const saveGroomingTasks = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    tasks: v.array(
      v.object({
        type: v.string(),
        label: v.string(),
        lastDone: v.optional(v.string()),
        nextDue: v.string(),
        frequencyDays: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    // Remove existing grooming tasks for this puppy
    const existing = await ctx.db
      .query("groomingTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    // Insert new
    for (const t of args.tasks) {
      await ctx.db.insert("groomingTasks", {
        puppyId: args.puppyId,
        userId,
        type: t.type,
        label: t.label,
        lastDone: t.lastDone,
        nextDue: t.nextDue,
        frequencyDays: t.frequencyDays,
      });
    }

    return true;
  },
});
