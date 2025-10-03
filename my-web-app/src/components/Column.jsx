import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import PomodoroTimer from './PomodoroTimer';
import { COLUMN_TYPES } from '../types';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Drop Zone Indicator Component
function DropZoneIndicator({ id, isActive, position, columnId }) {
  const { setNodeRef: setDropRef, isOver: isDropOver } = useDroppable({
    id,
    data: {
      type: 'dropZone',
      position,
      columnId,
      accepts: ['task'],
    },
  });

  if (!isActive && !isDropOver) return null;

  return (
    <div
      ref={setDropRef}
      className={`h-2 bg-accent-500/30 border-2 border-accent-500/50 border-dashed rounded-full transition-all duration-200`}
      style={{
        margin: '8px 0',
        zIndex: isDropOver ? 20 : 10,
      }}
    />
  );
}

export default function Column({ column, tasks, projectId }) {
  const { state, actions } = useApp();

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
      accepts: ['task'],
    },
    disabled: false,
  });

  // Create drop zones between tasks for precise positioning
  const dropZones = [];
  if (tasks.length > 0) {
    // Drop zone at the top
    dropZones.push({ id: `${column.id}-top`, position: 'top', index: 0 });
    // Drop zones between tasks
    tasks.forEach((_, index) => {
      if (index < tasks.length - 1) {
        dropZones.push({ id: `${column.id}-between-${index}`, position: 'between', index: index + 1 });
      }
    });
    // Drop zone at the bottom
    dropZones.push({ id: `${column.id}-bottom`, position: 'bottom', index: tasks.length });
  } else {
    // Single drop zone for empty column
    dropZones.push({ id: `${column.id}-empty`, position: 'empty', index: 0 });
  }

  const isActiveColumn = column.type === COLUMN_TYPES.ACTIVE;
  const currentTaskId = state.pomodoroState.currentTaskId;
  const taskIds = tasks.map(task => task.id);

  const handleAddTask = () => {
    actions.openTaskModal(null, projectId, column.id, 'create');
  };

  const handleEditColumn = () => {
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
              <h3 className="font-semibold text-white">{column.title}</h3>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700/60 text-gray-300">
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
            </div>
          </div>

          {column.description && (
            <p className="mt-3 text-sm text-gray-300">{column.description}</p>
          )}
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto ${isActiveColumn ? 'px-4 pb-4 pt-2' : 'p-4'} transition-all duration-200 relative min-h-32 ${
          isOver ? 'bg-accent-500/15 border-2 border-accent-500/50 border-dashed rounded-lg' : ''
        }`}
        style={{
          zIndex: isOver ? 15 : 5,
          pointerEvents: 'auto',
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <>
                <DropZoneIndicator
                  id={`${column.id}-empty`}
                  isActive={isOver}
                  position="empty"
                  columnId={column.id}
                />
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
              </>
            ) : (
              <>
                {/* Top drop zone */}
                <DropZoneIndicator
                  id={`${column.id}-top`}
                  isActive={isOver}
                  position="top"
                  columnId={column.id}
                />

                {tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <TaskCard
                      task={task}
                      columnId={column.id}
                      onDelete={handleDeleteTask}
                      showFocusToggle={isActiveColumn}
                      isFocusTask={isActiveColumn && currentTaskId === task.id}
                      onSelectFocus={() => handleFocusTask(task.id)}
                    />

                    {/* Drop zone between tasks (except after last task) */}
                    {index < tasks.length - 1 && (
                      <DropZoneIndicator
                        id={`${column.id}-between-${index}`}
                        isActive={isOver}
                        position="between"
                        columnId={column.id}
                      />
                    )}
                  </React.Fragment>
                ))}

                {/* Bottom drop zone */}
                <DropZoneIndicator
                  id={`${column.id}-bottom`}
                  isActive={isOver}
                  position="bottom"
                  columnId={column.id}
                />
              </>
            )}
          </div>
        </SortableContext>
      </div>

    </div>
  );
}
