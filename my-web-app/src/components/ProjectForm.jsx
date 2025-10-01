import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Project, Column, COLUMN_TYPES } from '../types';
import { X, Plus } from 'lucide-react';

const generateId = (prefix) => {
  const globalCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}-${globalCrypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function ProjectForm({ isOpen, onClose }) {
  const { state, actions } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError('Project name is required.');
      return;
    }

    if (state.projects.some((project) => project.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A project with this name already exists.');
      return;
    }

    setIsSubmitting(true);

    try {
      const projectId = generateId('project');
      const project = new Project(projectId, trimmedName, trimmedDescription);

      const defaultColumns = [
        new Column(generateId('column'), 'Now Working', COLUMN_TYPES.ACTIVE, [], 0),
        new Column(generateId('column'), 'To Do', COLUMN_TYPES.TODO, [], 1),
        new Column(generateId('column'), 'In Progress', COLUMN_TYPES.IN_PROGRESS, [], 2),
        new Column(generateId('column'), 'Done', COLUMN_TYPES.DONE, [], 3),
      ];

      defaultColumns.forEach((column) => project.addColumn(column));

      actions.addProject(project);
      actions.setActiveProject(project.id);
      onClose();
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Something went wrong while creating the project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modern-card shadow-dark-large max-w-md w-full mx-4"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-xl font-semibold text-white">Create Project</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-accent-400 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400"
              placeholder="Marketing Roadmap"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400 resize-none"
              placeholder="Add a short summary (optional)"
            />
          </div>

          {error && (
            <div className="text-sm text-danger-400 bg-danger-500/10 border border-danger-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
