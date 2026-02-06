import React, { useState, useEffect } from 'react';
import { useReminders } from '../context/ReminderContext';
import { useTasks } from '../context/TaskContext';
import { reminderService } from '../services/reminder';
import { format } from 'date-fns';
import { Bell, CheckCircle, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

function SortableReminderItem({ reminder, title, onDelete, isSelected, onToggleSelect }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reminder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx(
        "px-4 py-4 sm:px-6 hover:bg-gray-50 bg-white transition-colors relative",
        isSelected && "bg-blue-50/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Drag Handle */}
          <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 relative z-10">
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Checkbox */}
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer relative z-10"
            checked={isSelected}
            onChange={() => onToggleSelect(reminder.id)}
          />

          <Bell className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary">{title}</p>
            <p className="text-sm text-gray-500">
              Remind at: {format(new Date(reminder.remindAt), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 ml-2">
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-1 rounded-full text-gray-400 hover:text-red-600"
            title="Delete reminder"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Reminders() {
  const { reminders, deleteReminder, deleteReminders, reorderReminders } = useReminders();
  const { tasks, loading: tasksLoading } = useTasks();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // We only enable reordering for active reminders
  // Note: LocalStorage stores ALL reminders. If we reorder just the active subset, 
  // we need to be careful. Ideally we reorder the whole list.
  // For simplicity, we will just allow reordering visual list of active reminders,
  // and in reorderReminders we might need to merge.
  // Actually, standard practice: just filter view. But DnD requires the underlying list to match.
  // Let's sort active reminders by their order in the main list.
  
  // Actually, to support "Manual Sort", we should rely on the array order.
  // So we don't sort by date by default anymore for active reminders.
  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted).sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
  });

  const getTaskTitle = (taskId: string) => {
    if (tasksLoading) return 'Loading...';
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Deleted Task';
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedIds.length} reminders?`)) {
      deleteReminders(selectedIds);
      setSelectedIds([]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // We are reordering activeReminders.
      // But we need to update the main reminders list.
      // Strategy: Calculate new order of active reminders, then construct new main list.
      
      const oldIndex = activeReminders.findIndex((r) => r.id === active.id);
      const newIndex = activeReminders.findIndex((r) => r.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
          const newActiveOrder = arrayMove(activeReminders, oldIndex, newIndex);
          
          // Reconstruct full list: newActiveOrder + completedReminders (or however they were mixed)
          // To preserve completed reminders' positions relative to each other is easy (they are separate).
          // But usually we just put active first or mix them?
          // LocalStorage stores them all.
          // Let's just put active ones first in the new list, followed by completed ones.
          // This effectively "groups" them in storage too, which is fine.
          
          const newFullList = [...newActiveOrder, ...reminders.filter(r => r.isCompleted)];
          reorderReminders(newFullList);
      }
    }
  };

  return (
    <div className="relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminder Center</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your upcoming and past reminders.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming</h2>
          {activeReminders.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming reminders.</p>
          ) : (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                    items={activeReminders.map(r => r.id)}
                    strategy={verticalListSortingStrategy}
                >
                  <ul role="list" className="divide-y divide-gray-200">
                    {activeReminders.map((reminder) => (
                      <SortableReminderItem
                        key={reminder.id}
                        reminder={reminder}
                        title={getTaskTitle(reminder.taskId)}
                        onDelete={deleteReminder}
                        isSelected={selectedIds.includes(reminder.id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        <div>
           <h2 className="text-lg font-medium text-gray-900 mb-4">History</h2>
            {completedReminders.length === 0 ? (
            <p className="text-gray-500 text-sm">No reminder history.</p>
          ) : (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {completedReminders.map((reminder) => (
                  <li key={reminder.id} className="px-4 py-4 sm:px-6 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="truncate text-sm font-medium text-gray-600">{getTaskTitle(reminder.taskId)}</p>
                          <p className="text-sm text-gray-500">
                             Reminded at: {format(new Date(reminder.remindAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                           onClick={() => deleteReminder(reminder.id)}
                           className="p-1 rounded-full text-gray-400 hover:text-red-600"
                           title="Delete history"
                         >
                           <Trash2 className="h-5 w-5" />
                         </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar for Selection */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white border border-accent shadow-lg rounded-full px-6 py-3 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedIds.length} selected
              </span>
              <div className="h-4 w-px bg-gray-300" />
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-accent/90"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
