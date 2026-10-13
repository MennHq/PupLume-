import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Vaccinations
export const listVaccinations = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("vaccinations")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
      .collect();
  },
});

export const addVaccination = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    name: v.optional(v.string()),
    vaccineName: v.optional(v.string()),
    status: v.string(),
    administeredDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    nextDueDate: v.optional(v.string()),
    vetClinic: v.optional(v.string()),
    lotNumber: v.optional(v.string()),
    isCore: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("vaccinations", {
      ...data,
      name: data.name || data.vaccineName || "Vaccine",
      vaccineName: data.vaccineName || data.name || "Vaccine",
      userId,
    });
  },
});

// Medications
export const listMedications = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("medications")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
      .collect();
  },
});

export const addMedication = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    startDate: v.string(),
    reminderTime: v.optional(v.string()),
    active: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("medications", {
      ...data,
      userId,
    });
  },
});

// Vet Appointments
export const listAppointments = query({
  args: { 
    puppyId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) return [];

    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (idx) => idx.eq("userId", userId))
      .collect();
  },
});

export const addAppointment = mutation({
  args: {
    puppyId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    clinic: v.string(),
    date: v.string(),
    time: v.string(),
    reason: v.string(),
    status: v.string(),
    doctor: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.userId;
    if (!userId) throw new Error("Authentication or userId required");

    const { userId: _, ...data } = args;

    return await ctx.db.insert("appointments", {
      ...data,
      userId,
    });
  },
});
