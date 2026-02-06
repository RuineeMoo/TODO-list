import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, CheckCircle, Bell, Menu, AlertTriangle, Sun, Moon, Settings } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import clsx from 'clsx';
import { reminderService } from '../services/reminder';
import { useTheme } from '../hooks/useTheme';
import SettingsModal from './SettingsModal';
import Decoration from './Decoration';

const navigation = [
  { name: '任务列表', href: '/', icon: List },
  { name: '提醒中心', href: '/reminders', icon: Bell },
  { name: '已完成', href: '/completed', icon: CheckCircle },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { theme, toggleTheme } = useTheme();
  const [modalData, setModalData] = useState<{task: any, reminder: any} | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => localStorage.getItem('app_bg'));
  const [cuteMode, setCuteMode] = useState<boolean>(() => localStorage.getItem('app_cute') === 'true');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // Listen for custom reminder modal event
    const handleShowModal = (e: any) => {
        console.log('Received show-reminder-modal event', e.detail);
        setModalData(e.detail);
    };
    
    window.addEventListener('show-reminder-modal', handleShowModal);
    
    return () => {
        window.removeEventListener('show-reminder-modal', handleShowModal);
    };
  }, []);

  // Persist settings
  useEffect(() => {
      if (backgroundImage) localStorage.setItem('app_bg', backgroundImage);
      else localStorage.removeItem('app_bg');
  }, [backgroundImage]);

  useEffect(() => {
      localStorage.setItem('app_cute', String(cuteMode));
  }, [cuteMode]);

  const closeModal = () => {
      setModalData(null);
  };

  const requestPermission = async () => {
    await reminderService.requestNotificationPermission();
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  return (
    <div 
        className="min-h-screen transition-all duration-500"
        style={backgroundImage ? { 
            backgroundImage: `url(${backgroundImage})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed' 
        } : {}}
    >
      {/* Overlay for readability if background exists */}
      {backgroundImage && <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm -z-10" />}
      
      {/* Cute Decorations */}
      {cuteMode && <Decoration />}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        cuteMode={cuteMode}
        setCuteMode={setCuteMode}
      />

      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 dark:bg-gray-900/95 px-6 pb-4 backdrop-blur-md">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-8 w-auto"
                      src="/vite.svg"
                      alt="Task Master"
                    />
                    <span className="ml-4 text-lg font-bold text-gray-900 dark:text-white">Task Master</span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={clsx(
                                  location.pathname === item.href
                                    ? 'bg-primary/10 text-primary dark:bg-gray-800'
                                    : 'text-gray-700 hover:text-primary hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={clsx(
                                    location.pathname === item.href ? 'text-primary' : 'text-gray-400 group-hover:text-primary dark:text-gray-500',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto space-y-2">
                        <button
                          onClick={() => setIsSettingsOpen(true)}
                          className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                           <Settings className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary" aria-hidden="true" />
                           Settings
                        </button>
                        <button
                          onClick={toggleTheme}
                          className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          {theme === 'dark' ? (
                            <Sun className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary dark:text-gray-500" aria-hidden="true" />
                          ) : (
                            <Moon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary" aria-hidden="true" />
                          )}
                          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white/95 dark:bg-gray-900/95 px-6 pb-4 backdrop-blur-md">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="/vite.svg"
              alt="Task Master"
            />
             <span className="ml-4 text-lg font-bold text-gray-900 dark:text-white">Task Master</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          location.pathname === item.href
                            ? 'bg-primary/10 text-primary dark:bg-gray-800'
                            : 'text-gray-700 hover:text-primary hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            location.pathname === item.href ? 'text-primary' : 'text-gray-400 group-hover:text-primary dark:text-gray-500',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto space-y-2">
                <button
                   onClick={() => setIsSettingsOpen(true)}
                   className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <Settings className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary" aria-hidden="true" />
                    Settings
                </button>
                <button
                  onClick={toggleTheme}
                  className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary dark:text-gray-500" aria-hidden="true" />
                  ) : (
                    <Moon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary" aria-hidden="true" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Global Reminder Modal */}
        <Transition.Root show={!!modalData} as={Fragment}>
          <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
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
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Bell className="h-6 w-6 text-primary dark:text-blue-300" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                          Time to do task!
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-lg font-bold text-primary dark:text-blue-400">
                            {modalData?.task?.title}
                          </p>
                          {modalData?.task?.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {modalData?.task?.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        onClick={closeModal}
                      >
                        Got it!
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
             <div className="flex flex-1"></div>
             <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notification Permission Indicator */}
              {permission === 'denied' && (
                <button 
                  onClick={requestPermission}
                  className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-xs"
                  title="Enable Notifications"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Enable Alerts</span>
                </button>
              )}
             </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}