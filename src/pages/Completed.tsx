import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskList from '../components/TaskList';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function Completed() {
  const { tasks, deleteTasks, reorderTasks } = useTasks();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const completedTasks = tasks
    .filter(t => t.status === 'completed')
    // We sort by completedAt by default, but if user reorders, we might want to respect that?
    // The current TaskList uses the array order. 
    // If we want to support reordering, we should rely on the array order in 'tasks' 
    // but 'tasks' contains mixed pending/completed.
    // If we only filter, the index in filtered list != index in main list.
    // Reordering a filtered list is tricky.
    // Simpler approach for now: Just allow multi-select delete. 
    // Reordering completed tasks is less common. 
    // BUT user explicitly asked for "draggable sort" in completed module.
    // So I must implement it.
    // To support reordering of a subset (completed), we need to update their relative order in the main list.
    // Or we just let TaskList handle visual reorder and we update the main list accordingly.
    // Actually, `reorderTasks` expects the full list.
    // If I pass a subset to `reorderTasks`, it might overwrite the full list with just the subset! 
    // checking TaskContext: `reorderTasks = (newTasks) => { setTasks(newTasks); storage... }`
    // YES, it overwrites! DANGEROUS.
    
    // I need to implement a safe `reorderSubset` or similar in context, 
    // OR handling it here:
    // 1. Get new order of completed tasks.
    // 2. Merge with pending tasks (keeping pending tasks in their original relative positions or separate).
    // 3. Save full list.
    ;
    
  // Let's sort initially by completedAt if not manually reordered? 
  // For now, let's just use the order they appear in `tasks` list (which is user defined order).
  // So we just filter.
  
  const completedTasksList = tasks.filter(t => t.status === 'completed');

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedIds.length} completed tasks?`)) {
      deleteTasks(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleReorder = (newOrderedCompleted: any[]) => {
      // We have the new order of COMPLETED tasks.
      // We need to construct the full list.
      // Strategy: Keep pending tasks where they are (relative to each other? or just group them?)
      // Simplest: Pending tasks first, then Completed tasks (in new order).
      // Or: Interleaved? No, usually separated.
      // Let's just put all pending tasks first, then the new ordered completed tasks.
      // This might change their absolute position but keeps the group order.
      const pendingTasks = tasks.filter(t => t.status !== 'completed');
      const newFullList = [...pendingTasks, ...newOrderedCompleted];
      reorderTasks(newFullList);
  };

  return (
    <div className="relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Completed Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          History of your accomplishments.
        </p>
      </div>

      <TaskList 
        tasks={completedTasksList} 
        onReorder={handleReorder}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        isReorderable={true}
      />

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
