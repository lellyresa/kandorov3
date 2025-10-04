import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import ProjectForm from './components/ProjectForm';
import TaskModal from './components/TaskModal';

function App() {
  const [showProjectForm, setShowProjectForm] = useState(false);

  const openProjectForm = () => setShowProjectForm(true);
  const closeProjectForm = () => setShowProjectForm(false);

  return (
    <AppProvider>
      <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0A' }}>
        <Sidebar onCreateProject={openProjectForm} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto min-h-0">
            <KanbanBoard onCreateProject={openProjectForm} />
          </div>
        </main>
        <ProjectForm isOpen={showProjectForm} onClose={closeProjectForm} />
        <TaskModal />
      </div>
    </AppProvider>
  );
}

export default App;
