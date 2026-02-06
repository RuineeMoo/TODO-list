import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskListProps {
  tasks: Task[];
  onReorder?: (tasks: Task[]) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  isReorderable?: boolean;
}

import { AnimatePresence, motion } from 'framer-motion';

function SortableTaskItem({ task, isSelected, onToggleSelect, isReorderable }: { task: Task, isSelected: boolean, onToggleSelect?: (id: string) => void, isReorderable?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isReorderable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div 
        ref={setNodeRef} 
        style={style} 
        {...attributes}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        layoutId={task.id}
    >
      <TaskCard
        task={task}
        isSelected={isSelected}
        onSelect={onToggleSelect ? () => onToggleSelect(task.id) : undefined}
        dragHandleProps={isReorderable ? listeners : undefined}
      />
    </motion.div>
  );
}

export default function TaskList({ tasks, onReorder, selectedIds = [], onToggleSelect, isReorderable = false }: TaskListProps) {
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

    if (active.id !== over?.id && onReorder) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over?.id);
      onReorder(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No tasks found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              isSelected={selectedIds.includes(task.id)}
              onToggleSelect={onToggleSelect}
              isReorderable={isReorderable}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
