import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TASK_PRIORITY } from '../types';
import { X, Plus, Flag, ChevronDown } from 'lucide-react';

export default function TaskForm({ isOpen, onClose, projectId, columnId, task = null, mode = 'create' }) {
  const { actions } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(TASK_PRIORITY.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || TASK_PRIORITY.MEDIUM);
    } else {
      setTitle('');
      setDescription('');
      setPriority(TASK_PRIORITY.MEDIUM);
    }
  }, [task, isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const newTask = new Task(
          `task-${Date.now()}`,
          title.trim(),
          description.trim(),
          'todo',
          0,
          0,
          priority
        );

        // Add task to project
        actions.addTask(projectId, newTask);

        // Add task to the specified column
        if (columnId) {
          actions.moveTask(projectId, newTask.id, columnId);
        }
      } else if (mode === 'edit' && task) {
        actions.updateTask(projectId, {
          ...task,
          title: title.trim(),
          description: description.trim(),
          priority: priority,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="modern-card shadow-dark-large max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'create' ? 'Add New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-accent-400 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400"
              placeholder="Enter task title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400 resize-none"
              placeholder="Enter task description (optional)"
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                className={`w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white text-sm hover:bg-gray-800/70 transition-colors ${getPriorityStyles(priority).badge}`}
              >
                <div className="flex items-center space-x-2">
                  <Flag className={`w-4 h-4 ${getPriorityStyles(priority).icon}`} />
                  <span className="capitalize">{priority}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showPriorityDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600/50 rounded-lg shadow-lg z-10">
                  {Object.values(TASK_PRIORITY).map((priorityOption) => (
                    <button
                      key={priorityOption}
                      type="button"
                      onClick={() => {
                        setPriority(priorityOption);
                        setShowPriorityDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${getPriorityStyles(priorityOption).badge}`}
                    >
                      <Flag className={`w-4 h-4 ${getPriorityStyles(priorityOption).icon}`} />
                      <span className="capitalize">{priorityOption}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>{isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Task' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
