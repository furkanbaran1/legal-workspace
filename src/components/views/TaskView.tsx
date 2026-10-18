import { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, User as UserIcon, Calendar } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { getCountdownLabel, getCaseTypeColor, getUserById, formatDateShort } from '@/utils/helpers';

interface TaskViewProps {
  onSelectCase: (caseId: string) => void;
}

type FilterTab = 'all' | 'mine' | 'today' | 'overdue' | 'completed';

export function TaskView({ onSelectCase }: TaskViewProps) {
  const { cases, users, currentUser, toggleSubTask } = useStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('mine');

  const allTasks = useMemo(() => {
    return cases.flatMap((c) =>
      c.subTasks.map((st) => ({
        caseItem: c,
        subTask: st,
      }))
    );
  }, [cases]);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    switch (activeTab) {
      case 'mine':
        return allTasks.filter((t) => t.subTask.assignedTo === currentUser.id && !t.subTask.completed);
      case 'today':
        return allTasks.filter((t) => t.caseItem.strictDate === todayStr && !t.subTask.completed);
      case 'overdue':
        return allTasks.filter((t) => {
          const d = new Date(t.caseItem.strictDate);
          d.setHours(0, 0, 0, 0);
          return d < today && !t.subTask.completed;
        });
      case 'completed':
        return allTasks.filter((t) => t.subTask.completed);
      case 'all':
      default:
        return allTasks.filter((t) => !t.subTask.completed);
    }
  }, [allTasks, activeTab, currentUser.id]);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'mine', label: 'Benim Görevlerim', count: allTasks.filter((t) => t.subTask.assignedTo === currentUser.id && !t.subTask.completed).length },
    { id: 'all', label: 'Tüm Bekleyen', count: allTasks.filter((t) => !t.subTask.completed).length },
    { id: 'today', label: 'Bugün', count: allTasks.filter((t) => { const d = new Date(t.caseItem.strictDate); d.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return d.getTime() === today.getTime() && !t.subTask.completed; }).length },
    { id: 'overdue', label: 'Geciken', count: allTasks.filter((t) => { const d = new Date(t.caseItem.strictDate); d.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return d < today && !t.subTask.completed; }).length },
    { id: 'completed', label: 'Tamamlanan', count: allTasks.filter((t) => t.subTask.completed).length },
  ];

  const priorityColors: Record<string, string> = {
    critical: 'priority-critical',
    warning: 'priority-warning',
    normal: 'priority-normal',
    overdue: 'priority-overdue',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
          Görevler
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Alt görevleri takip edin, atamaları görüntüleyin
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
          <p className="text-sm text-neutral-500">
            {activeTab === 'completed' ? 'Henüz tamamlanmış görev yok.' : 'Bu filtrede görev bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(({ caseItem, subTask }) => {
            const assignee = getUserById(users, subTask.assignedTo);
            const countdown = getCountdownLabel(caseItem.strictDate);
            return (
              <div
                key={subTask.id}
                className={`card p-4 card-hover ${subTask.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleSubTask(caseItem.id, subTask.id)}
                    className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      subTask.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500'
                    }`}
                  >
                    {subTask.completed ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-0" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onSelectCase(caseItem.id)}
                      className="text-left w-full"
                    >
                      <div className={`text-sm font-medium ${
                        subTask.completed
                          ? 'text-neutral-400 line-through'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}>
                        {subTask.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`badge ${getCaseTypeColor(caseItem.caseType)} text-[10px]`}>
                          {caseItem.caseType}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">{caseItem.caseNumber}</span>
                        <span className="text-xs text-neutral-500">•</span>
                        <span className="text-xs text-neutral-500">{caseItem.clientName}</span>
                      </div>
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {assignee && (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded ${assignee.color} text-white text-[9px] font-bold flex items-center justify-center`}>
                          {assignee.avatar}
                        </div>
                        <span className="text-xs text-neutral-500 hidden sm:inline">{assignee.name.split(' ')[1] || assignee.name}</span>
                      </div>
                    )}
                    {!subTask.completed && (
                      <span className={`badge ${priorityColors[countdown.level]} text-[10px]`}>
                        {countdown.text}
                      </span>
                    )}
                    {subTask.completed && subTask.completedAt && (
                      <span className="text-xs text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {formatDateShort(subTask.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
