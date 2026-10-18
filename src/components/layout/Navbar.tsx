import { Scale, Search, QrCode, Menu } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserSwitcher } from '@/components/ui/UserSwitcher';
import type { ViewName } from '@/types';

interface NavbarProps {
  onNavigate: (view: ViewName) => void;
  onOpenQR: () => void;
  onOpenSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLogout?: () => void;
}

export function Navbar({ onNavigate, onOpenQR, onOpenSidebar, searchQuery, onSearchChange, onLogout }: NavbarProps) {
  const { cases } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        {/* Mobile menu */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm">
            <Scale size={20} />
          </div>
          <div className="hidden md:block">
            <div className="font-display font-bold text-base text-neutral-900 dark:text-neutral-100 leading-tight">
              Hukuk Bürosu
            </div>
            <div className="text-xs text-neutral-500 leading-tight">İş Takip & Yönetim</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto hidden sm:block">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value && e.target.value.length > 0) onNavigate('search');
              }}
              placeholder="Esas No, müvekkil, kişi ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-neutral-950 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
          <button
            onClick={() => onNavigate('search')}
            className="sm:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Search size={20} />
          </button>

          <button
            onClick={onOpenQR}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Mobil Bağlantı QR Kodu"
          >
            <QrCode size={20} />
          </button>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <UserSwitcher onLogout={onLogout} />
        </div>
      </div>

      {/* Active cases ticker */}
      <div className="hidden lg:flex items-center gap-2 px-6 h-9 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{cases.filter((c) => c.status === 'aktif').length} aktif dava dosyası</span>
        <span className="text-neutral-300 dark:text-neutral-700">•</span>
        <span>{cases.reduce((acc, c) => acc + c.subTasks.filter((st) => !st.completed).length, 0)} tamamlanmamış görev</span>
      </div>
    </header>
  );
}