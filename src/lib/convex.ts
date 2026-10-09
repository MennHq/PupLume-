import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  PuppyProfile,
  TaskItem,
  PottyLog,
  FeedingLog,
  SleepLog,
  WalkLog,
  VaccinationRecord,
  MedicationRecord,
  VetAppointment,
  ExpenseRecord,
  DocumentRecord,
  BehaviorIncident,
  GroomingTask,
  JournalEntry,
} from "../types";

const convexUrl =
  import.meta.env.VITE_CONVEX_URL ||
  "https://energetic-partridge-407.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);

export const CONVEX_DEPLOYMENT =
  import.meta.env.CONVEX_DEPLOYMENT ||
  "dev:energetic-partridge-407|eyJ2MiI6ImIyZjQ0MTY2YjEwYjQzMThiODNhNThlZWMyYTJmMGI0In0=";

// Async background mutation helpers to Convex
export async function syncPuppyToConvex(
  puppy: PuppyProfile,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.puppies.savePuppy, {
      userId,
      id: puppy.id,
      name: puppy.name,
      breed: puppy.breed,
      birthDate: puppy.birthDate,
      sex: puppy.sex,
      weightLbs: puppy.weightLbs,
      photoUrl: puppy.photoUrl,
      temperament: puppy.temperament,
      dietaryRestrictions: puppy.dietaryRestrictions,
      microchipNumber: puppy.microchipNumber,
      allergies: puppy.allergies,
      vetClinic: puppy.vetClinic,
      vetPhone: puppy.vetPhone,
      vetName: puppy.vetName,
      insuranceProvider: puppy.insuranceProvider,
      insurancePolicyNumber: puppy.insurancePolicyNumber,
      favoriteTreat: puppy.favoriteTreat,
      adoptionDate: puppy.adoptionDate,
      createdAt: puppy.createdAt,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncPuppy note:", err);
    return false;
  }
}

export async function syncTaskToConvex(
  task: TaskItem,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.tasks.createTask, {
      userId,
      puppyId: task.puppyId,
      title: task.title,
      category: task.category,
      time: task.time,
      durationMin: task.durationMin,
      period: task.period,
      date: task.date,
      description: task.description,
      notes: task.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncTask note:", err);
    return false;
  }
}

export async function toggleTaskInConvex(
  title: string,
  completed: boolean,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.tasks.toggleTask, {
      userId,
      title,
      completed,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] toggleTask note:", err);
    return false;
  }
}

export async function skipTaskInConvex(
  title: string,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.tasks.skipTask, {
      userId,
      title,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] skipTask note:", err);
    return false;
  }
}

export async function deleteTaskInConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.tasks.deleteTask, {
      id: id as any,
      userId,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] deleteTask note:", err);
    return false;
  }
}

export async function updateTaskInConvex(
  task: TaskItem,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.tasks.updateTask, {
      id: task.id as any,
      userId,
      title: task.title,
      category: task.category,
      time: task.time,
      durationMin: task.durationMin,
      period: task.period,
      description: task.description,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] updateTask note:", err);
    return false;
  }
}

export async function syncPottyLogToConvex(
  log: PottyLog,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.potty.addPottyLog, {
      userId,
      puppyId: log.puppyId,
      type: log.type,
      location: log.location,
      timestamp: log.timestamp,
      notes: log.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncPottyLog note:", err);
    return false;
  }
}

export async function syncFeedingLogToConvex(
  log: FeedingLog,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.feeding.addFeedingLog, {
      userId,
      puppyId: log.puppyId,
      mealType: log.mealType,
      amountCups: log.amountCups,
      foodBrand: log.foodBrand,
      timestamp: log.timestamp,
      notes: log.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncFeedingLog note:", err);
    return false;
  }
}

export async function syncSleepLogToConvex(
  log: SleepLog,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.sleep.addSleepLog, {
      userId,
      puppyId: log.puppyId,
      type: log.type,
      startTime: log.startTime,
      endTime: log.endTime,
      durationMin: log.durationMin,
      notes: log.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncSleepLog note:", err);
    return false;
  }
}

