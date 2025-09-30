import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-dark-900 flex">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <KanbanBoard />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
