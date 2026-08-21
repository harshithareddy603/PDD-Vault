/* eslint-disable @typescript-eslint/no-explicit-any */
import { Platform } from 'react-native';

export type ExpiryMilestone =
  | 'expired'
  | 'hour_1'
  | 'day_1'
  | 'week_1'
  | 'week_2'
  | 'week_3'
  | 'week_4'
  | 'safe';

export interface MilestoneInfo {
  milestone: ExpiryMilestone;
  label: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  message: string;
}

// ─── Calculate Granular Expiry Milestone ─────────────────────────────────────
export function calculateMilestone(expiryDateStr?: string | null): MilestoneInfo {
  if (!expiryDateStr) {
    return {
      milestone: 'safe',
      label: 'Safe',
      badgeColor: '#10B981',
      badgeBg: '#D1FAE5',
      icon: 'shield-check',
      daysLeft: 999,
      hoursLeft: 999,
      minutesLeft: 999,
      message: 'Document is active',
    };
  }

  const now = Date.now();
  const expiryTime = new Date(expiryDateStr).getTime();
  const diffMs = expiryTime - now;

  const minutesLeft = Math.floor(diffMs / (1000 * 60));
  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    return {
      milestone: 'expired',
      label: 'EXPIRED',
      badgeColor: '#EF4444',
      badgeBg: '#FEE2E2',
      icon: 'alert-circle',
      daysLeft: 0,
      hoursLeft: 0,
      minutesLeft: 0,
      message: 'Document has expired!',
    };
  }

  // 1 Hour before expiry
  if (hoursLeft < 1 || minutesLeft <= 60) {
    return {
      milestone: 'hour_1',
      label: '🚨 CRITICAL (1 HOUR LEFT)',
      badgeColor: '#DC2626',
      badgeBg: '#FEF2F2',
      icon: 'clock-alert',
      daysLeft: 0,
      hoursLeft: Math.max(0, hoursLeft),
      minutesLeft: Math.max(1, minutesLeft),
      message: `Expires in ${Math.max(1, minutesLeft)} minutes! Action required immediately.`,
    };
  }

  // 1 Day before expiry (24 Hours)
  if (daysLeft < 1 || hoursLeft <= 24) {
    return {
      milestone: 'day_1',
      label: '⚠️ URGENT (1 DAY LEFT)',
      badgeColor: '#F97316',
      badgeBg: '#FFEDD5',
      icon: 'alert',
      daysLeft: 1,
      hoursLeft: Math.max(1, hoursLeft),
      minutesLeft,
      message: `Expires tomorrow (${hoursLeft} hours left).`,
    };
  }

  // 1 Week before expiry (7 Days)
  if (daysLeft <= 7) {
    return {
      milestone: 'week_1',
      label: '📅 1 WEEK REMINDER',
      badgeColor: '#EAB308',
      badgeBg: '#FEF9C3',
      icon: 'calendar-clock',
      daysLeft,
      hoursLeft,
      minutesLeft,
      message: `Expires in ${daysLeft} days (1 week remaining).`,
    };
  }

  // 2 Weeks before expiry (14 Days)
  if (daysLeft <= 14) {
    return {
      milestone: 'week_2',
      label: '📅 2 WEEKS REMINDER',
      badgeColor: '#3B82F6',
      badgeBg: '#DBEAFE',
      icon: 'calendar-clock',
      daysLeft,
      hoursLeft,
      minutesLeft,
      message: `Expires in ${daysLeft} days (2 weeks remaining).`,
    };
  }

  // 3 Weeks before expiry (21 Days)
  if (daysLeft <= 21) {
    return {
      milestone: 'week_3',
      label: '📅 3 WEEKS REMINDER',
      badgeColor: '#6366F1',
      badgeBg: '#E0E7FF',
      icon: 'calendar-clock',
      daysLeft,
      hoursLeft,
      minutesLeft,
      message: `Expires in ${daysLeft} days (3 weeks remaining).`,
    };
  }

  // 4 Weeks before expiry (30 Days)
  if (daysLeft <= 30) {
    return {
      milestone: 'week_4',
      label: '📅 4 WEEKS REMINDER',
      badgeColor: '#8B5CF6',
      badgeBg: '#EDE9FE',
      icon: 'calendar-clock',
      daysLeft,
      hoursLeft,
      minutesLeft,
      message: `Expires in ${daysLeft} days (4 weeks remaining).`,
    };
  }

  return {
    milestone: 'safe',
    label: 'Safe',
    badgeColor: '#10B981',
    badgeBg: '#D1FAE5',
    icon: 'shield-check',
    daysLeft,
    hoursLeft,
    minutesLeft,
    message: `Document active for ${daysLeft} days.`,
  };
}

