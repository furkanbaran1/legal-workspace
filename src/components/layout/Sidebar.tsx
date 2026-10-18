import { LayoutDashboard, FolderKanban, CheckSquare, Search, History, X, Users } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { ViewName } from '@/types';

interface SidebarProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ currentView, onNavigate, open, onClose }: SidebarProps) {
  const { currentUser } = useStore();
  
  // Hem admin hem de developer rolleri yönetici yetkilerine sahip kabul edilir[cite: 1]
  const isAdminOrDev = currentUser.role === 'admin' || currentUser.role === 'developer';

  const navItems: { id: ViewName; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: LayoutDashboard },
    { id: 'cases', label: 'Dosya & Dava Takibi', icon: FolderKanban },
    { id: 'tasks', label: 'Görevler', icon: CheckSquare },
    { id: 'search', label: 'Arama', icon: Search },
    { id: 'activity', label: 'Aktivite Geçmişi', icon: History },
    ...(isAdminOrDev ? [{ id: 'users' as ViewName, label: 'Kişi Yönetimi', icon: Users }] : []),
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 w-64 h-screen lg:h-[calc(100vh-4rem-2.25rem)] pt-16 lg:pt-0 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-display font-semibold text-sm text-neutral-900 dark:text-neutral-100">Menü</span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon size={18} className={active ? 'text-primary-600 dark:text-primary-400' : ''} />
                <span>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
              </button>
            );
          })}

          {isAdminOrDev && (
            <div className="mt-3 px-3.5 py-2 text-[10px] font-semibold text-rose-500 uppercase tracking-wide">
              Yönetici Bölümü
            </div>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-xs text-neutral-400 text-center">
            <div className="font-medium text-neutral-500 dark:text-neutral-400 mb-1">Hukuk Bürosu Sistemi</div>
            <div>v1.0 • Furkan Baran Ilgaz</div>
          </div>
        </div>
      </aside>
    </>
  );
}