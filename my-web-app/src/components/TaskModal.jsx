import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, CheckCircle, Circle, CircleDot, Edit, Save, Calendar, Flag, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TASK_PRIORITY } from '../types';

export default function TaskModal() {
  const { state, actions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState(TASK_PRIORITY.MEDIUM);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const { isOpen, task, projectId } = state.taskModal;

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description);
      setEditPriority(task.priority || TASK_PRIORITY.MEDIUM);
    }
  }, [task]);

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

  const handleClose = () => {
    actions.closeTaskModal();
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editTitle.trim() && projectId && task) {
      actions.updateTask(projectId, {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (projectId && task) {
      actions.deleteTask(projectId, task.id);
      handleClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      if (isEditing) {
        setEditTitle(task.title);
        setEditDescription(task.description);
        setIsEditing(false);
      } else {
        handleClose();
      }
    }
  };

  // Handle clicking outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !task) return null;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyPress}
    >
      <div className="relative w-full max-w-2xl bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-3 py-1.5 bg-accent-600 hover:bg-accent-700 text-white text-sm rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-300 hover:text-accent-300 hover:bg-gray-800/50 text-sm rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-500 focus:ring-0"
              placeholder="Task title"
              autoFocus
            />
          ) : (
            <h2 className="text-2xl font-bold text-white leading-tight">
              {task.title}
            </h2>
          )}

          {/* Description */}
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full min-h-[120px] bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-none"
              placeholder="Task description (optional)"
              rows={4}
            />
          ) : (
            <div className="min-h-[120px]">
              {task.description ? (
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Project & Column Info */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Project</div>
                <div className="px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm">
                  {state.projects.find(p => p.id === projectId)?.name || 'Unknown Project'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-400">Column</div>
                <div className="px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm">
                  {(() => {
                    const project = state.projects.find(p => p.id === projectId);
                    if (!project) return 'Unknown Column';

                    const column = project.columns.find(col =>
                      col.taskIds.includes(task.id)
                    );
                    return column?.title || 'Unknown Column';
                  })()}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Priority</div>
                {isEditing ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className={`w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white text-sm hover:bg-gray-800/70 transition-colors ${getPriorityStyles(editPriority).badge}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Flag className={`w-4 h-4 ${getPriorityStyles(editPriority).icon}`} />
                        <span className="capitalize">{editPriority}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {showPriorityDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600/50 rounded-lg shadow-lg z-10">
                        {Object.values(TASK_PRIORITY).map((priority) => (
                          <button
                            key={priority}
                            onClick={() => {
                              setEditPriority(priority);
                              setShowPriorityDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${getPriorityStyles(priority).badge}`}
                          >
                            <Flag className={`w-4 h-4 ${getPriorityStyles(priority).icon}`} />
                            <span className="capitalize">{priority}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm ${getPriorityStyles(task.priority).badge}`}>
                    <div className="flex items-center space-x-2">
                      <Flag className={`w-4 h-4 ${getPriorityStyles(task.priority).icon}`} />
                      <span className="capitalize font-medium">{task.priority}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Time Tracked */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Time Tracked</div>
                <div className="px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm font-mono">
                  {formatWorkTime(task.workSeconds)}
                </div>
              </div>

              {/* Pomodoro Count */}
              {task.pomodoroCount > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Pomodoro Sessions</div>
                  <div className="px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm">
                    {task.pomodoroCount} completed
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Created</div>
                <div className="px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm">
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-2">
              {task.status === 'done' ? (
                <div className="flex items-center space-x-2 text-success-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Completed</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Circle className="w-5 h-5" />
                  <span className="font-medium">In Progress</span>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-danger-600/20 hover:bg-danger-600/30 text-danger-400 hover:text-danger-300 border border-danger-600/30 hover:border-danger-600/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete Task</span>
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Ctrl+Enter</kbd> to save, <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Escape</kbd> to cancel/close
          </div>
        </div>
      </div>
    </div>
  );
}