export async function syncWalkLogToConvex(
  log: WalkLog,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.walk.addWalkLog, {
      userId,
      puppyId: log.puppyId,
      durationMin: log.durationMin,
      distanceMiles: log.distanceMiles,
      peesCount: log.peesCount,
      poopsCount: log.poopsCount,
      pullingRating: log.pullingRating,
      reactivityNotes: log.reactivityNotes,
      timestamp: log.startTime || new Date().toISOString(),
      notes: log.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncWalkLog note:", err);
    return false;
  }
}

export async function syncVaccinationToConvex(
  v: VaccinationRecord,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.health.addVaccination, {
      userId,
      puppyId: v.puppyId,
      name: v.vaccineName,
      vaccineName: v.vaccineName,
      status: v.status,
      administeredDate: v.administeredDate,
      dueDate: v.nextDueDate,
      nextDueDate: v.nextDueDate,
      vetClinic: v.vetClinic,
      lotNumber: v.lotNumber,
      isCore: true,
      notes: v.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncVaccination note:", err);
    return false;
  }
}

export async function syncMedicationToConvex(
  m: MedicationRecord,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.health.addMedication, {
      userId,
      puppyId: m.puppyId,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.startDate,
      reminderTime: m.reminderTime,
      active: m.active,
      notes: m.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncMedication note:", err);
    return false;
  }
}

export async function syncAppointmentToConvex(
  a: VetAppointment,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.health.addAppointment, {
      userId,
      puppyId: a.puppyId,
      title: a.title,
      clinic: a.clinic,
      date: a.date,
      time: a.time,
      reason: a.reason,
      status: a.status,
      doctor: a.doctor,
      notes: a.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncAppointment note:", err);
    return false;
  }
}

export async function syncExpenseToConvex(
  e: ExpenseRecord,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.expenses.addExpense, {
      userId,
      puppyId: e.puppyId,
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.date,
      vendor: e.vendor,
      notes: e.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncExpense note:", err);
    return false;
  }
}

export async function syncDocumentToConvex(
  d: DocumentRecord,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.documents.addDocument, {
      userId,
      puppyId: d.puppyId,
      title: d.title,
      category: d.category,
      date: d.date,
      fileType: d.fileType,
      fileSize: d.fileSize,
      fileUrl: d.fileUrl,
      notes: d.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncDocument note:", err);
    return false;
  }
}

export async function removeDocumentFromConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.documents.deleteDocument, { id, userId });
    return true;
  } catch (err) {
    console.debug("[Convex] removeDocument note:", err);
    return false;
  }
}

export async function syncBehaviorLogToConvex(
  b: BehaviorIncident,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.behavior.addBehaviorLog, {
      userId,
      puppyId: b.puppyId,
      behaviorType: b.behaviorType,
      timestamp: b.timestamp,
      severity: b.severity,
      trigger: b.trigger,
      whatHelped: b.whatHelped,
      notes: b.notes,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncBehaviorLog note:", err);
    return false;
  }
}

export async function syncGroomingTasksToConvex(
  puppyId: string,
  tasks: GroomingTask[],
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.grooming.saveGroomingTasks, {
      userId,
      puppyId,
      tasks: tasks.map((t) => ({
        type: t.type,
        label: t.label,
        lastDone: t.lastDone,
        nextDue: t.nextDue,
        frequencyDays: t.frequencyDays,
      })),
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncGroomingTasks note:", err);
    return false;
  }
}

export async function syncSocializationToConvex(
  puppyId: string,
  item: any,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.socialization.updateSocializationStatus, {
      userId,
      puppyId,
      category: item.category || "General",
      title: item.title,
      description: item.description || "",
      status: item.status,
      notes: item.notes,
      lastUpdated: item.lastUpdated || new Date().toISOString().split("T")[0],
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncSocialization note:", err);
    return false;
  }
}

