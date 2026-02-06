import React, { useState } from 'react';
import { useReminders } from '../context/ReminderContext';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface ReminderModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderModal({ taskId, isOpen, onClose }: ReminderModalProps) {
  const { addReminder } = useReminders();
  const [remindAt, setRemindAt] = useState('');

  const handleDirectSubmit = () => {
    // Force immediate alert to debug event handler
    // alert('Debug: Button Clicked'); 
    
    if (!remindAt) {
        alert('Please select a time first');
        return;
    }

    try {
        const rawCurrent = localStorage.getItem('important_reminders');
        const list = rawCurrent ? JSON.parse(rawCurrent) : [];
        
        console.log('Current taskId when adding reminder:', taskId);

        const newReminder = {
          id: Date.now().toString(),
          taskId: taskId, // Ensure we use the prop passed to the component
          remindAt: new Date(remindAt).toISOString(),
          isRecurring: false,
          recurrenceType: null,
          isCompleted: false,
          completedAt: null
        };
        
        list.push(newReminder);
        localStorage.setItem('important_reminders', JSON.stringify(list));
        
        // Force refresh via window event since Context might be out of sync
        window.dispatchEvent(new Event('reminder-triggered'));
        
        alert('Reminder saved! You should see it in the list now.');
        setRemindAt('');
        onClose();
        window.location.reload(); // Force reload to ensure state is fresh
    } catch (error) {
        console.error('Error in handleDirectSubmit:', error);
        alert('Error saving reminder: ' + error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Set Reminder
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="space-y-4">
                        <div>
                          <input
                            type="datetime-local"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                            value={remindAt}
                            onChange={(e) => setRemindAt(e.target.value)}
                          />
                        </div>
                        <div className="mt-5 sm:mt-6">
                          <button
                            type="button"
                            onClick={handleDirectSubmit}
                            className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            Set Reminder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
