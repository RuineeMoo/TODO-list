export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  completedAt: string | null;
}

export interface Reminder {
  id: string;
  taskId: string;
  remindAt: string;
  isRecurring: boolean;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | null;
  isCompleted: boolean;
  completedAt: string | null;
}