export async function syncJournalEntryToConvex(
  j: JournalEntry,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.journal.addJournalEntry, {
      userId,
      puppyId: j.puppyId,
      title: j.title,
      date: j.date,
      notes: j.notes,
      mediaUrl: j.mediaUrl,
      milestoneBadge: j.milestoneBadge,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncJournalEntry note:", err);
    return false;
  }
}

export async function syncTrainingLessonToConvex(
  puppyId: string,
  lessonId: string,
  completed: boolean,
  mastered: boolean,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.training.updateLessonStatus, {
      userId,
      puppyId,
      lessonId,
      completed,
      mastered,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncTrainingLesson note:", err);
    return false;
  }
}

export async function syncSettingsToConvex(
  settings: {
    pottyAlerts: boolean;
    feedingAlerts: boolean;
    trainingAlerts: boolean;
    medAlerts: boolean;
    units: string;
    activePuppyId?: string;
  },
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.settings.saveSettings, {
      ...settings,
      userId,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncSettings note:", err);
    return false;
  }
}

export async function syncFamilyMemberToConvex(
  m: {
    puppyId?: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    dateAdded: string;
  },
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.family.addFamilyMember, {
      ...m,
      userId,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncFamilyMember note:", err);
    return false;
  }
}

export async function removeFamilyMemberFromConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.family.deleteFamilyMember, { id, userId });
    return true;
  } catch (err) {
    console.debug("[Convex] removeFamilyMember note:", err);
    return false;
  }
}

export async function syncNotificationReadToConvex(
  id: string,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.notifications.markNotificationRead, { id, userId });
    return true;
  } catch (err) {
    console.debug("[Convex] syncNotificationRead note:", err);
    return false;
  }
}

export async function syncAllNotificationsReadToConvex(
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.notifications.markAllNotificationsRead, { userId });
    return true;
  } catch (err) {
    console.debug("[Convex] syncAllNotificationsRead note:", err);
    return false;
  }
}

export async function syncAIMessageToConvex(
  puppyId: string,
  msg: { sender: string; text: string; timestamp: string; suggestedActions?: any },
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.ai.addAIMessage, {
      userId,
      puppyId,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      suggestedActions: msg.suggestedActions ? JSON.stringify(msg.suggestedActions) : undefined,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncAIMessage note:", err);
    return false;
  }
}

export async function syncAIMessagesToConvex(
  puppyId: string,
  messages: { sender: string; text: string; timestamp: string; suggestedActions?: any }[],
  userId?: string
): Promise<boolean> {
  try {
    const formattedMessages = messages.map(m => ({
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp,
      suggestedActions: m.suggestedActions ? JSON.stringify(m.suggestedActions) : undefined,
    }));
    await convex.mutation(api.ai.saveAIMessages, {
      userId,
      puppyId,
      messages: formattedMessages,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] syncAIMessages note:", err);
    return false;
  }
}

export async function completeAIOnboardingInConvex(
  puppy: {
    name: string;
    breed: string;
    birthDate: string;
    sex: string;
    weightLbs: number;
    photoUrl: string;
    temperament?: string;
    dietaryRestrictions?: string;
    favoriteTreat?: string;
  },
  tasks: Array<{
    title: string;
    category: string;
    time: string;
    durationMin: number;
    period: string;
    description: string;
  }>,
  userId?: string
): Promise<boolean> {
  try {
    await convex.mutation(api.app.completeAIOnboarding, {
      userId,
      puppy,
      tasks,
    });
    return true;
  } catch (err) {
    console.debug("[Convex] completeAIOnboarding note:", err);
    return false;
  }
}

export async function clearUserDataInConvex(userId?: string): Promise<boolean> {
  try {
    await convex.mutation(api.app.clearUserData, { userId });
    return true;
  } catch (err) {
    console.debug("[Convex] clearUserData note:", err);
    return false;
  }
}

export async function deleteUserAccountInConvex(): Promise<boolean> {
  try {
    await convex.mutation(api.app.deleteUserAccount);
    return true;
  } catch (err) {
    console.debug("[Convex] deleteUserAccount note:", err);
    return false;
  }
}
