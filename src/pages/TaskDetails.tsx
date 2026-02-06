import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useReminders } from '../context/ReminderContext';
import { ArrowLeft, Calendar, Bell, Trash2, Edit } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import ReminderModal from '../components/ReminderModal';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, deleteTask, updateTask } = useTasks();
  const { reminders, deleteReminder } = useReminders();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const task = tasks.find(t => t.id === id);
  const taskReminders = reminders.filter(r => r.taskId === id);

  if (!task) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Task not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary hover:text-primary/80"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      navigate('/');
    }
  };

  const handleToggleStatus = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: newStatus });
  };

  const priorityColors = {
    high: 'bg-red-50 text-red-700 ring-red-600/20',
    medium: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    low: 'bg-green-50 text-green-700 ring-green-600/20',
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
              {task.title}
              <span className={clsx(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                priorityColors[task.priority]
              )}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {format(new Date(task.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Edit className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Edit
            </button>
            <button
              onClick={handleToggleStatus}
              className={clsx(
                "inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                task.status === 'completed' 
                  ? "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  : "bg-green-600 text-white hover:bg-green-500 focus-visible:outline-green-600"
              )}
            >
              {task.status === 'completed' ? 'Mark as Pending' : 'Complete Task'}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <Trash2 className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{task.description || 'No description provided.'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {task.dueDate ? format(new Date(task.dueDate), 'PPP p') : 'No due date'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{task.status}</dd>
            </div>
             <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center justify-between">
                <span>Reminders</span>
                <button
                  onClick={() => setIsReminderOpen(true)}
                  className="text-primary hover:text-primary/80 text-xs font-medium"
                >
                  + Add Reminder
                </button>
              </dt>
              <dd className="mt-2 text-sm text-gray-900">
                {taskReminders.length === 0 ? (
                  <p className="text-gray-500 italic">No reminders set.</p>
                ) : (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {taskReminders.map(reminder => (
                      <li key={reminder.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <Bell className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                          <span className="ml-2 flex-1 w-0 truncate">
                            {format(new Date(reminder.remindAt), 'PPP p')}
                            {reminder.isCompleted && <span className="ml-2 text-green-600 text-xs">(Triggered)</span>}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <TaskForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={task}
      />

      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        taskId={task.id}
      />
    </div>
  );
}
