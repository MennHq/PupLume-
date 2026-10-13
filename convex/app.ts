import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getUserAppData = query({
  args: { 
    userId: v.optional(v.string()),
    puppyId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return null;

    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', userId)).first();
    const activeUserId = user?._id || userId;

    const [
      puppies, tasks, pottyLogs, feedingLogs, sleepLogs, walkLogs, vaccinations, medications, appointments, expenses, documents, behaviorLogs, groomingTasks, socialization, journalEntries, trainingLessons, notifications, familyMembers, memories, settings] = await Promise.all([
      ctx.db.query('puppies').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('pottyLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('feedingLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('sleepLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('walkLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('vaccinations').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('medications').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('appointments').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('expenses').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('documents').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('behaviorLogs').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('groomingTasks').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('socialization').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('journalEntries').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('trainingLessons').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('notifications').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('familyMembers').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('memories').withIndex('by_user', q => q.eq('userId', userId)).collect(),
      ctx.db.query('userSettings').withIndex('by_user', q => q.eq('userId', userId)).first(),
    ]);

    return {
      user, puppies, tasks, pottyLogs, feedingLogs, sleepLogs, walkLogs, vaccinations, medications, appointments, expenses, documents, behaviorLogs, groomingTasks, socialization, journalEntries, trainingLessons, notifications, familyMembers, memories, settings
    };
  }
});

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

export const clearUserData = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return;

    const tables = ['puppies', 'tasks', 'pottyLogs', 'feedingLogs', 'sleepLogs', 'walkLogs', 'vaccinations', 'medications', 'appointments', 'expenses', 'documents', 'behaviorLogs', 'socialization', 'journalEntries', 'trainingLessons', 'notifications', 'familyMembers', 'memories'];
    
    for (const table of tables) {
      // @ts-ignore
      const records = await ctx.db.query(table).withIndex('by_user', q => q.eq('userId', userId)).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }
  }
});

export const completeAIOnboarding = mutation({
  args: { puppyId: v.string() },
  handler: async (ctx) => {
    // Stub
  }
});

export const deleteUserAccount = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return;
    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', userId)).first();
    if (user) await ctx.db.delete(user._id);
  }
});
