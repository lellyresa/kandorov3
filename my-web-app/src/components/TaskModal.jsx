import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock, CheckCircle, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TaskModal({ task, project, column, isOpen, onClose, onDelete }) {
  const { actions } = useApp();
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [editNotes, setEditNotes] = useState(task.notes || '');

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description);
      setEditPriority(task.priority || 'medium');
      setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setEditNotes(task.notes || '');
    }
  }, [task]);

  const handleSave = () => {
    if (editTitle.trim() && project) {
      actions.updateTask(project.id, {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate) : null,
        notes: editNotes.trim(),
      });
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
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

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with frosted glass effect */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="modern-card p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-lg text-sm font-mono border ${priorityColors[editPriority]}`}>
                PRIORITY {priorityLabels[editPriority]}
              </div>
              <div className={`px-3 py-1 rounded-lg text-sm font-mono bg-gray-800/60 text-gray-300`}>
                COLUMN {column?.title?.toUpperCase() || 'UNKNOWN'}
              </div>
              <div className={`px-3 py-1 rounded-lg text-sm font-mono bg-gray-800/60 text-gray-300`}>
                TIME TRACKED {formatWorkTime(task.workSeconds)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Task Content */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 text-lg bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400"
                placeholder="Task title"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400 resize-none"
                placeholder="Task description (optional)"
                rows={3}
              />
            </div>

            {/* Priority and Due Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400 resize-none"
                placeholder="Additional notes (optional)"
                rows={4}
              />
            </div>

            {/* Task Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700/50">
              <div className="flex items-center space-x-4">
                {task.pomodoroCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-accent-400" />
                    <span className="text-accent-400">{task.pomodoroCount} pomodoros</span>
                  </div>
                )}
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>

              {task.status === 'done' && (
                <div className="flex items-center space-x-1 text-success-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700/50">
            <button
              onClick={() => {
                onDelete && onDelete(task.id);
                onClose();
              }}
              className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
