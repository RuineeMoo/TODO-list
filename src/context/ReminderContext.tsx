import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Reminder } from '../types';
import { storageService } from '../services/storage';
import { reminderService } from '../services/reminder';

interface ReminderContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'isCompleted' | 'completedAt'>) => void;
  deleteReminder: (id: string) => void;
  deleteReminders: (ids: string[]) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  reorderReminders: (reminders: Reminder[]) => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const refreshReminders = () => {
    const data = storageService.getReminders();
    console.log('Refreshing reminders, count:', data.length);
    setReminders(data);
  };

  useEffect(() => {
    refreshReminders();
    reminderService.startReminderCheck();
    console.log('ReminderContext mounted');

    const handleReminderTriggered = () => {
      console.log('Reminder triggered event received');
      refreshReminders();
    };

    window.addEventListener('reminder-triggered', handleReminderTriggered);

    return () => {
      reminderService.stopReminderCheck();
      window.removeEventListener('reminder-triggered', handleReminderTriggered);
    };
  }, []);

  const addReminder = (reminderData: Omit<Reminder, 'id' | 'isCompleted' | 'completedAt'>) => {
    console.log('Adding reminder:', reminderData);
    // Use a simple ID generation strategy to avoid potential crypto.randomUUID issues
    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    const newReminder: Reminder = {
      ...reminderData,
      id: newId,
      isCompleted: false,
      completedAt: null,
    };
    storageService.saveReminder(newReminder);
    refreshReminders();
    console.log('Reminder added and saved:', newReminder);
  };

  const deleteReminder = (id: string) => {
    storageService.deleteReminder(id);
    refreshReminders();
  };

  const deleteReminders = (ids: string[]) => {
      storageService.deleteReminders(ids);
      refreshReminders();
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const updatedReminder = { ...reminder, ...updates };
      storageService.saveReminder(updatedReminder);
      refreshReminders();
    }
  };

  const reorderReminders = (newReminders: Reminder[]) => {
      setReminders(newReminders);
      storageService.saveAllReminders(newReminders);
  };

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, deleteReminder, deleteReminders, updateReminder, reorderReminders }}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
