import React, { useState } from 'react';
import { DndContext, DragOverlay, pointerWithin, rectIntersection } from '@dnd-kit/core';
import Column from './Column';
import ColumnForm from './ColumnForm';
import TaskCard from './TaskCard';
import { useApp } from '../context/AppContext';
import { Plus, Save, X } from 'lucide-react';

export default function KanbanBoard({ onCreateProject = () => {} }) {
  const { state, actions } = useApp();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  const [activeTask, setActiveTask] = useState(null);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');

  // Project editing handlers
  const handleProjectDoubleClick = () => {
    setEditProjectName(activeProject.name);
    setEditProjectDescription(activeProject.description || '');
    setIsEditingProject(true);
  };

  const handleProjectSave = () => {
    if (editProjectName.trim() && activeProject) {
      actions.updateProject({
        ...activeProject,
        name: editProjectName.trim(),
        description: editProjectDescription.trim(),
      });
      setIsEditingProject(false);
    }
  };

  const handleProjectCancel = () => {
    setIsEditingProject(false);
    setEditProjectName('');
    setEditProjectDescription('');
  };

  const handleProjectKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleProjectSave();
    } else if (e.key === 'Escape') {
      handleProjectCancel();
    }
  };

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

  // Custom collision detection that combines pointerWithin and rectIntersection
  const customCollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    const rectCollisions = rectIntersection(args);

    // Combine both results, preferring pointerWithin for more accurate detection
    return [...new Set([...pointerCollisions, ...rectCollisions])];
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overId = over.id;
    const overData = over.data.current;

    // Handle different types of drop targets
    if (overData?.type === 'column') {
      // Dropping directly on a column
      const targetColumnId = overId;
      const targetColumn = activeProject.getColumnById(targetColumnId);
      if (targetColumn) {
        actions.moveTask(activeProject.id, taskId, targetColumnId);
      }
    } else if (overData?.type === 'dropZone') {
      // Dropping on a specific drop zone within a column
      const targetColumnId = overData.columnId;
      const targetColumn = activeProject.getColumnById(targetColumnId);
      if (targetColumn) {
        actions.moveTask(activeProject.id, taskId, targetColumnId);
      }
    }
  };

  return (
    <div className="h-full p-6">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditingProject ? (
              <div className="space-y-3" onKeyDown={handleProjectKeyPress}>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full text-3xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-500 focus:ring-0 resize-none"
                  placeholder="Project name"
                  autoFocus
                />
                <textarea
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  className="w-full text-lg bg-transparent border-none outline-none text-gray-400 placeholder-gray-500 focus:ring-0 resize-none"
                  placeholder="Project description (optional)"
                  rows={2}
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleProjectSave}
                    className="flex items-center space-x-2 px-3 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleProjectCancel}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div onDoubleClick={handleProjectDoubleClick} className="cursor-pointer group">
                <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-accent-300 transition-colors">
                  {activeProject.name}
                </h2>
                {activeProject.description && (
                  <p className="text-gray-400 text-lg group-hover:text-gray-300 transition-colors">
                    {activeProject.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Double-click to edit
                </p>
              </div>
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
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-0">
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
