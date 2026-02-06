import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundImage: string | null;
  setBackgroundImage: (url: string | null) => void;
  cuteMode: boolean;
  setCuteMode: (enabled: boolean) => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  backgroundImage, 
  setBackgroundImage,
  cuteMode,
  setCuteMode
}: SettingsModalProps) {
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
      if (isOpen) {
          setUrlInput(backgroundImage || '');
      }
  }, [isOpen, backgroundImage]);

  const handleSaveUrl = () => {
    setBackgroundImage(urlInput || null);
    // onClose(); // Keep open to see effect?
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        setUrlInput(result); // Show data URL (might be long, maybe truncate visually)
      };
      reader.readAsDataURL(file);
    }
  };

  const presets = [
    'https://images.unsplash.com/photo-1490750967868-58cb75063ed4?auto=format&fit=crop&w=2000&q=80', // Flowers
    'https://images.unsplash.com/photo-1516550893923-42d28e560343?auto=format&fit=crop&w=2000&q=80', // Stars
    'https://images.unsplash.com/photo-1534234828563-025c9c9b68a6?auto=format&fit=crop&w=2000&q=80', // Minimal Nature
  ];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                    <ImageIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                      Appearance Settings
                    </Dialog.Title>
                    <div className="mt-4 space-y-6">
                        
                        {/* Background Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Background Image
                            </label>
                            
                            <div className="flex gap-2 mb-3">
                                {presets.map((src, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => {
                                            setBackgroundImage(src);
                                            setUrlInput(src);
                                        }}
                                        className="w-16 h-16 rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:outline-none"
                                    >
                                        <img src={src} alt="Preset" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                <button 
                                    onClick={() => {
                                        setBackgroundImage(null);
                                        setUrlInput('');
                                    }}
                                    className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 hover:border-primary hover:text-primary"
                                >
                                    None
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder="Enter Image URL..."
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                                <button
                                    onClick={handleSaveUrl}
                                    className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                                >
                                    Apply
                                </button>
                            </div>
                            
                            <div className="mt-2 text-center">
                                <span className="text-sm text-gray-500">OR</span>
                            </div>

                            <div className="mt-2">
                                <label className="block w-full cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-4 text-center hover:border-primary">
                                    <span className="text-sm text-gray-600">Upload from device</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        {/* Cute Mode Section */}
                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-accent" />
                                    Cute Mode
                                </span>
                                <span className="text-xs text-gray-500">Adds floating stickers and cute effects</span>
                            </div>
                            <button
                                onClick={() => setCuteMode(!cuteMode)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                    cuteMode ? 'bg-accent' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        cuteMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
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