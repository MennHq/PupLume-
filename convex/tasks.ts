import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listTasks = query({
  args: { 
    puppyId: v.string(), 
    date: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    if (!userId) return [];

    let q = ctx.db
      .query("tasks")
      .withIndex("by_user", (idx) => idx.eq("userId", userId));

    const tasks = await q.collect();
    return tasks.filter((t) => {
      if (args.date && t.date !== args.date) return false;
      return true;
    });
  },
});

export const createTask = mutation({
  args: {
    userId: v.optional(v.string()),
    puppyId: v.string(),
    title: v.string(),
    category: v.string(),
    time: v.string(),
    durationMin: v.number(),
    period: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    if (!userId) throw new Error("Authentication or userId required to create task");

    const { userId: _, ...taskData } = args;

    return await ctx.db.insert("tasks", {
      ...taskData,
      userId,
      completed: false,
      skipped: false,
    });
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    userId: v.optional(v.string()),
    title: v.string(),
    category: v.string(),
    time: v.string(),
    durationMin: v.number(),
    period: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    if (!userId) throw new Error("Authentication required");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not authorized");

    const { id, userId: _, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const toggleTask = mutation({
  args: { 
    id: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    puppyId: v.optional(v.string()),
    userId: v.optional(v.string()),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    let task = null;
    if (args.id) {
      task = await ctx.db.get(args.id);
    } else if (args.title && userId) {
      task = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("title"), args.title))
        .first();
    }

    if (!task) {
      return null;
    }

    await ctx.db.patch(task._id, {
      completed: args.completed,
      skipped: false,
      completedAt: args.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    });
    return task._id;
  },
});

export const skipTask = mutation({
  args: {
    id: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    let task = null;
    if (args.id) {
      task = await ctx.db.get(args.id);
    } else if (args.title && userId) {
      task = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("title"), args.title))
        .first();
    }

    if (!task) {
      return null;
    }

    await ctx.db.patch(task._id, {
      skipped: true,
      completed: false,
    });
    return task._id;
  },
});

export const deleteTask = mutation({
  args: { 
    id: v.id("tasks"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const task = await ctx.db.get(args.id);
    if (!task || (userId && task.userId !== userId)) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const saveTasksBatch = mutation({
  args: {
    userId: v.optional(v.string()),
    puppyId: v.string(),
    tasks: v.array(
      v.object({
        title: v.string(),
        category: v.string(),
        time: v.string(),
        durationMin: v.number(),
        period: v.string(),
        date: v.string(),
        completed: v.boolean(),
        skipped: v.boolean(),
        description: v.optional(v.string()),
        notes: v.optional(v.string()),
        completedAt: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    if (!userId) throw new Error("Authentication or userId required");

    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const item of args.tasks) {
      const match = existing.find((e) => e.title === item.title && e.date === item.date);
      if (match) {
        await ctx.db.patch(match._id, {
          completed: item.completed,
          skipped: item.skipped,
          completedAt: item.completedAt,
        });
      } else {
        await ctx.db.insert("tasks", {
          puppyId: args.puppyId,
          userId,
          title: item.title,
          category: item.category,
          time: item.time,
          durationMin: item.durationMin,
          period: item.period,
          date: item.date,
          completed: item.completed,
          skipped: item.skipped,
          description: item.description,
          notes: item.notes,
          completedAt: item.completedAt,
        });
      }
    }
    return true;
  },
});
