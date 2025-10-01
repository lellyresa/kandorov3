import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock, CheckCircle, Circle, CircleDot, Flag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TaskDetailModal({ task, project, columnId, isOpen, onClose, onDelete }) {
  const { actions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || '');
  const [editDescription, setEditDescription] = useState(task?.description || '');
  const [editPriority, setEditPriority] = useState(task?.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(task?.dueDate || '');

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditPriority(task.priority || 'medium');
      setEditDueDate(task.dueDate || '');
      setIsEditing(false);
    }
  }, [task]);

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/40';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const handleSave = () => {
    if (editTitle.trim() && project) {
      actions.updateTask(project.id, {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDueDate,
      });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      // Reset form and exit edit mode
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditPriority(task.priority || 'medium');
      setEditDueDate(task.dueDate || '');
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-white">Task Details</h2>
            {isEditing ? (
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="px-3 py-1 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            ) : (
              <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)} {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 text-lg font-medium bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400"
                placeholder="Task title"
                autoFocus
              />
            ) : (
              <h3
                className="text-lg font-medium text-white cursor-pointer hover:bg-gray-800/50 p-2 -m-2 rounded transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {task.title}
              </h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400 resize-none"
                placeholder="Task description (optional)"
                rows={4}
              />
            ) : (
              <div
                className="min-h-[80px] p-2 cursor-pointer hover:bg-gray-800/50 rounded-lg transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {task.description ? (
                  <p className="text-gray-300 leading-relaxed">{task.description}</p>
                ) : (
                  <p className="text-gray-500 italic">Click to add description...</p>
                )}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
            {isEditing ? (
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="px-3 py-2 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white"
              />
            ) : (
              <div
                className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-800/50 rounded-lg transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </span>
              </div>
            )}
          </div>

          {/* Task Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Tracked</label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                <Clock className="w-4 h-4 text-accent-400" />
                <span className="text-accent-400 font-mono">
                  {formatWorkTime(task.workSeconds)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pomodoros</label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                <div className="w-4 h-4 text-accent-400">🍅</div>
                <span className="text-accent-400">{task.pomodoroCount || 0}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                {task.status === 'done' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
                <span className={task.status === 'done' ? 'text-green-400' : 'text-gray-400'}>
                  {task.status === 'done' ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Created</label>
              <div className="px-3 py-2 bg-gray-800/50 rounded-lg text-gray-400 text-sm">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Task</span>
          </button>

          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditTitle(task.title);
                    setEditDescription(task.description || '');
                    setEditPriority(task.priority || 'medium');
                    setEditDueDate(task.dueDate || '');
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors font-medium"
              >
                Edit Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
