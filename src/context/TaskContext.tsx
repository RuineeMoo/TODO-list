import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types';
import { storageService } from '../services/storage';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  reorderTasks: (tasks: Task[]) => void;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTasks = () => {
    setTasks(storageService.getTasks());
  };

  useEffect(() => {
    refreshTasks();
    setLoading(false);
  }, []);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      status: taskData.status || 'pending',
    };
    storageService.saveTask(newTask);
    refreshTasks();
    return newTask.id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      if (updates.status === 'completed' && task.status !== 'completed') {
        updatedTask.completedAt = new Date().toISOString();
      } else if (updates.status !== 'completed' && task.status === 'completed') {
        updatedTask.completedAt = null;
      }
      storageService.saveTask(updatedTask);
      refreshTasks();
    }
  };

  const deleteTask = (id: string) => {
    storageService.deleteTask(id);
    refreshTasks();
  };

  const deleteTasks = (ids: string[]) => {
      storageService.deleteTasks(ids);
      refreshTasks();
  };

  const reorderTasks = (newTasks: Task[]) => {
      setTasks(newTasks); // Optimistic update
      storageService.saveAllTasks(newTasks);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, deleteTasks, reorderTasks, loading }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
