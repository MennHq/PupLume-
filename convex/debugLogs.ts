import { query, mutation } from './_generated/server';
import { v } from "convex/values";

export const wipeAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      'users', 'puppies', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs',
      'walkLogs', 'vaccinations', 'medications', 'appointments', 'expenses',
      'documents', 'behaviorLogs', 'groomingTasks', 'socialization',
      'journalEntries', 'trainingLessons', 'notifications', 'familyMembers',
      'memories', 'webhookLogs'
    ];

    for (const table of tables) {
      // @ts-ignore
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }
  }
});

export const getWebhookLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('webhookLogs').order('desc').take(5);
  }
});

export const logWebhook = mutation({
  args: { action: v.string(), payload: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookLogs", {
      action: args.action,
      payload: args.payload,
      timestamp: Date.now()
    });
  }
});
