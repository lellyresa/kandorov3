import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Column, COLUMN_TYPES } from '../types';
import { X, Plus } from 'lucide-react';

export default function ColumnForm({ isOpen, onClose, projectId, column = null, mode = 'create' }) {
  const { state, actions } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState(COLUMN_TYPES.TODO);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (column) {
      setTitle(column.title);
      setType(column.type);
    } else {
      setTitle('');
      setType(COLUMN_TYPES.TODO);
    }
  }, [column, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const newColumn = new Column(
          `column-${Date.now()}`,
          title.trim(),
          type,
          [],
          getNextPosition()
        );
        actions.addColumn(projectId, newColumn);
      } else if (mode === 'edit' && column) {
        actions.updateColumn(projectId, {
          ...column,
          title: title.trim(),
          type,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving column:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextPosition = () => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project || project.columns.length === 0) return 0;
    return Math.max(...project.columns.map(col => col.position)) + 1;
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
            {mode === 'create' ? 'Add New Column' : 'Edit Column'}
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
              placeholder="Enter column title"
              required
              autoFocus
            />
          </div>

          {/* Column Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
              Column Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white"
            >
              <option value={COLUMN_TYPES.TODO}>To Do</option>
              <option value={COLUMN_TYPES.IN_PROGRESS}>In Progress</option>
              <option value={COLUMN_TYPES.DONE}>Done</option>
              <option value={COLUMN_TYPES.CUSTOM}>Custom</option>
            </select>
          </div>

          {/* Column Type Description */}
          <div className="text-sm text-gray-400">
            {type === COLUMN_TYPES.ACTIVE && (
              <p>⚠️ Active column is reserved for the "Now Working" column and cannot be created manually.</p>
            )}
            {type === COLUMN_TYPES.TODO && (
              <p>Tasks in this column represent work that needs to be done.</p>
            )}
            {type === COLUMN_TYPES.IN_PROGRESS && (
              <p>Tasks in this column are currently being worked on.</p>
            )}
            {type === COLUMN_TYPES.DONE && (
              <p>Tasks in this column have been completed.</p>
            )}
            {type === COLUMN_TYPES.CUSTOM && (
              <p>Custom column type for your specific workflow needs.</p>
            )}
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
              disabled={!title.trim() || isSubmitting || (mode === 'create' && type === COLUMN_TYPES.ACTIVE)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>{isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Column' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

