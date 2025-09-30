import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { X, Plus } from 'lucide-react';

export default function TaskForm({ isOpen, onClose, projectId, columnId, task = null, mode = 'create' }) {
  const { state, actions } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const newTask = new Task(
          `task-${Date.now()}`,
          title.trim(),
          description.trim()
        );

        // Add task to project
        actions.addTask(projectId, newTask);

        // Add task to the specified column
        const project = state.projects.find(p => p.id === projectId);
        if (project && columnId) {
          project.moveTaskToColumn(newTask.id, columnId);
        }
      } else if (mode === 'edit' && task) {
        actions.updateTask(projectId, {
          ...task,
          title: title.trim(),
          description: description.trim(),
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
