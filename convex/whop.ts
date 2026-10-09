import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const handleWebhook = internalMutation({
  args: {
    email: v.string(),
    status: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Note: Since email is optional in schema, by_email index might behave slightly differently but it's valid
    const users = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    if (users.length === 0) {
      console.log(`Whop webhook received for unknown email: ${args.email}`);
      return;
    }

    // Update ALL accounts that share this email to prevent duplicate account lockouts
    for (const user of users) {
      await ctx.db.patch(user._id, {
        hasAccess: args.status === "valid",
        subscriptionId: args.subscriptionId,
      });
    }
    console.log(`Updated ${users.length} user(s) with email ${args.email} access to: ${args.status}`);
  }
});

export const logWebhook = internalMutation({
  args: {
    action: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookLogs", {
      action: args.action,
      payload: args.payload,
      processedAt: new Date().toISOString(),
    });
  }
});
