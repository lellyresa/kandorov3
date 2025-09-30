import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Settings, Timer } from 'lucide-react';

export default function Header() {
  const { state, actions } = useApp();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-medium">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Kandoro</h1>
              <p className="text-sm text-gray-500 font-medium">Kanban + Pomodoro</p>
            </div>
          </div>

          {/* Project Info and Controls */}
          <div className="flex items-center space-x-4">
            {activeProject && (
              <div className="text-right">
                <h2 className="text-lg font-medium text-gray-900">{activeProject.name}</h2>
                <p className="text-sm text-gray-500">{activeProject.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-medium hover:shadow-large font-medium"
                onClick={() => {
                  // TODO: Open new project modal
                  console.log('Create new project');
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Project</span>
              </button>

              <button
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-soft hover:shadow-medium font-medium"
                onClick={() => {
                  // TODO: Open settings modal
                  console.log('Open settings');
                }}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
