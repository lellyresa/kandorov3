import React from 'react';
import { createPortal } from 'react-dom';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import PomodoroTimer from './PomodoroTimer';
import { COLUMN_TYPES } from '../types';
import { Plus } from 'lucide-react';
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

  const contextMenuRef = React.useRef(null);
  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [contextMenuPos, setContextMenuPos] = React.useState({ x: 0, y: 0 });

  const handleDeleteColumn = () => {
    const project = state.projects.find((p) => p.id === projectId);
    const columnCount = project ? project.columns.length : 0;
    if (columnCount <= 1) {
      alert('Cannot delete the last remaining column.');
      return;
    }
    const taskCount = tasks.length;
    const confirmed = window.confirm(`Delete '${column.title}' and all ${taskCount} task${taskCount === 1 ? '' : 's'} inside?`);
    if (confirmed) {
      actions.deleteColumn(projectId, column.id);
    }
  };

  const handleHeaderContextMenu = (e) => {
    e.preventDefault();
    const margin = 8;
    const menuWidth = 180;
    const menuHeight = 44;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeX = Math.min(e.clientX, viewportWidth - menuWidth - margin);
    const safeY = Math.min(e.clientY, viewportHeight - menuHeight - margin);
    setContextMenuPos({ x: Math.max(margin, safeX), y: Math.max(margin, safeY) });
    setContextMenuOpen(true);
  };

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!contextMenuRef.current) return;
      if (contextMenuRef.current.contains(e.target)) return;
      setContextMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setContextMenuOpen(false);
    };
    if (contextMenuOpen) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [contextMenuOpen]);

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
      className={`flex flex-col h-full transition-colors duration-200 overflow-hidden`}
      style={{
        background: 'linear-gradient(180deg, #151515 0%, #0F0F0F 100%)',
        backgroundColor: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: isActiveColumn ? 24 : 0,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
        flex: '1 1 0%',
        minWidth: 320,
        maxWidth: 420
      }}
    >
      {isActiveColumn ? (
        <div className="pb-2">
          <PomodoroTimer />
        </div>
      ) : (
        <div className="p-6 pb-4 border-b border-transparent relative z-10" onContextMenu={handleHeaderContextMenu}>
          <div className="flex items-center justify-between group/header relative">
            <div className="flex items-center space-x-2">
              <span
                className="inline-flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  minWidth: '32px',
                  textAlign: 'center',
                  color: '#999999',
                }}
              >
                {tasks.length}
              </span>
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
                  className="bg-transparent border border-gray-700/60 rounded px-2 py-1 text-white text-[16px] tracking-[-0.01em] focus:outline-none focus:border-white/30"
                  autoFocus
                />
              ) : (
                <h3
                  className="font-semibold text-white cursor-text hover:text-white/80 transition-colors text-[16px] tracking-[-0.01em]"
                  onClick={startEditTitle}
                  title="Click to rename column"
                >
                  {column.title}
                </h3>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <div>
                <button
                  onClick={handleAddTask}
                  className="rounded-full p-[6px] border border-transparent hover:bg-white/10 hover:border-white/20 transform hover:scale-105 transition-all duration-150 ease-in-out"
                  title="Add task"
                >
                  <Plus className="w-5 h-5" style={{ color: '#666666' }} />
                </button>
              </div>
            </div>
          </div>

          {contextMenuOpen && createPortal(
            (
              <div
                ref={contextMenuRef}
                role="menu"
                style={{
                  position: 'fixed',
                  top: `${contextMenuPos.y}px`,
                  left: `${contextMenuPos.x}px`,
                  background: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
                  zIndex: 100,
                }}
              >
                <button
                  onClick={() => {
                    setContextMenuOpen(false);
                    handleDeleteColumn();
                  }}
                  className="block w-full text-left text-sm hover:bg-[rgba(239,68,68,0.1)] transition-[background] duration-150"
                  style={{
                    padding: '8px 16px',
                    color: '#EF4444',
                    background: 'transparent',
                    borderRadius: '6px',
                  }}
                >
                  Delete Column
                </button>
              </div>
            ),
            document.body
          )}

          {column.description && (
            <p className="mt-3 text-sm text-gray-300">{column.description}</p>
          )}
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto ${isActiveColumn ? 'pt-2' : 'p-4'} transition-colors duration-200 relative ${
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
