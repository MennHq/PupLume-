import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listFamilyMembers = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addFamilyMember = mutation({
  args: {
    puppyId: v.optional(v.string()),
    userId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    avatarUrl: v.optional(v.string()),
    dateAdded: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("familyMembers", {
      ...data,
      userId,
    });
  },
});

export const deleteFamilyMember = mutation({
  args: { 
    id: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;

    const normId = ctx.db.normalizeId("familyMembers", args.id);
    if (normId) {
      const member = await ctx.db.get(normId);
      if (member && (!userId || member.userId === userId)) {
        await ctx.db.delete(normId);
        return normId;
      }
    }

    if (userId) {
      const member = await ctx.db
        .query("familyMembers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("email"), args.id))
        .first();
      if (member) {
        await ctx.db.delete(member._id);
        return member._id;
      }
    }

    return null;
  },
});
