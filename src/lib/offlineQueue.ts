/**
 * PupLume Offline Mutation Sync Queue
 * Automatically queues failed/offline Convex mutations in localStorage
 * and flushes them in order whenever the user regains internet connectivity.
 */

import { convex } from './convex';
import { api } from '../../convex/_generated/api';

export interface QueuedMutation {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  retries: number;
}

const STORAGE_KEY = 'puplume_offline_mutation_queue';

class OfflineMutationQueue {
  private isProcessing = false;
  private listeners: Set<(count: number) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[OfflineQueue] Connection restored. Flushing queued mutations...');
        this.flush();
      });

      // Attempt to flush on startup if online
      setTimeout(() => {
        if (navigator.onLine) {
          this.flush();
        }
      }, 3000);
    }
  }

  public subscribe(listener: (count: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCount());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const count = this.getCount();
    this.listeners.forEach((l) => l(count));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count } }));
    }
  }

  public getQueue(): QueuedMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getCount(): number {
    return this.getQueue().length;
  }

  private saveQueue(queue: QueuedMutation[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notify();
    } catch (e) {
      console.warn('[OfflineQueue] Failed to save queue to localStorage:', e);
    }
  }

  /**
   * Enqueue a mutation to be sent when internet is available
   */
  public enqueue(type: string, payload: any) {
    const queue = this.getQueue();
    const item: QueuedMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    queue.push(item);
    this.saveQueue(queue);
    console.log(`[OfflineQueue] Enqueued mutation ${type}. Total queued: ${queue.length}`);
  }

  /**
   * Flush all queued mutations to Convex
   */
  public async flush(): Promise<boolean> {
    if (this.isProcessing) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

    const queue = this.getQueue();
    if (queue.length === 0) return true;

    this.isProcessing = true;
    console.log(`[OfflineQueue] Flushing ${queue.length} mutations...`);

    const remaining: QueuedMutation[] = [];

    for (const item of queue) {
      try {
        const success = await this.executeMutation(item);
        if (!success) {
          item.retries += 1;
          if (item.retries < 5) {
            remaining.push(item);
          } else {
            console.warn(`[OfflineQueue] Dropping mutation ${item.type} after 5 retries`);
          }
        }
      } catch (err) {
        console.warn(`[OfflineQueue] Mutation execution error for ${item.type}:`, err);
        item.retries += 1;
        if (item.retries < 5) {
          remaining.push(item);
        }
      }
    }

    this.saveQueue(remaining);
    this.isProcessing = false;
    console.log(`[OfflineQueue] Flush finished. Remaining: ${remaining.length}`);
    return remaining.length === 0;
  }

  private async executeMutation(item: QueuedMutation): Promise<boolean> {
    const { type, payload } = item;

    switch (type) {
      case 'tasks:createTask':
        await convex.mutation(api.tasks.createTask, payload);
        return true;
      case 'tasks:toggleTask':
        await convex.mutation(api.tasks.toggleTask, payload);
        return true;
      case 'tasks:deleteTask':
        await convex.mutation(api.tasks.deleteTask, payload);
        return true;
      case 'tasks:updateTask':
        await convex.mutation(api.tasks.updateTask, payload);
        return true;
      case 'puppies:savePuppy':
        await convex.mutation(api.puppies.savePuppy, payload);
        return true;
      case 'potty:logPotty':
        await convex.mutation(api.potty.logPotty, payload);
        return true;
      case 'feeding:logFeeding':
        await convex.mutation(api.feeding.logFeeding, payload);
        return true;
      case 'sleep:logSleep':
        await convex.mutation(api.sleep.logSleep, payload);
        return true;
      case 'walk:logWalk':
        await convex.mutation(api.walk.logWalk, payload);
        return true;
      case 'health:saveVaccination':
        await convex.mutation(api.health.saveVaccination, payload);
        return true;
      case 'health:saveMedication':
        await convex.mutation(api.health.saveMedication, payload);
        return true;
      case 'health:saveAppointment':
        await convex.mutation(api.health.saveAppointment, payload);
        return true;
      case 'expenses:saveExpense':
        await convex.mutation(api.expenses.saveExpense, payload);
        return true;
      case 'documents:saveDocument':
        await convex.mutation(api.documents.saveDocument, payload);
        return true;
      case 'journal:saveJournalEntry':
        await convex.mutation(api.journal.saveJournalEntry, payload);
        return true;
      case 'settings:saveSettings':
        await convex.mutation(api.settings.saveSettings, payload);
        return true;
      default:
        console.warn(`[OfflineQueue] Unknown mutation type: ${type}`);
        return true; // Mark done so it doesn't block queue
    }
  }
}

export const offlineQueue = new OfflineMutationQueue();
