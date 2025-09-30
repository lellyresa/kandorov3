import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import Column from './Column';
import ColumnForm from './ColumnForm';
import TaskCard from './TaskCard';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export default function KanbanBoard() {
  const { state, actions } = useApp();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  const [activeTask, setActiveTask] = useState(null);
  const [showColumnForm, setShowColumnForm] = useState(false);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Create or select a project to get started.</p>
        </div>
      </div>
    );
  }

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const targetColumnId = over.id;

    // Check if we're dropping on a column (not another task)
    const targetColumn = activeProject.getColumnById(targetColumnId);
    if (targetColumn) {
      actions.moveTask(activeProject.id, taskId, targetColumnId);
    }
  };

  const handleAddTask = (columnId) => {
    // TODO: Open task creation modal
    console.log('Add task to column:', columnId);
  };

  const handleEditColumn = (column) => {
    // TODO: Open column edit modal
    console.log('Edit column:', column);
  };

  const handleDeleteColumn = (columnId) => {
    // TODO: Confirm and delete column
    console.log('Delete column:', columnId);
  };

  return (
    <div className="h-full">
      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{activeProject.name}</h2>
            {activeProject.description && (
              <p className="text-gray-600 mt-1">{activeProject.description}</p>
            )}
          </div>

          {/* Project Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowColumnForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Column</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-96">
          {activeProject.columns
            .sort((a, b) => a.position - b.position)
            .map((column) => {
              const tasks = activeProject.getTasksByColumn(column.id);

              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  projectId={activeProject.id}
                />
              );
            })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} columnId={null} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Column Form Modal */}
      <ColumnForm
        isOpen={showColumnForm}
        onClose={() => setShowColumnForm(false)}
        projectId={activeProject?.id}
        mode="create"
      />
    </div>
  );
}
