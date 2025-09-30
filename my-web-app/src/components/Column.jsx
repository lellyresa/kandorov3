import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import PomodoroTimer from './PomodoroTimer';
import { COLUMN_TYPES } from '../types';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Column({ column, tasks, projectId }) {
  const { actions } = useApp();
  const [showTaskForm, setShowTaskForm] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    }
  });

  const isActiveColumn = column.type === COLUMN_TYPES.ACTIVE;
  const taskIds = tasks.map(task => task.id);

  const handleAddTask = () => {
    setShowTaskForm(true);
  };

  const handleEditColumn = () => {
    // TODO: Open column edit modal
    console.log('Edit column:', column);
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Are you sure you want to delete the "${column.title}" column? This action cannot be undone.`)) {
      actions.deleteColumn(projectId, column.id);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      actions.deleteTask(projectId, taskId);
    }
  };

  const handleEditTask = (task) => {
    // TODO: Open task edit modal
    console.log('Edit task:', task);
  };

  return (
    <div
      className={`modern-card flex flex-col h-full min-w-80 max-w-80 overflow-hidden transition-colors duration-200 ${
        isActiveColumn ? 'border-danger-500/40 bg-danger-500/10' : ''
      }`}
      style={{
        backgroundImage: isActiveColumn
          ? 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.06) 0%, transparent 55%)'
          : 'none'
      }}
    >
      <div
        className={`p-4 border-b border-gray-700/40 ${
          isActiveColumn ? 'bg-danger-500/10' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className={`font-semibold text-white ${isActiveColumn ? 'text-danger-300' : ''}`}>
              {column.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isActiveColumn
                ? 'bg-danger-500/20 text-danger-300'
                : 'bg-gray-700/60 text-gray-300'
            }`}>
              {tasks.length}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleAddTask}
              className="p-1.5 text-gray-400 hover:text-accent-400 rounded-md hover:bg-gray-700/50 transition-colors"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
            {!isActiveColumn && (
              <>
                <button
                  onClick={handleEditColumn}
                  className="p-1.5 text-gray-400 hover:text-accent-400 rounded-md hover:bg-gray-700/50 transition-colors"
                  title="Edit column"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteColumn}
                  className="p-1.5 text-gray-400 hover:text-danger-400 rounded-md hover:bg-danger-500/20 transition-colors"
                  title="Delete column"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {column.description && (
          <p className="mt-3 text-sm text-gray-300">{column.description}</p>
        )}
      </div>

      {isActiveColumn && (
        <div className="p-4 border-b border-gray-700/40 bg-danger-500/5">
          <PomodoroTimer />
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-4 min-h-96 transition-colors duration-200 ${
          isOver ? 'bg-accent-500/5' : ''
        }`}
        style={{
          backgroundImage: isOver
            ? 'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.08) 0%, transparent 60%)'
            : 'none'
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="text-sm text-center">
                  {isActiveColumn ? 'Move tasks here to start working' : 'No tasks yet'}
                </p>
                <p className="text-xs text-center mt-1">
                  {isActiveColumn ? 'Drag tasks from other columns' : 'Click + to add a task'}
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columnId={column.id}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        projectId={projectId}
        columnId={column.id}
        mode="create"
      />
    </div>
  );
}
