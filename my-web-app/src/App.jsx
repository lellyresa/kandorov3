import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import ProjectForm from './components/ProjectForm';

function App() {
  const [showProjectForm, setShowProjectForm] = useState(false);

  const openProjectForm = () => setShowProjectForm(true);
  const closeProjectForm = () => setShowProjectForm(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-900 flex">
        <Sidebar onCreateProject={openProjectForm} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <KanbanBoard onCreateProject={openProjectForm} />
          </div>
        </main>
        <ProjectForm isOpen={showProjectForm} onClose={closeProjectForm} />
      </div>
    </AppProvider>
  );
}

export default App;
