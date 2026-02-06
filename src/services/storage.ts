import { Task, Reminder } from '../types';

export class LocalStorageService {
  private readonly TASKS_KEY = 'important_tasks';
  private readonly REMINDERS_KEY = 'important_reminders';

  getTasks(): Task[] {
    const data = localStorage.getItem(this.TASKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveTask(task: Task): void {
    console.log('[Storage] Saving task:', task);
    const tasks = this.getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);

    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }

    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  saveAllTasks(tasks: Task[]): void {
    console.log('[Storage] Saving all tasks order/update');
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  deleteTask(taskId: string): void {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(filteredTasks));
    // Also delete associated reminders
    this.deleteRemindersForTask(taskId);
  }

  deleteTasks(taskIds: string[]): void {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => !taskIds.includes(t.id));
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(filteredTasks));
    // Delete associated reminders
    taskIds.forEach(id => this.deleteRemindersForTask(id));
  }

  getReminders(): Reminder[] {
    const data = localStorage.getItem(this.REMINDERS_KEY);
    console.log(`[Storage] Reading reminders from ${this.REMINDERS_KEY}:`, data);
    return data ? JSON.parse(data) : [];
  }

  saveReminder(reminder: Reminder): void {
    console.log('[Storage] Saving reminder:', reminder);
    const reminders = this.getReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);

    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }

    const json = JSON.stringify(reminders);
    console.log(`[Storage] Writing reminders to ${this.REMINDERS_KEY}:`, json);
    localStorage.setItem(this.REMINDERS_KEY, json);
    
    // Verify write
    const verify = localStorage.getItem(this.REMINDERS_KEY);
    console.log('[Storage] Verify write:', verify);
  }

  saveAllReminders(reminders: Reminder[]): void {
      console.log('[Storage] Saving all reminders order/update');
      localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(reminders));
  }

  deleteReminder(reminderId: string): void {
    const reminders = this.getReminders();
    const filteredReminders = reminders.filter(r => r.id !== reminderId);
    localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(filteredReminders));
  }

  deleteReminders(reminderIds: string[]): void {
      const reminders = this.getReminders();
      const filteredReminders = reminders.filter(r => !reminderIds.includes(r.id));
      localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(filteredReminders));
  }

  deleteRemindersForTask(taskId: string): void {
    const reminders = this.getReminders();
    const filteredReminders = reminders.filter(r => r.taskId !== taskId);
    localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(filteredReminders));
  }
}

export const storageService = new LocalStorageService();
