import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { Plus, Search, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { tasks, reorderTasks, deleteTasks } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Only allow reordering if we are viewing the full list (no search, no priority filter)
  // We also filter out completed tasks for the main view
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  
  const isReorderable = searchQuery === '' && filterPriority === 'all';

  const filteredTasks = activeTasks
    .filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(t => filterPriority === 'all' || t.priority === filterPriority);
    // Removed default sort by date to respect manual order

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedIds.length} tasks?`)) {
      deleteTasks(selectedIds);
      setSelectedIds([]);
    }
  };

  // Count high priority tasks for overview
  const highPriorityCount = activeTasks.filter(t => t.priority === 'high').length;
  const todayCount = activeTasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const now = new Date();
      return due.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TODO List</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview: <span className="font-medium text-red-600">{highPriorityCount} High Priority</span> • <span className="font-medium text-accent">{todayCount} Due Today</span>
          </p>
        </div>
        <div className="flex gap-2">
           <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Task
          </button>
        </div>
      </div>

      <TaskList 
        tasks={filteredTasks} 
        onReorder={isReorderable ? reorderTasks : undefined}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        isReorderable={isReorderable}
      />

      <TaskForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

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
