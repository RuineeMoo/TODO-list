import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Trash2, GripVertical } from 'lucide-react';
import { Task } from '../types';
import { useTasks } from '../context/TaskContext';
import clsx from 'clsx';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: () => void;
  dragHandleProps?: any;
}

export default function TaskCard({ task, isSelected, onSelect, dragHandleProps }: TaskCardProps) {
  const { deleteTask, updateTask } = useTasks();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: newStatus });
  };

  const priorityColors = {
    high: 'bg-red-50 text-red-700 ring-red-600/20',
    medium: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    low: 'bg-green-50 text-green-700 ring-green-600/20',
  };

  return (
    <div className={clsx(
      "relative flex items-center space-x-3 rounded-lg border bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-all",
      isSelected ? "border-primary ring-1 ring-primary" : "border-gray-300 hover:border-gray-400",
      task.priority === 'high' && !isSelected && "border-l-4 border-l-red-500"
    )}>
      {/* Drag Handle */}
      {dragHandleProps && (
        <div {...dragHandleProps} className="relative z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 -ml-2 p-1">
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      {/* Checkbox for Selection */}
      {onSelect && (
        <div className="relative z-10 flex h-5 items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            checked={isSelected}
            onChange={(e) => {
                e.stopPropagation();
                onSelect();
            }}
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link to={`/task/${task.id}`} className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <div className="flex items-center justify-between mb-1">
            <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
            <span className={clsx(
              "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
              priorityColors[task.priority]
            )}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          <p className="truncate text-sm text-gray-500">{task.description}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500 gap-4">
             {task.dueDate && (
               <div className="flex items-center gap-1 text-primary">
                 <Calendar className="h-3 w-3" />
                 {format(new Date(task.dueDate), 'MMM d, yyyy HH:mm')}
               </div>
             )}
             <div className="flex items-center gap-1">
               <Clock className="h-3 w-3" />
               Created: {format(new Date(task.createdAt), 'MMM d')}
             </div>
          </div>
        </Link>
      </div>
      <div className="flex shrink-0 gap-2 z-10">
        <button
          onClick={handleToggleStatus}
          className={clsx(
            "p-1 rounded-full hover:bg-gray-100",
            task.status === 'completed' ? "text-green-600" : "text-gray-400"
          )}
          title={task.status === 'completed' ? "Mark as pending" : "Mark as completed"}
        >
          <CheckCircle className="h-5 w-5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50"
          title="Delete task"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