// ─── Notification Permission & Status Bar Dispatcher ──────────────────────────

export class NotificationService {
  private static isInitialized = false;

  public static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (window.Notification.permission === 'granted') return true;
          if (window.Notification.permission !== 'denied') {
            const res = await window.Notification.requestPermission();
            return res === 'granted';
          }
        }
      } catch (e) {
        console.warn('Web notification permission warning:', e);
      }
      return false;
    }

    try {
      let Notifications: any = null;
      try {
        Notifications = await import('expo-notifications');
      } catch (e) {
        console.warn('Expo Notifications module not present:', e);
        return false;
      }

      if (!Notifications || typeof Notifications.getPermissionsAsync !== 'function') {
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted' && typeof Notifications.requestPermissionsAsync === 'function') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Mobile status bar notification permission denied');
        return false;
      }

      if (Platform.OS === 'android' && typeof Notifications.setNotificationChannelAsync === 'function') {
        await Notifications.setNotificationChannelAsync('document-expiries', {
          name: 'Document Expiry Alerts',
          importance: Notifications.AndroidImportance?.MAX ?? 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
        });
      }

      if (typeof Notifications.setNotificationHandler === 'function') {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Expo Notifications module not loaded or failed:', err);
      return false;
    }
  }

  public static async postStatusBarNotification(title: string, body: string, data?: any) {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (window.Notification.permission === 'granted') {
            new window.Notification(title, {
              body,
              icon: '/favicon.ico',
            });
          }
        }
      } catch (e) {
        console.warn('Web notification error:', e);
      }
      return;
    }

    try {
      let Notifications: any = null;
      try {
        Notifications = await import('expo-notifications');
      } catch (e) {
        return;
      }

      if (!Notifications || typeof Notifications.scheduleNotificationAsync !== 'function') {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority?.HIGH ?? 4,
        },
        trigger: null,
      });
    } catch (err) {
      console.warn('Failed to post status bar notification:', err);
    }
  }

  public static async syncDocumentNotifications(documents: any[]) {
    try {
      if (!documents || documents.length === 0) return;
      await this.requestPermission();

      for (const doc of documents) {
        if (!doc.expiry_date) continue;
        const info = calculateMilestone(doc.expiry_date);

        if (info.milestone === 'hour_1') {
          await this.postStatusBarNotification(
            `🚨 URGENT: ${doc.name} Expires in 1 Hour!`,
            `Your document "${doc.name}" expires in ${info.minutesLeft} minutes. Please review or renew now!`,
            { docId: doc.id }
          );
        } else if (info.milestone === 'day_1') {
          await this.postStatusBarNotification(
            `⚠️ WARNING: ${doc.name} Expires Tomorrow!`,
            `Your document "${doc.name}" will expire in 24 hours.`,
            { docId: doc.id }
          );
        } else if (info.milestone === 'week_1' && info.daysLeft === 7) {
          await this.postStatusBarNotification(
            `📅 Reminder: ${doc.name} Expires in 1 Week`,
            `Your document "${doc.name}" expires in 7 days.`,
            { docId: doc.id }
          );
        }
      }
    } catch (e) {
      console.warn('syncDocumentNotifications failed gracefully:', e);
    }
  }
}
