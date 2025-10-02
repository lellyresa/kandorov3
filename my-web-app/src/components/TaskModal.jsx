import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle, Circle, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

// DatePicker Component
function DatePicker({ value, onChange, onClose }) {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const [selectedHour, setSelectedHour] = useState(value ? new Date(value).getHours() : 12);
  const [selectedMinute, setSelectedMinute] = useState(value ? new Date(value).getMinutes() : 0);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSet = () => {
    const finalDate = new Date(selectedDate);
    finalDate.setHours(selectedHour);
    finalDate.setMinutes(selectedMinute);
    onChange(finalDate.toISOString());
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
    <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-50 min-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
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
          onClick={(e) => {
            e.stopPropagation();
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

      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((date, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              date && handleDateClick(date);
            }}
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

      {/* Time Selection */}
      <div className="space-y-3 border-t border-gray-700 pt-4">
        <div className="text-sm text-gray-400">Time</div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(parseInt(e.target.value))}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <span className="text-gray-400">:</span>
          <select
            value={selectedMinute}
            onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-4 space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
            onClose();
          }}
          className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTimeSet();
            }}
            className="px-3 py-1.5 text-xs bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
          >
            Set Date
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaskModal() {
  const { state, actions } = useApp();
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDueDate, setCurrentDueDate] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);

  const { isOpen, task, projectId, columnId, mode } = state.taskModal;

  useEffect(() => {
    if (mode === 'edit' && task) {
      setEditTitle(task.title);
      setEditDescription(task.description);
      setCurrentDueDate(task.dueDate);
      setCurrentTask(task);
    } else if (mode === 'create') {
      setEditTitle('');
      setEditDescription('');
      setCurrentDueDate(null);
      setCurrentTask(null);
    }
  }, [task, mode]);

  const handleClose = () => {
    actions.closeTaskModal();
    setShowDatePicker(false);
    setCurrentTask(null);
  };

  const handleTitleBlur = () => {
    if (mode === 'edit' && editTitle.trim() && projectId && currentTask && editTitle !== currentTask.title) {
      const updatedTask = { ...currentTask, title: editTitle.trim() };
      setCurrentTask(updatedTask);
      actions.updateTask(projectId, updatedTask);
    } else if (mode === 'create' && editTitle.trim() && projectId) {
      // For create mode, we'll handle saving in handleSave
      return;
    } else if (!editTitle.trim()) {
      // Restore original title if empty (for edit mode)
      if (mode === 'edit' && currentTask) {
        setEditTitle(currentTask.title);
      }
    }
  };

  const handleDescriptionBlur = () => {
    if (mode === 'edit' && projectId && currentTask && editDescription !== currentTask.description) {
      const updatedTask = { ...currentTask, description: editDescription.trim() };
      setCurrentTask(updatedTask);
      actions.updateTask(projectId, updatedTask);
    }
    // For create mode, we'll handle saving in handleSave
  };

  const handleSave = () => {
    if (!editTitle.trim() || !projectId) return;

    if (mode === 'create') {
      // Create new task
      const newTask = {
        id: `task-${Date.now()}`,
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: 'todo',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        workSeconds: 0,
        pomodoroCount: 0,
      };

      actions.addTask(projectId, newTask);

      // Move task to the specified column if provided
      if (columnId) {
        actions.moveTask(projectId, newTask.id, columnId);
      }

      handleClose();
    } else if (mode === 'edit' && currentTask) {
      // Update existing task
      const updatedTask = {
        ...currentTask,
        title: editTitle.trim(),
        description: editDescription.trim(),
      };
      setCurrentTask(updatedTask);
      actions.updateTask(projectId, updatedTask);
    }
  };

  const handleDelete = () => {
    if (projectId && currentTask) {
      actions.deleteTask(projectId, currentTask.id);
      handleClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Handle clicking outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handlePriorityChange = (priority) => {
    if (projectId && currentTask) {
      // Update local state immediately for instant visual feedback
      const updatedTask = { ...currentTask, priority };
      setCurrentTask(updatedTask);

      actions.updateTask(projectId, updatedTask);
    }
  };

  if (!isOpen) return null;

  // Handle case where task might not be loaded yet
  if (!task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading task...</p>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyPress}
    >
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <div className="flex items-center space-x-3">
            {mode === 'create' && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Task
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Time */}
          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-500 focus:ring-0 hover:bg-gray-800/30 rounded-lg px-2 py-1 -mx-2 transition-colors"
              placeholder="Task title"
            />
            <p className="text-sm text-gray-400">
              {formatTimeAgo(currentTask?.createdAt)}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Description</div>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              className="w-full min-h-[120px] bg-gray-800/30 hover:bg-gray-800/50 border border-transparent hover:border-gray-600/50 focus:border-accent-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 resize-none transition-colors"
              placeholder="Add a description..."
              rows={4}
            />
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
                className="w-full bg-gray-800/30 rounded-lg px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between"
              >
                <p className="text-white text-sm">
                  {formatDueDate(currentDueDate)}
                </p>
                <Calendar className="w-4 h-4 text-gray-400" />
              </button>
              {showDatePicker && (
                <DatePicker
                  key={currentDueDate}
                  value={currentDueDate}
                  onChange={(newDate) => {
                    setCurrentDueDate(newDate);
                    const updatedTask = { ...currentTask, dueDate: newDate };
                    setCurrentTask(updatedTask);
                    actions.updateTask(projectId, updatedTask);
                    setShowDatePicker(false);
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    (currentTask?.priority?.toLowerCase() === priority)
                      ? getPriorityColor(priority)
                      : 'bg-gray-800/50 text-gray-400 border-gray-600/50 hover:bg-gray-700/50 hover:text-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePriorityChange(priority);
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
              {currentTask?.status === 'done' ? (
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

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/30 hover:border-red-600/50 text-sm font-medium rounded-lg transition-colors"
            >
              Delete Task
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Escape</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
