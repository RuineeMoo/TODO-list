import React from 'react';
import { RadioGroup } from '@headlessui/react';
import clsx from 'clsx';

const priorities = [
  { name: 'High', value: 'high', color: 'bg-red-500' },
  { name: 'Medium', value: 'medium', color: 'bg-yellow-500' },
  { name: 'Low', value: 'low', color: 'bg-green-500' },
];

export default function PrioritySelector({ 
  value, 
  onChange 
}: { 
  value: 'high' | 'medium' | 'low', 
  onChange: (val: 'high' | 'medium' | 'low') => void 
}) {
  return (
    <RadioGroup value={value} onChange={onChange} className="mt-2">
      <RadioGroup.Label className="sr-only">Choose a priority</RadioGroup.Label>
      <div className="flex items-center gap-3">
        {priorities.map((priority) => (
          <RadioGroup.Option
            key={priority.name}
            value={priority.value}
            className={({ active, checked }) =>
              clsx(
                'relative flex cursor-pointer rounded-full px-4 py-2 text-sm font-medium focus:outline-none sm:flex-1 items-center justify-center border transition-all',
                checked
                  ? 'border-transparent text-white ' + priority.color
                  : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                active ? 'ring-2 ring-primary ring-offset-2' : ''
              )
            }
          >
            <RadioGroup.Label as="span">{priority.name}</RadioGroup.Label>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
