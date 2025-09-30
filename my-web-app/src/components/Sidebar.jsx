import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Settings,
  Plus,
  Folder,
  BarChart3,
  Users,
  FileText,
  Bell,
  Search
} from 'lucide-react';

export default function Sidebar() {
  const { state, actions } = useApp();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: true
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      badge: state.projects.length
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro',
      icon: Timer
    }
  ];

  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl shadow-dark-medium">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Kandoro</h1>
            <p className="text-xs text-gray-400 font-medium">Kanban + Pomodoro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="sidebar-item">
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-700/50 text-gray-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Project Section */}
        {activeProject && (
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Current Project
              </h3>
              <div className="modern-card p-3">
                <h4 className="font-medium text-white text-sm mb-1">
                  {activeProject.name}
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  {activeProject.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {activeProject.columns.length} columns
                  </span>
                  <span className="text-accent-400">
                    {activeProject.tasks.length} tasks
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <button className="sidebar-item w-full text-left">
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
            <button className="sidebar-item w-full text-left">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
            <button className="sidebar-item w-full text-left">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
            <p className="text-xs text-gray-400 truncate">user@example.com</p>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </aside>
  );
}

