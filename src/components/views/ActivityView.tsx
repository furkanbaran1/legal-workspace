import { useMemo } from 'react';
import {
  History, FileText, CheckSquare, Paperclip, FolderKanban,
  Settings, User as UserIcon
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { getRelativeTime } from '@/utils/helpers';

export function ActivityView() {
  const { activities, users, cases } = useStore();

  const sorted = useMemo(() =>
    [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [activities]
  );

  const actionIcons: Record<string, typeof FileText> = {
    'dosya oluşturdu': FolderKanban,
    'dosyayı sildi': FolderKanban,
    'alt görevi tamamladı': CheckSquare,
    'alt görevi yeniden açtı': CheckSquare,
    'alt görev ekledi': CheckSquare,
    'dosya yükledi': Paperclip,
    'sistem': Settings,
  };

  const actionColors: Record<string, string> = {
    'dosya oluşturdu': 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400',
    'dosyayı sildi': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    'alt görevi tamamladı': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'alt görevi yeniden açtı': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'alt görev ekledi': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    'dosya yükledi': 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof sorted> = {};
    sorted.forEach((a) => {
      const date = new Date(a.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return groups;
  }, [sorted]);

  const dateLabels: Record<string, string> = {};
  Object.keys(grouped).forEach((dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      dateLabels[dateStr] = 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateLabels[dateStr] = 'Dün';
    } else {
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      dateLabels[dateStr] = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
          Aktivite Geçmişi
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Kim ne zaman ne yaptı - tüm sistem aktiviteleri
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <History size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-500">Henüz aktivite kaydı yok.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateStr, items]) => (
            <div key={dateStr}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {dateLabels[dateStr]}
                </div>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              </div>

              <div className="card divide-y divide-neutral-100 dark:divide-neutral-800">
                {items.map((activity) => {
                  const Icon = actionIcons[activity.action] || FileText;
                  const colorClass = actionColors[activity.action] || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500';
                  const user = users.find((u) => u.id === activity.userId);
                  const caseItem = cases.find((c) => c.id === activity.targetId);

                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          <span className="font-medium">{activity.userName}</span>
                          <span className="text-neutral-500"> {activity.action}: </span>
                          <span className="font-medium">{activity.targetName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {user && (
                            <div className="flex items-center gap-1 text-xs text-neutral-400">
                              <div className={`w-3.5 h-3.5 rounded ${user.color} text-white text-[8px] font-bold flex items-center justify-center`}>
                                {user.avatar}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          )}
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs text-neutral-400">{getRelativeTime(activity.timestamp)}</span>
                          {caseItem && (
                            <>
                              <span className="text-xs text-neutral-400">•</span>
                              <span className="text-xs text-neutral-400 font-mono">{caseItem.caseNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
