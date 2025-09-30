import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TaskCard({ task, columnId, onEdit, onDelete }) {
  const { state, actions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  // Find the project that contains this task
  const project = state.projects.find(p =>
    p.tasks.some(t => t.id === task.id)
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editTitle.trim() && project) {
      actions.updateTask(project.id, {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setEditDescription(task.description);
      setIsEditing(false);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="modern-card border-2 border-accent-500/50 border-dashed opacity-60 p-4 shadow-dark-large"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600/50 rounded mb-2"></div>
          <div className="h-3 bg-gray-600/30 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="modern-card modern-card-hover group cursor-pointer"
    >
      <div className="p-4">
        {/* Drag Handle */}
        <div className="flex items-start justify-between mb-3">
          <div
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-accent-400 cursor-grab active:cursor-grabbing rounded hover:bg-gray-700/50 transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Task Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-accent-400 rounded hover:bg-gray-700/50 transition-colors"
              title="Edit task"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete && onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-danger-400 rounded hover:bg-gray-700/50 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Task Content */}
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400"
              placeholder="Task title"
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-gray-400 resize-none"
              placeholder="Task description (optional)"
              rows={2}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-2 text-xs bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 text-xs text-gray-400 hover:text-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-white mb-2 leading-tight">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Task Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-3">
                {task.pomodoroCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-accent-400" />
                    <span className="text-accent-400">{task.pomodoroCount}</span>
                  </div>
                )}
                <span className="text-gray-500">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>

              {task.status === 'done' && (
                <div className="flex items-center space-x-1 text-success-400">
                  <CheckCircle className="w-3 h-3" />
                  <span className="font-medium">Done</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
