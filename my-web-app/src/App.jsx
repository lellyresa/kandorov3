import { AppProvider } from './context/AppContext';
import KanbanBoard from './components/KanbanBoard';
import Header from './components/Header';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <KanbanBoard />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
