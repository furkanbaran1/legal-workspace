import {
  CalendarClock, AlertTriangle, FolderKanban, CheckSquare,
  Clock, ArrowRight, FileText, TrendingUp
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import {
  daysUntil, getCountdownLabel, getPriorityLabel, getCaseTypeColor,
  getStatusLabel, getCompletedSubTaskCount, getProgressPercent, formatDateShort
} from '@/utils/helpers';
import type { ViewName, Case } from '@/types';

interface DashboardProps {
  onNavigate: (view: ViewName) => void;
  onSelectCase: (caseId: string) => void;
}

export function Dashboard({ onNavigate, onSelectCase }: DashboardProps) {
  const { cases, currentUser, users } = useStore();

  const activeCases = cases.filter((c) => c.status === 'aktif');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tasks due today (strict date = today)
  const tasksDueToday = activeCases.filter((c) => daysUntil(c.strictDate) === 0);
  // Upcoming deadlines (strict date within 7 days)
  const upcomingDeadlines = activeCases.filter((c) => {
    const d = daysUntil(c.strictDate);
    return d > 0 && d <= 7;
  });
  // Overdue
  const overdueCases = activeCases.filter((c) => daysUntil(c.strictDate) < 0);

  // Tasks assigned to current user (uncompleted subtasks)
  const mySubTasks = activeCases.flatMap((c) =>
    c.subTasks
      .filter((st) => !st.completed && st.assignedTo === currentUser.id)
      .map((st) => ({ caseItem: c, subTask: st }))
  );

  // Stats
  const stats = [
    {
      label: 'Günün Yapılacak İşleri',
      value: tasksDueToday.length + mySubTasks.filter((t) => daysUntil(t.caseItem.strictDate) === 0).length,
      icon: CheckSquare,
      color: 'text-primary-600 dark:text-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-500/10',
      border: 'border-primary-200 dark:border-primary-500/20',
    },
    {
      label: 'Yaklaşan Son Tarihler',
      value: upcomingDeadlines.length,
      icon: CalendarClock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-200 dark:border-amber-500/20',
    },
    {
      label: 'Geciken / Bekleyen İşler',
      value: overdueCases.length,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-500/20',
    },
    {
      label: 'Aktif Dava Dosyaları',
      value: activeCases.length,
      icon: FolderKanban,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/20',
    },
  ];

  // Urgent cases sorted by strict date
  const urgentCases = [...activeCases].sort((a, b) => daysUntil(a.strictDate) - daysUntil(b.strictDate)).slice(0, 5);

  // Generate smart alert
  const firstName = currentUser.name.split(' ')[1] || currentUser.name;
  const criticalCount = tasksDueToday.length + overdueCases.length;
  let alertMessage = '';
  let alertColor = '';
  if (criticalCount > 0) {
    alertMessage = `${firstName} Bey/Hanım, bugün tamamlamanız gereken ${tasksDueToday.length} kesin süreli işiniz, ${overdueCases.length} geciken işiniz var!`;
    alertColor = 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400';
  } else if (upcomingDeadlines.length > 0) {
    alertMessage = `${firstName} Bey/Hanım, önümüzdeki 7 gün içinde ${upcomingDeadlines.length} yaklaşan son tarih bulunuyor.`;
    alertColor = 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400';
  } else {
    alertMessage = `${firstName} Bey/Hanım, tüm işleriniz kontrol altında. Yaklaşan kritik son tarih yok.`;
    alertColor = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400';
  }

  const priorityColors: Record<string, string> = {
    critical: 'priority-critical',
    warning: 'priority-warning',
    normal: 'priority-normal',
    overdue: 'priority-overdue',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
          Hoş geldiniz, {currentUser.name}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {formatDateShort(new Date().toISOString())} • Günlük özet ve acil durumlar
        </p>
      </div>

      {/* Smart Alert Banner */}
      <div className={`card p-4 border-2 ${alertColor} animate-slide-down`}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-sm">{alertMessage}</div>
            {criticalCount > 0 && (
              <button
                onClick={() => onNavigate('tasks')}
                className="mt-2 text-xs font-medium underline hover:no-underline"
              >
                Görevleri görüntüle →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card p-4 lg:p-5 border-2 ${stat.border} card-hover`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <div className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-neutral-500 mt-1 leading-tight">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* My Tasks & Urgent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckSquare size={18} className="text-primary-500" />
              Benim Görevlerim
            </h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
            >
              Tümü <ArrowRight size={12} />
            </button>
          </div>

          {mySubTasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-400">
              <CheckSquare size={32} className="mx-auto mb-2 opacity-40" />
              Size atanan bekleyen görev yok.
            </div>
          ) : (
            <div className="space-y-2">
              {mySubTasks.slice(0, 5).map(({ caseItem, subTask }) => {
                const countdown = getCountdownLabel(caseItem.strictDate);
                return (
                  <button
                    key={subTask.id}
                    onClick={() => onSelectCase(caseItem.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      countdown.level === 'overdue' ? 'bg-red-500' :
                      countdown.level === 'critical' ? 'bg-red-500' :
                      countdown.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {subTask.title}
                      </div>
                      <div className="text-xs text-neutral-500 truncate font-mono">
                        {caseItem.caseNumber}
                        {caseItem.folioNumber ? ` • Föy: ${caseItem.folioNumber}` : ''} • {caseItem.clientName}
                      </div>
                    </div>
                    <span className={`badge ${priorityColors[countdown.level]} flex-shrink-0`}>
                      {countdown.text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Urgent Cases */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock size={18} className="text-red-500" />
              Acil Dosyalar
            </h2>
            <button
              onClick={() => onNavigate('cases')}
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
            >
              Tümü <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2">
            {urgentCases.map((caseItem) => {
              const countdown = getCountdownLabel(caseItem.strictDate);
              return (
                <button
                  key={caseItem.id}
                  onClick={() => onSelectCase(caseItem.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {caseItem.title}
                    </div>
                    <div className="text-xs text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono">
                        {caseItem.caseNumber}
                        {caseItem.folioNumber ? ` • Föy: ${caseItem.folioNumber}` : ''}
                      </span>
                      <span>•</span>
                      <span>{caseItem.clientName}</span>
                    </div>
                  </div>
                  <span className={`badge ${priorityColors[countdown.level]} flex-shrink-0`}>
                    {countdown.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Case Progress Overview */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary-500" />
          Dosya İlerleme Durumu
        </h2>
        <div className="space-y-3">
          {activeCases.slice(0, 6).map((caseItem) => {
            const progress = getProgressPercent(caseItem);
            const completed = getCompletedSubTaskCount(caseItem);
            const total = caseItem.subTasks.length;
            return (
              <button
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem.id)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`badge ${getCaseTypeColor(caseItem.caseType)} flex-shrink-0`}>
                      {caseItem.caseType}
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {caseItem.title} {caseItem.folioNumber ? `(Föy: ${caseItem.folioNumber})` : ''}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
                    {completed}/{total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress === 100 ? 'bg-emerald-500' :
                      progress > 50 ? 'bg-primary-500' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}