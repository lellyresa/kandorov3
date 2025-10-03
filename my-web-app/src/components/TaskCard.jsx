import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckCircle, Circle, CircleDot, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TaskCard({
  task,
  columnId,
  showFocusToggle = false,
  isFocusTask = false,
  onSelectFocus = () => {},
  showDescription = true
}) {
  const { state, actions } = useApp();

  // Find the project that contains this task
  const project = state.projects.find(p =>
    p.tasks.some(t => t.id === task.id)
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId,
    },
    activationConstraint: {
      delay: 200,
      distance: 5,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatWorkTime = (totalSeconds) => {
    const seconds = Math.max(0, totalSeconds || 0);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  };

  const getPriorityBorderHex = (priority) => {
    const level = (priority || 'medium').toLowerCase();
    switch (level) {
      case 'high':
        return '#D24B4B'; // deeper, less vibrant red
      case 'low':
        return '#2FA25B'; // deeper, less vibrant green
      case 'medium':
      default:
        return '#E5AE06'; // 10% darker yellow
    }
  };

  const handleCardClick = () => {
    if (project) {
      actions.openTaskModal(task, project.id);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="modern-card border-2 border-accent-500/60 border-solid opacity-80 p-4 shadow-dark-large transform rotate-3 scale-105"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600/50 rounded mb-2"></div>
          <div className="h-3 bg-gray-600/30 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`modern-card modern-card-hover group cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] relative overflow-hidden ${
        isFocusTask ? 'ring-2 ring-accent-500/40' : ''
      }`}
    >
      {/* Priority left border */}
      <div
        className="absolute left-0 top-0 bottom-0 rounded-l-lg"
        style={{ width: '3px', backgroundColor: getPriorityBorderHex(task.priority) }}
        aria-hidden="true"
      />
      <div className="p-4">
        {/* Clean Top Row */}
        <div className="flex items-start justify-between mb-3">
          {/* Title - Top Left */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-medium text-white leading-tight">
              {task.title}
            </h4>
          </div>

          {/* Chevron - Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening modal when clicking expand
              handleCardClick();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="p-1 text-gray-400 hover:text-accent-400 transition-colors ml-2"
            title="Open task details"
          >
            <ChevronRight className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
          </button>
        </div>

        {/* Task Content */}
        {showDescription && task.description && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
              {task.description}
            </p>
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex items-center justify-between text-xs">
          {/* Priority and Due Date - Bottom Left */}
          <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
            {/* Due Date */}
            <div className="flex items-center space-x-1 text-gray-400">
              <span>
                {formatDueDate(task.dueDate) || 'No due date'}
              </span>
            </div>
          </div>

          {/* Timer and Status - Bottom Right */}
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {showFocusToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening modal when clicking focus toggle
                  onSelectFocus();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className={`p-1 rounded-full transition-colors ${
                  isFocusTask
                    ? 'text-accent-200 bg-accent-500/20 hover:bg-accent-500/30'
                    : 'text-gray-500 hover:text-accent-300 hover:bg-gray-700/40'
                }`}
                title={isFocusTask ? 'Currently focused task' : 'Set as focused task'}
              >
                {isFocusTask ? (
                  <CircleDot className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
            )}

            <div
              className={`px-3 py-[3px] rounded-full text-xs font-mono ${
                isFocusTask
                  ? 'bg-accent-500/30 text-accent-100 border border-accent-500/50'
                  : 'bg-gray-700/80 text-gray-200 border border-gray-600/60'
              }`}
            >
              {formatWorkTime(task.workSeconds)}
            </div>

            {task.status === 'done' && (
              <div className="flex items-center space-x-1 text-success-400">
                <CheckCircle className="w-3 h-3" />
                <span className="font-medium">Done</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
