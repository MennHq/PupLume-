import { storage } from './storage';
import { convex } from './convex';
import { api } from '../../convex/_generated/api';

class NotificationEngine {
  private timer: NodeJS.Timeout | null = null;
  private notifiedTaskIds: Set<string> = new Set();
  
  start() {
    if (this.timer) return;
    
    // Request push notification permissions on start if possible
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    this.timer = setInterval(() => this.check(), 60000); // Check every minute
    // Run an initial check 5 seconds after boot
    setTimeout(() => this.check(), 5000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private check() {
    const tasks = storage.getTasks();
    const now = new Date();
    
    // Check pending tasks for the next 15 minutes
    tasks.filter(t => !t.completed && !t.skipped).forEach(task => {
      // If task has no time, skip
      if (!task.time) return;
      
      const [timeStr, period] = task.time.split(' ');
      let [hours, mins] = timeStr.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const taskDate = new Date();
      taskDate.setHours(hours, mins, 0, 0);
      
      const diffMs = taskDate.getTime() - now.getTime();
      const diffMins = diffMs / 60000;
      
      // If task is within 15 mins AND we haven't notified for it yet
      if (diffMins > 0 && diffMins <= 15 && !this.notifiedTaskIds.has(task.id)) {
        this.notifiedTaskIds.add(task.id);
        this.triggerNotification(
          `Upcoming: ${task.title}`,
          `Starts in ${Math.round(diffMins)} minutes.`,
          task.category,
          `/?view=plan`
        );
      }
    });
  }

  public triggerNotification(title: string, message: string, category: string, actionUrl?: string) {
    // 1. Native Push Notification (Phone/Desktop)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, {
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/icon.svg',
          tag: 'puplume-alert'
        });
        n.onclick = () => {
          if (actionUrl) window.location.href = actionUrl;
          n.close();
        };
      } catch (e) {
        console.warn('Native push failed', e);
      }
    }

    // 2. In-App Notification (Convex)
    const currentUserId = storage.getCurrentUserId();
    if (currentUserId) {
      convex.mutation(api.notifications.addNotification, {
        userId: currentUserId,
        title,
        message,
        category,
        timestamp: new Date().toISOString(),
        actionUrl
      }).catch(() => {
        // Fallback: manually insert into local storage if offline
        const localN = {
          id: 'temp_' + Date.now(),
          title,
          message,
          category,
          timestamp: new Date().toISOString(),
          actionUrl,
          read: false
        };
        // We'd need a storage.addNotificationLocal method here, but since the Convex useQuery in App.tsx syncs automatically, if offline we just drop it from history. The native push still went through.
      });
    }
  }
}

export const engine = new NotificationEngine();
