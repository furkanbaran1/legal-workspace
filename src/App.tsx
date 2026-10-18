import { useState } from 'react';
import { StoreProvider } from '@/store/StoreContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { QRModal } from '@/components/ui/QRModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Dashboard } from '@/components/views/Dashboard';
import { CaseList } from '@/components/views/CaseList';
import { CaseDetail } from '@/components/views/CaseDetail';
import { CaseForm } from '@/components/views/CaseForm';
import { TaskView } from '@/components/views/TaskView';
import { SearchView } from '@/components/views/SearchView';
import { ActivityView } from '@/components/views/ActivityView';
import { UserManagement } from '@/components/views/UserManagement';
import LoginModal from '@/components/auth/LoginModal';
import type { ViewName } from '@/types';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewName>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [caseFormOpen, setCaseFormOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const handleNavigate = (view: ViewName) => {
    setSelectedCaseId(null);
    setEditingCaseId(null);
    setCurrentView(view);
    if (view !== 'search') setSearchQuery('');
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const handleBackToList = () => {
    setSelectedCaseId(null);
    setEditingCaseId(null);
  };

  const handleEditCase = () => {
    setEditingCaseId(selectedCaseId);
    setCaseFormOpen(true);
  };

  const handleAddCase = () => {
    setEditingCaseId(null);
    setCaseFormOpen(true);
  };

  const renderView = () => {
    if (selectedCaseId) {
      return (
        <CaseDetail
          caseId={selectedCaseId}
          onBack={handleBackToList}
          onEdit={handleEditCase}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} onSelectCase={handleSelectCase} />;
      case 'cases':
        return <CaseList onSelectCase={handleSelectCase} onAddCase={handleAddCase} />;
      case 'tasks':
        return <TaskView onSelectCase={handleSelectCase} />;
      case 'search':
        return (
          <SearchView
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSelectCase={handleSelectCase}
          />
        );
      case 'activity':
        return <ActivityView />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard onNavigate={handleNavigate} onSelectCase={handleSelectCase} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <Navbar
            onNavigate={handleNavigate}
            onOpenQR={() => setQrOpen(true)}
            onOpenSidebar={() => setSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onLogout={handleLogout}
          />

          {/* Mobile theme toggle bar */}
          <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500">Tema</span>
            <ThemeToggle />
          </div>

          <main className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
            {renderView()}
          </main>
        </div>
      </div>

      <BottomNav currentView={currentView} onNavigate={handleNavigate} />

      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />

      <CaseForm
        open={caseFormOpen}
        onClose={() => {
          setCaseFormOpen(false);
          setEditingCaseId(null);
        }}
        editingCaseId={editingCaseId}
      />
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;