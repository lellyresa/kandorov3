import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import PomodoroTimer from './PomodoroTimer';
import { COLUMN_TYPES } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Column({ column, tasks, projectId }) {
  const { state, actions } = useApp();

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
      accepts: ['task'],
    }
  });

  const isActiveColumn = column.type === COLUMN_TYPES.ACTIVE;
  const currentTaskId = state.pomodoroState.currentTaskId;
  const taskIds = tasks.map(task => task.id);

  const handleAddTask = () => {
    actions.openTaskModal(null, projectId, column.id, 'create');
  };

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [pendingTitle, setPendingTitle] = React.useState(column.title);

  const startEditTitle = () => {
    setPendingTitle(column.title);
    setIsEditingTitle(true);
  };

  const commitTitle = () => {
    const title = (pendingTitle || '').trim();
    if (title && title !== column.title) {
      actions.updateColumn(projectId, { ...column, title });
    }
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setIsEditingTitle(false);
    setPendingTitle(column.title);
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

  const handleFocusTask = (taskId) => {
    actions.setCurrentTask(taskId);
  };

  return (
    <div
      className={`modern-card flex flex-col h-full min-w-80 max-w-80 transition-colors duration-200 ${
        isActiveColumn ? 'border-accent-500/30 bg-gray-900/80' : ''
      }`}
    >
      {isActiveColumn ? (
        <div className="p-4 pb-2">
          <PomodoroTimer />
        </div>
      ) : (
        <div className="p-4 border-b border-gray-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={pendingTitle}
                  onChange={(e) => setPendingTitle(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitTitle();
                    if (e.key === 'Escape') cancelTitle();
                  }}
                  className="bg-transparent border border-gray-600/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-accent-500/60"
                  autoFocus
                />
              ) : (
                <h3
                  className="font-semibold text-white cursor-text hover:text-accent-200 transition-colors"
                  onClick={startEditTitle}
                  title="Click to rename column"
                >
                  {column.title}
                </h3>
              )}
              <span
                className="px-2.5 py-0.5 text-xs font-medium rounded-full text-gray-300 leading-none text-center inline-flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', minWidth: '1.75rem' }}
              >
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
              {/* Edit icon removed; title is now editable by clicking it */}
              <button
                onClick={handleDeleteColumn}
                className="p-1.5 text-gray-400 hover:text-danger-400 rounded-md hover:bg-danger-500/20 transition-colors"
                title="Delete column"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {column.description && (
            <p className="mt-3 text-sm text-gray-300">{column.description}</p>
          )}
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto ${isActiveColumn ? 'px-4 pb-4 pt-2' : 'p-4'} transition-colors duration-200 relative ${
          isOver ? 'bg-accent-500/5' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-center">
                {isActiveColumn ? (
                  <>
                    <p className="text-sm">Drag a task here to focus</p>
                    <p className="text-xs mt-1">Only the selected task will track time</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm">No tasks yet</p>
                    <p className="text-xs mt-1">Click + to add a task</p>
                  </>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columnId={column.id}
                  onDelete={handleDeleteTask}
                  showFocusToggle={isActiveColumn}
                  isFocusTask={isActiveColumn && currentTaskId === task.id}
                  onSelectFocus={() => handleFocusTask(task.id)}
                  showDescription={false}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>

    </div>
  );
}
