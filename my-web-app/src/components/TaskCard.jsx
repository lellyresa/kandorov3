import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, CheckCircle, Circle, CircleDot } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskModal from './TaskModal';

export default function TaskCard({
  task,
  columnId,
  onDelete,
  showFocusToggle = false,
  isFocusTask = false,
  onSelectFocus = () => {}
}) {
  const { state } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find the project and column that contains this task
  const project = state.projects.find(p =>
    p.tasks.some(t => t.id === task.id)
  );

  const column = project?.columns.find(c => c.id === columnId);

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

  const priorityColors = {
    low: 'bg-green-500/20 text-green-300 border-green-500/40',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    high: 'bg-red-500/20 text-red-300 border-red-500/40',
  };

  const priorityLabels = {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
  };

  const handleCardClick = (e) => {
    // Don't open modal if clicking on drag handle or focus toggle
    if (e.target.closest('.drag-handle') || e.target.closest('.focus-toggle')) {
      return;
    }
    setIsModalOpen(true);
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
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`modern-card modern-card-hover cursor-pointer ${
          isFocusTask ? 'ring-2 ring-accent-500/40' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="p-4">
          {/* Drag Handle and Priority Badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="drag-handle p-1 text-gray-400 hover:text-accent-400 cursor-grab active:cursor-grabbing rounded hover:bg-gray-700/50 transition-colors"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-mono border ${priorityColors[task.priority || 'medium']}`}>
                {priorityLabels[task.priority || 'medium']}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {showFocusToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFocus();
                  }}
                  className={`focus-toggle p-1 rounded-full transition-colors ${
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

          {/* Task Content */}
          <div>
            <h4 className="font-medium text-white mb-2 leading-tight">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">DUE</div>
                <div className="text-sm text-gray-300">
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Notes Preview */}
            {task.notes && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">NOTES</div>
                <div className="text-sm text-gray-300 bg-gray-800/30 rounded-lg p-2 max-h-16 overflow-hidden">
                  {task.notes.length > 100 ? `${task.notes.substring(0, 100)}...` : task.notes}
                </div>
              </div>
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

      {/* Task Modal */}
      <TaskModal
        task={task}
        project={project}
        column={column}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={onDelete}
      />
    </>
  );
}
