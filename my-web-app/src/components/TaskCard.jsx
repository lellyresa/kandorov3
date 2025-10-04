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

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const now = new Date();
    const due = new Date(dueDate);

    // Normalize to midnight to compare by calendar day
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((startOfDue - startOfToday) / msPerDay);

    // 1) Overdue
    if (diffDays < 0) {
      const past = Math.abs(diffDays);
      return past === 1 ? '1 day ago' : `${past} days ago`;
    }

    // 2) Today
    if (diffDays === 0) return 'Today';

    // 3) Tomorrow
    if (diffDays === 1) return 'Tomorrow';

    // 4) 2-7 days away
    if (diffDays >= 2 && diffDays <= 7) {
      return `in ${diffDays} days`;
    }

    // 5) 8+ days away → Month abbreviation + day number
    return `${months[startOfDue.getMonth()]} ${startOfDue.getDate()}`;
  };

  const getDueDateColor = (dueDate) => {
    if (!dueDate) return '#9CA3AF'; // gray-400 fallback for no due date

    const now = new Date();
    const due = new Date(dueDate);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((startOfDue - startOfToday) / msPerDay);

    if (diffDays < 0) return '#EF4444'; // overdue - red
    if (diffDays === 0) return '#EF4444'; // today - red
    if (diffDays === 1) return '#FB923C'; // tomorrow - orange
    if (diffDays === 2) return '#FB923C'; // 2 days - orange
    if (diffDays === 3) return '#FFC107'; // 3 days - yellow
    return '#999999'; // 4+ days - gray (neutral, no urgency)
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
        className="opacity-80 p-4 transform rotate-3 scale-105"
      style={{
          ...style,
          background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          borderRadius: 12
        }}
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
      style={{
        ...style,
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
      }}
      {...attributes}
      {...listeners}
      className={`group cursor-grab active:cursor-grabbing transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.7)] relative overflow-hidden ${
        isFocusTask ? '' : ''
      }`}
    >
      {/* Priority left border */}
      <div
        className="absolute left-0 top-0 bottom-0 rounded-l-lg"
        style={{ width: '3px', backgroundColor: getPriorityBorderHex(task.priority) }}
        aria-hidden="true"
      />
      <div className="px-5 py-4">
        {/* Clean Top Row */}
        <div className="flex items-start justify-between mb-6">
          {/* Title - Top Left */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold text-white leading-tight text-[16px]">
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
            className="p-1 text-[#666666] hover:text-white transition-colors ml-2"
            title="Open task details"
          >
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
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
            <div className="flex items-center space-x-1">
              <span
                className="transition-colors duration-300"
                style={{ color: getDueDateColor(task.dueDate) }}
              >
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
              className={`px-3 py-[3px] rounded-full text-xs font-mono`}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#808080'
              }}
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
