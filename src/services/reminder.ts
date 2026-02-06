import { Reminder, Task } from '../types';
import { storageService } from './storage';

class ReminderService {
  private checkInterval: number = 10000; // Check every 10 seconds for better responsiveness
  private intervalId: number | null = null;

  startReminderCheck(): void {
    if (this.intervalId) return;
    
    // Request permission on start - this might be blocked by browser if not user-initiated
    // We'll also handle this in the UI
    this.requestNotificationPermission();
    
    console.log('Reminder service started');

    this.intervalId = window.setInterval(() => {
      this.checkAndTriggerReminders();
    }, this.checkInterval);
  }

  stopReminderCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  }

  private async checkAndTriggerReminders(): Promise<void> {
    const now = new Date();
    const reminders = storageService.getReminders();
    const tasks = storageService.getTasks();

    console.log(`Checking reminders at ${now.toISOString()}. Found ${reminders.length} reminders.`);

    reminders.forEach(reminder => {
      if (!reminder.isCompleted) {
        const remindTime = new Date(reminder.remindAt);
        console.log(`Reminder ${reminder.id} due at ${remindTime.toISOString()}, isCompleted: ${reminder.isCompleted}`);
        
        if (remindTime <= now) {
          console.log(`Triggering reminder ${reminder.id}`);
          const task = tasks.find(t => t.id === reminder.taskId);
          if (task) {
            this.triggerReminder(reminder, task);
          } else {
            console.warn(`Task not found for reminder ${reminder.id}`);
          }
        }
      }
    });
  }

  private triggerReminder(reminder: Reminder, task: Task): void {
    console.log(`[ReminderService] Triggering reminder for task: ${task.title}`);
    
    // 1. Play Sound (if user interaction allows)
    try {
        // Use a standard beep or a pleasant notification sound
        // Since we don't have an asset, we can try to use AudioContext to generate a beep
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
            
            osc.start();
            osc.stop(ctx.currentTime + 1);
        }
    } catch (e) {
        console.error('Failed to play sound:', e);
    }

    // 2. Browser Notification & Alert
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Time to do task!', {
        body: `${task.title}\n${task.description || ''}`,
        icon: '/vite.svg',
        requireInteraction: true, // Keep notification until user clicks
        tag: reminder.id // Prevent duplicate notifications
      });
      
      // OPTIONAL: Force alert even if notification is granted, just to be super sure?
      // Or maybe the user is in "Do Not Disturb" mode which blocks notifications but not alerts.
      // Let's log it.
      console.log('Notification sent.');
    } else {
        // Fallback: Alert if notification permission not granted
        alert(`⏰ REMINDER: ${task.title}\nTime is up!`);
    }
    
    // 3. Force Modal/Dialog in UI via Custom Event
    // This is the most reliable way as it's part of the webpage DOM
    window.dispatchEvent(new CustomEvent('show-reminder-modal', { 
        detail: { task, reminder } 
    }));

    // Update reminder status
    reminder.isCompleted = true;
    reminder.completedAt = new Date().toISOString();
    
    storageService.saveReminder(reminder);
    
    // Dispatch a custom event so the UI can update if open
    window.dispatchEvent(new Event('reminder-triggered'));
  }
}

export const reminderService = new ReminderService();
