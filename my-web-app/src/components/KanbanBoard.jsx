import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import Column from './Column';
import ColumnForm from './ColumnForm';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export default function KanbanBoard({ onCreateProject = () => {} }) {
  const { state, actions } = useApp();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  const [activeTask, setActiveTask] = useState(null);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [modalProject, setModalProject] = useState(null);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">No Project Selected</h2>
          <p className="text-gray-400 mb-6">Create or select a project to get started with your tasks.</p>
          <button className="btn-primary" onClick={onCreateProject}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </button>
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

  const handleTaskClick = (task, columnId) => {
    setModalTask(task);
    setModalProject(activeProject);
  };

  const handleCloseModal = () => {
    setModalTask(null);
    setModalProject(null);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      actions.deleteTask(activeProject.id, taskId);
      if (modalTask && modalTask.id === taskId) {
        handleCloseModal();
      }
    }
  };

  return (
    <div className="h-full p-6">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{activeProject.name}</h2>
            {activeProject.description && (
              <p className="text-gray-400 text-lg">{activeProject.description}</p>
            )}
          </div>

          {/* Project Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowColumnForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
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
                  onTaskClick={handleTaskClick}
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

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={modalTask}
        project={modalProject}
        columnId={null}
        isOpen={!!modalTask}
        onClose={handleCloseModal}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
