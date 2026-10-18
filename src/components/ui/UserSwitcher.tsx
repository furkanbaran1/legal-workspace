import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, Shield } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { getRoleLabel } from '@/utils/helpers';

interface UserSwitcherProps {
  onLogout?: () => void;
}

export function UserSwitcher({ onLogout }: UserSwitcherProps) {
  const { currentUser } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogoutClick = () => {
    setOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      // Eğer prop geçilmediyse varsayılan sayfa yenileme ile çıkış
      window.location.reload();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg ${currentUser.color} text-white text-xs font-bold flex items-center justify-center`}>
          {currentUser.avatar}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
            {currentUser.name}
          </span>
          <span className="text-xs text-neutral-500 leading-tight">
            {getRoleLabel(currentUser.role)}
          </span>
        </div>
        <ChevronDown size={16} className="text-neutral-400 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 card p-2 z-50 animate-slide-down bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-2xl">
          {/* Aktif Kullanıcı Kartı */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl mb-1 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${currentUser.color} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
              {currentUser.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-neutral-500 flex items-center gap-1 capitalize">
                <Shield size={12} className="text-primary-500" />
                {getRoleLabel(currentUser.role)}
              </p>
            </div>
          </div>

          {/* Çıkış Yap Butonu */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium text-sm transition-colors text-left"
          >
            <LogOut size={16} />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      )}
    </div>
  );
}