import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, CheckCircle, Circle, CircleDot, Edit, Save, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

function DatePicker({ value, onChange, onClose }) {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onChange(date.toISOString());
    onClose();
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-50 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
            setSelectedDate(newDate);
          }}
          className="p-1 text-gray-400 hover:text-white"
        >
          ‹
        </button>
        <div className="text-white font-medium">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
            setSelectedDate(newDate);
          }}
          className="p-1 text-gray-400 hover:text-white"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
          <button
            key={index}
            onClick={() => date && handleDateClick(date)}
            className={`text-center py-2 text-sm rounded hover:bg-gray-700 ${
              date
                ? date.toDateString() === selectedDate.toDateString()
                  ? 'bg-accent-600 text-white'
                  : 'text-gray-300 hover:text-white'
                : ''
            }`}
            disabled={!date}
          >
            {date ? date.getDate() : ''}
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={() => {
            onChange(null);
            onClose();
          }}
          className="px-3 py-1 text-xs text-gray-400 hover:text-white"
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function TaskModal() {
  const { state, actions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { isOpen, task, projectId } = state.taskModal;

  useEffect(() => {
    if (task) {
      setEditTitle(task.title || '');
      setEditDescription(task.description || '');
    }
  }, [task]);

  // Safety check - if modal is open but task is missing, close it
  useEffect(() => {
    if (isOpen && !task) {
      console.error('TaskModal: Modal is open but task is missing!');
      actions.closeTaskModal();
    }
  }, [isOpen, task, actions]);

  const handleClose = () => {
    actions.closeTaskModal();
    setIsEditing(false);
    setShowDatePicker(false);
  };

  const handleSave = () => {
    if (editTitle.trim() && projectId && task) {
      actions.updateTask(projectId, {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
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
      if (showDatePicker) {
        setShowDatePicker(false);
      } else if (isEditing) {
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
      setShowDatePicker(false);
    }
  };

  if (!isOpen) return null;
  
  // If modal is open but task is null, show error state
  if (!task) {
    console.error('TaskModal: Rendering with null task!');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">Error: Task Not Found</h2>
            <p className="text-gray-400 mb-4">The task could not be loaded.</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffInMs = now - taskDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatDueDate = (date) => {
    if (!date) return 'No due date';
    const dueDate = new Date(date);
    return dueDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-accent-600 hover:bg-accent-700 text-white text-sm rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-300 hover:text-accent-300 hover:bg-gray-800/50 text-sm rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Time */}
          <div className="space-y-2">
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
            <p className="text-sm text-gray-400">
              {formatTimeAgo(task.createdAt)}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Description</div>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full min-h-[120px] bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-none"
                placeholder="Task description (optional)"
                rows={4}
              />
            ) : (
              <div className="bg-gray-800/30 rounded-lg px-4 py-3 min-h-[120px]">
                {task.description ? (
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Due Date</div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDatePicker(!showDatePicker);
                }}
                className="w-full bg-gray-800/30 rounded-lg px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
              >
                <p className="text-white text-sm">
                  {formatDueDate(task.dueDate)}
                </p>
              </button>
              {showDatePicker && (
                <DatePicker
                  value={task.dueDate}
                  onChange={(newDate) => {
                    actions.updateTask(projectId, {
                      ...task,
                      dueDate: newDate,
                    });
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>
          </div>

          {/* Priority Pills */}
          <div className="space-y-3">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Priority</div>
            <div className="flex items-center space-x-2">
              {['low', 'medium', 'high'].map((priority) => (
                <button
                  key={priority}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    (task.priority?.toLowerCase() === priority)
                      ? getPriorityColor(priority)
                      : 'bg-gray-800/50 text-gray-400 border-gray-600/50 hover:bg-gray-700/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Priority button clicked:', {
                      priority,
                      taskId: task.id,
                      projectId,
                      currentTask: task
                    });
                    
                    if (!projectId || !task || !task.id) {
                      console.error('Missing required data:', { projectId, task });
                      return;
                    }
                    
                    try {
                      actions.updateTask(projectId, {
                        ...task,
                        priority: priority,
                      });
                      console.log('Task update action dispatched successfully');
                    } catch (error) {
                      console.error('Error updating task:', error);
                    }
                  }}
                >
                  {priority.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-2">
              {task.status === 'done' ? (
                <div className="flex items-center space-x-2 text-green-400">
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

            <div className="flex items-center space-x-3">
              {isEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/30 hover:border-red-600/50 text-sm font-medium rounded-lg transition-colors"
              >
                Delete Task
              </button>
            </div>
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
