import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Settings,
  Plus,
  Bell,
  Search,
  Trash2,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ onCreateProject = () => {} }) {
  const { state, actions } = useApp();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  const activeProjectId = state.activeProjectId;

  const [tasksOpen, setTasksOpen] = React.useState(false);

  const allTasks = React.useMemo(() => state.projects.flatMap(p => p.tasks || []), [state.projects]);

  const counts = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;

    let dueToday = 0, dueTomorrow = 0, dueThisWeek = 0, overdue = 0;
    let high = 0, medium = 0, low = 0;

    allTasks.forEach(t => {
      const priority = (t.priority || 'medium').toLowerCase();
      if (priority === 'high') high++; else if (priority === 'low') low++; else medium++;

      if (!t.dueDate) return;
      const due = new Date(t.dueDate);
      const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const diffDays = Math.round((startOfDue - startOfToday) / msPerDay);
      if (diffDays < 0) overdue++;
      else if (diffDays === 0) dueToday++;
      else if (diffDays === 1) dueTomorrow++;
      else if (diffDays <= 7) dueThisWeek++;
    });

    return { dueToday, dueTomorrow, dueThisWeek, overdue, high, medium, low };
  }, [allTasks]);

  const sidebarItems = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare }
  ];

  return (
    <aside className="w-64 flex flex-col h-screen" style={{ backgroundColor: '#121212', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo/Brand */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Kandoro</h1>
            <p className="text-[12px] text-[#666666] font-medium">Kanban + Pomodoro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            if (item.id === 'tasks') {
              return (
                <div key={item.id}>
                  <button
                    className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-[14px] font-medium"
                    style={{ color: '#999999' }}
                    onClick={() => setTasksOpen((v) => !v)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">Tasks</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${tasksOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {tasksOpen && (
                    <div className="mt-1 pl-9 space-y-1">
                      <div className="text-[13px]" style={{ color: counts.overdue > 0 ? '#DC2626' : '#999999' }}>
                        Overdue: <span style={{ color: counts.overdue > 0 ? '#F87171' : '#AAAAAA' }}>{counts.overdue}</span>
                      </div>
                      <div className="text-[13px]" style={{ color: counts.dueToday > 0 ? '#EF4444' : '#999999' }}>
                        Due today: <span style={{ color: counts.dueToday > 0 ? '#FCA5A5' : '#AAAAAA' }}>{counts.dueToday}</span>
                      </div>
                      <div className="text-[13px]" style={{ color: counts.dueTomorrow > 0 ? '#F97316' : '#999999' }}>
                        Due tomorrow: <span style={{ color: counts.dueTomorrow > 0 ? '#FDBA74' : '#AAAAAA' }}>{counts.dueTomorrow}</span>
                      </div>
                      <div className="text-[13px]" style={{ color: counts.dueThisWeek > 0 ? '#FFC107' : '#999999' }}>
                        Due this week: <span style={{ color: counts.dueThisWeek > 0 ? '#FFE08A' : '#AAAAAA' }}>{counts.dueThisWeek}</span>
                      </div>
                      <div className="pt-1 text-[13px] space-y-1" style={{ color: '#999999' }}>
                        <div className="flex items-center"><span className="w-2 h-2 rounded-full mr-2" style={{ background: '#D24B4B' }}></span>High priority: <span className="ml-1" style={{ color: '#BBBBBB' }}>{counts.high}</span></div>
                        <div className="flex items-center"><span className="w-2 h-2 rounded-full mr-2" style={{ background: '#E5AE06' }}></span>Medium: <span className="ml-1" style={{ color: '#BBBBBB' }}>{counts.medium}</span></div>
                        <div className="flex items-center"><span className="w-2 h-2 rounded-full mr-2" style={{ background: '#2FA25B' }}></span>Low: <span className="ml-1" style={{ color: '#BBBBBB' }}>{counts.low}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Projects */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold uppercase" style={{ color: '#666666', letterSpacing: '0.1em' }}>
              Projects
            </h3>
            <button
              onClick={onCreateProject}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#999999' }}
              title="Create project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {Array.from(new Map(state.projects.map(p => [p.id, p])).values()).map((project) => {
              const isActive = activeProjectId === project.id;

              const handleDeleteProject = (event) => {
                event.stopPropagation();
                event.preventDefault();
                if (window.confirm(`Delete project "${project.name}"? This will remove all of its columns and tasks.`)) {
                  actions.deleteProject(project.id);
                }
              };

              return (
                <div key={project.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => actions.setActiveProject(project.id)}
                    className="flex-1 text-left"
                  >
                    <div
                      className="flex items-center justify-between px-4 py-2.5 transition-colors"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                        borderRadius: 12,
                      }}
                    >
                      <span className="truncate" style={{ color: isActive ? '#FFFFFF' : '#CCCCCC' }}>{project.name}</span>
                    </div>
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      className="p-2 rounded-md transition-colors"
                      style={{ color: '#666666' }}
                      title="Project settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="p-2 rounded-md transition-colors"
                      style={{ color: '#666666' }}
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Project Stats */}
        {activeProject && (
          <div className="mt-8">
            <h3 className="text-[11px] font-semibold uppercase mb-3" style={{ color: '#666666', letterSpacing: '0.1em' }}>
              Current Project
            </h3>
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
              <div className="text-white font-medium mb-2">{activeProject.name}</div>
              <div className="text-[13px]" style={{ color: '#999999' }}>
                <div className="mb-1">Total tasks: {activeProject.tasks.length}</div>
                <div className="mb-1">
                  {(() => {
                    const todo = activeProject.tasks.filter(t => t.status === 'todo').length;
                    const inprog = activeProject.tasks.filter(t => t.status === 'in-progress').length;
                    const done = activeProject.tasks.filter(t => t.status === 'done').length;
                    return <span>{todo} to do, {inprog} in progress, {done} done</span>;
                  })()}
                </div>
                <div className="mb-1" style={{ color: '#DC2626' }}>
                  Overdue: {activeProject.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-[11px] font-semibold uppercase mb-3" style={{ color: '#666666', letterSpacing: '0.1em' }}>
            Quick Actions
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors" onClick={onCreateProject} style={{ color: '#999999' }}>
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors" style={{ color: '#999999' }}>
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors" style={{ color: '#999999' }}>
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
            <p className="text-xs text-gray-400 truncate">user@example.com</p>
          </div>
          <Settings className="w-4 h-4" style={{ color: '#666666' }} />
        </div>
      </div>
    </aside>
  );
}
