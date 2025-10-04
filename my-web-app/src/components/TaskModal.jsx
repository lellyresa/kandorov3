import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle, Circle, Calendar, Edit3 } from 'lucide-react';
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
    <div
      className="absolute top-full left-0 mt-2 z-50 min-w-[320px]"
      style={{
        background: 'linear-gradient(180deg, #1E1E1E 0%, #161616 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)'
      }}
    >
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
            className={`text-center py-2 text-sm rounded ${
              date
                ? date.toDateString() === selectedDate.toDateString()
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
                : ''
            }`}
            style={
              date
                ? (date.toDateString() === selectedDate.toDateString()
                    ? { background: 'rgba(255,255,255,0.1)' }
                    : { })
                : { }
            }
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
            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none"
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
            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none"
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
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

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
      // Initialize currentTask with default values for create mode
      setCurrentTask({
        id: '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        workSeconds: 0,
        pomodoroCount: 0,
        dueDate: null,
      });
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

  const handleTitleClick = () => {
    if (mode === 'edit') {
      setIsEditingTitle(true);
      setTempTitle(editTitle);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      setEditTitle(tempTitle.trim());
      if (mode === 'edit' && projectId && currentTask && tempTitle.trim() !== currentTask.title) {
        const updatedTask = { ...currentTask, title: tempTitle.trim() };
        setCurrentTask(updatedTask);
        actions.updateTask(projectId, updatedTask);
      }
    } else if (mode === 'edit' && currentTask) {
      setEditTitle(currentTask.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(editTitle);
    setIsEditingTitle(false);
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
        priority: currentTask.priority,
        createdAt: new Date().toISOString(),
        workSeconds: 0,
        pomodoroCount: 0,
        dueDate: currentDueDate,
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
        priority: currentTask.priority,
        dueDate: currentDueDate,
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

      if (mode === 'edit') {
        actions.updateTask(projectId, updatedTask);
      }
      // For create mode, we'll handle saving in handleSave
    }
  };

  if (!isOpen) return null;

  // Handle case where task might not be loaded yet (only for edit mode)
  if (mode === 'edit' && !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
        <div className="w-full max-w-2xl p-8" style={{ background: 'linear-gradient(180deg, #1E1E1E 0%, #161616 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading task...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDueDateField = (date) => {
    if (!date) return 'No due date';
    const dueDate = new Date(date);
    return dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Removed old colored pill helper; replaced with neutral + selected color styles above

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyPress}
    >
      <div
        className="relative w-full max-w-2xl"
        style={{
          background: 'linear-gradient(180deg, #1E1E1E 0%, #161616 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 8px 24px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Close button (absolute, works for both modes) */}
        <button
          onClick={handleClose}
          className="rounded-full absolute"
          style={{
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666666',
            borderRadius: '50%'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666666'; }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header (edit mode only) */}
        {mode === 'edit' && (
          <div className="flex items-center justify-between" style={{ padding: '24px 0', paddingRight: 56, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full outline-none"
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    boxShadow: '0 0 0 3px rgba(255,255,255,0.05)'
                  }}
                  autoFocus
                />
              ) : (
                <div
                  onClick={handleTitleClick}
                  className="group cursor-text transition-all duration-150 ease-in-out relative"
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: 6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {editTitle || currentTask?.title || 'Untitled task'}
                  <Edit3 
                    className="absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    size={14}
                    style={{ color: '#666666' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: 32 }} className="space-y-6">
          {/* Title (create mode only) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full outline-none"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '12px 16px'
                }}
                onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)'; }}
                onBlurCapture={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="Task title"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold" style={{ color: '#666666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Description</div>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              className="w-full min-h-[120px] resize-none"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '12px 16px',
                color: '#FFFFFF'
              }}
              onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)'; }}
              onBlurCapture={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
              placeholder="Add a description..."
              rows={4}
            />
          </div>

          {/* Due Date and Priority Row */}
          <div className="flex items-start space-x-6">
            {/* Due Date (left 50%) */}
            <div className="flex-1">
              <div className="text-[11px] font-semibold mb-2" style={{ color: '#666666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>DUE DATE</div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDatePicker(!showDatePicker);
                  }}
                  className="w-full text-left flex items-center justify-between"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8,
                    padding: '12px 16px'
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)'; }}
                  onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <p className="text-white text-sm">
                    {formatDueDateField(currentDueDate)}
                  </p>
                  <Calendar className="w-4 h-4" style={{ color: '#666666' }} />
                </button>
                {showDatePicker && (
                  <DatePicker
                    key={currentDueDate}
                    value={currentDueDate}
                    onChange={(newDate) => {
                      setCurrentDueDate(newDate);
                      if (currentTask) {
                        const updatedTask = { ...currentTask, dueDate: newDate };
                        setCurrentTask(updatedTask);
                        actions.updateTask(projectId, updatedTask);
                      }
                      setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>
            </div>

            {/* Priority (right 50%) */}
            <div className="flex-1">
              <div className="text-[11px] font-semibold mb-2" style={{ color: '#666666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PRIORITY</div>
              <div className="flex items-center justify-between space-x-2">
                {['low', 'medium', 'high'].map((priority) => {
                  const selected = currentTask?.priority?.toLowerCase() === priority;
                  const colorMap = {
                    low: '#4ADE80',
                    medium: '#FFC107',
                    high: '#FF6B6B',
                  };
                  const color = colorMap[priority];
                  return (
                    <button
                      key={priority}
                      onClick={(e) => { e.stopPropagation(); handlePriorityChange(priority); }}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 20,
                        background: selected ? `${color}14` : 'rgba(255,255,255,0.03)',
                        border: selected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
                        color: selected ? color : '#999999',
                        fontSize: 12,
                        fontWeight: 600,
                        flex: 1,
                        textAlign: 'center'
                      }}
                    >
                      {priority.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2" style={{ marginTop: 24 }}>
            <div>
              {mode === 'edit' && (
                <button
                  onClick={handleDelete}
                  className="rounded-full"
                  style={{
                    padding: '10px 24px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#EF4444',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                >
                  Delete
                </button>
              )}
            </div>

            <div>
              <button
                onClick={handleSave}
                className="rounded-full"
                style={{
                  padding: '10px 28px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  transform: 'scale(1)',
                  transition: 'transform 120ms ease, background 120ms ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {mode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
