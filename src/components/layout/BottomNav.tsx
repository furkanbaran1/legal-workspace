import { LayoutDashboard, FolderKanban, CheckSquare, Search, History } from 'lucide-react';
import type { ViewName } from '@/types';

interface BottomNavProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
}

const NAV_ITEMS: { id: ViewName; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: LayoutDashboard },
  { id: 'cases', label: 'Dosyalar', icon: FolderKanban },
  { id: 'tasks', label: 'Görevler', icon: CheckSquare },
  { id: 'search', label: 'Arama', icon: Search },
  { id: 'activity', label: 'Geçmiş', icon: History },
];

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1 h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-600'
              }`}
            >
              <Icon size={22} className={active ? 'scale-110' : ''} style={{ transition: 'transform 0.2s' }} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
