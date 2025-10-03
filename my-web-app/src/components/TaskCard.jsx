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

  const getPriorityColor = (priority) => {
    const priorityLevel = priority?.toLowerCase() || 'medium';
    switch (priorityLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityTextColor = (priority) => {
    const priorityLevel = priority?.toLowerCase() || 'medium';
    switch (priorityLevel) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityRgb = (priority) => {
    const priorityLevel = priority?.toLowerCase() || 'medium';
    switch (priorityLevel) {
      // Tailwind 500 scale approximations
      case 'low': return { r: 34, g: 197, b: 94 };     // green-500
      case 'medium': return { r: 234, g: 179, b: 8 };  // yellow-500
      case 'high': return { r: 239, g: 68, b: 68 };    // red-500
      default: return { r: 100, g: 116, b: 139 };      // slate-500
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
      {/* Priority Corner Sweep (CSS radial gradient) */}
      <div
        className="absolute bottom-0 left-0 w-6 h-6 rounded-bl-xl pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(120% 120% at 0% 100%, rgba(${getPriorityRgb(task.priority).r}, ${getPriorityRgb(task.priority).g}, ${getPriorityRgb(task.priority).b}, 0.56) 0%, rgba(${getPriorityRgb(task.priority).r}, ${getPriorityRgb(task.priority).g}, ${getPriorityRgb(task.priority).b}, 0.18) 40%, rgba(${getPriorityRgb(task.priority).r}, ${getPriorityRgb(task.priority).g}, ${getPriorityRgb(task.priority).b}, 0) 60%)`,
          zIndex: 0,
          filter: 'brightness(1.25)'
        }}
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
            <ChevronRight className="w-4 h-4" />
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
          {/* Due Date - Bottom Left */}
          <div className="flex items-center space-x-1 text-gray-400" onClick={(e) => e.stopPropagation()}>
            <span>
              {formatDueDate(task.dueDate) || 'No due date'}
            </span>
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
              className={`px-3 py-1.5 rounded-full text-xs font-mono ${
                isFocusTask
                  ? 'bg-accent-500/30 text-accent-100 border border-accent-500/50'
                  : 'bg-gray-700/80 text-gray-200'
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
