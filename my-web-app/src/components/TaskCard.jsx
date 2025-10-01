import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, CheckCircle, Circle, CircleDot, Flag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TASK_PRIORITY } from '../types';

export default function TaskCard({
  task,
  columnId,
  showFocusToggle = false,
  isFocusTask = false,
  onSelectFocus = () => {}
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

  const handleCardClick = () => {
    if (project) {
      actions.openTaskModal(task, project.id);
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case TASK_PRIORITY.HIGH:
        return {
          icon: 'text-danger-400',
          badge: 'bg-danger-500/20 text-danger-300 border-danger-500/30',
          dot: 'bg-danger-400'
        };
      case TASK_PRIORITY.MEDIUM:
        return {
          icon: 'text-yellow-400',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          dot: 'bg-yellow-400'
        };
      case TASK_PRIORITY.LOW:
        return {
          icon: 'text-green-400',
          badge: 'bg-green-500/20 text-green-300 border-green-500/30',
          dot: 'bg-green-400'
        };
      default:
        return {
          icon: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          dot: 'bg-gray-400'
        };
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="modern-card border-2 border-accent-500/50 border-dashed opacity-60 p-4 shadow-dark-large"
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
      className={`modern-card modern-card-hover group cursor-pointer transition-transform hover:scale-[1.02] ${
        isFocusTask ? 'ring-2 ring-accent-500/40' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        {/* Drag Handle */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="p-1 text-gray-400 hover:text-accent-400 cursor-grab active:cursor-grabbing rounded hover:bg-gray-700/50 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showFocusToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening modal when clicking focus toggle
                  onSelectFocus();
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
            <div className="flex items-center space-x-2">
              {/* Priority Indicator */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs ${getPriorityStyles(task.priority).badge}`}>
                <Flag className={`w-3 h-3 ${getPriorityStyles(task.priority).icon}`} />
                <span className="capitalize font-medium">{task.priority}</span>
              </div>

              {/* Time Tracking */}
              <div
                className={`px-2 py-1 rounded-lg text-xs font-mono ${
                  isFocusTask
                    ? 'bg-accent-500/20 text-accent-100 border border-accent-500/40'
                    : 'bg-gray-800/60 text-gray-300'
                }`}
              >
                {formatWorkTime(task.workSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Task Content */}
        <div>
          <h4 className="font-medium text-white mb-2 leading-tight">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-300 mb-3 leading-relaxed line-clamp-3">
              {task.description}
            </p>
          )}

          {/* Task Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-3">
              {task.pomodoroCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-accent-400" />
                  <span className="text-accent-400">{task.pomodoroCount}</span>
                </div>
              )}
              <span className="text-gray-500">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
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
