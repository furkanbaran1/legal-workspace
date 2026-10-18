import { useMemo } from 'react';
import { Search, FileText, User as UserIcon, Calendar, FolderKanban, Hash, X } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import {
  getCaseTypeColor, getStatusLabel, getCountdownLabel,
  formatDateShort, getUserById
} from '@/utils/helpers';
import type { Case } from '@/types';

interface SearchViewProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSelectCase: (caseId: string) => void;
}

export function SearchView({ query, onQueryChange, onSelectCase }: SearchViewProps) {
  const { cases, users } = useStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const caseResults = cases.filter((c) =>
      c.caseNumber.toLowerCase().includes(q) ||
      (c.folioNumber || '').toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.caseType.toLowerCase().includes(q)
    ).map((c) => ({ type: 'case' as const, item: c, score: 0 }));

    const taskResults = cases.flatMap((c) =>
      c.subTasks
        .filter((st) => st.title.toLowerCase().includes(q))
        .map((st) => ({ type: 'task' as const, item: c, subTask: st, score: 1 }))
    );

    const userResults = users
      .filter((u) => u.name.toLowerCase().includes(q))
      .map((u) => {
        const userCases = cases.filter((c) => c.assignedTo.includes(u.id));
        return { type: 'user' as const, user: u, caseCount: userCases.length, score: 2 };
      });

    return [...caseResults, ...taskResults, ...userResults];
  }, [query, cases, users]);

  const priorityColors: Record<string, string> = {
    critical: 'priority-critical',
    warning: 'priority-warning',
    normal: 'priority-normal',
    overdue: 'priority-overdue',
  };

  const statusColors: Record<string, string> = {
    aktif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    beklemede: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    kapali: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
          Global Arama
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Esas No, müvekkil, görev veya kişi arayın
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Arama yapın..."
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results */}
      {!query.trim() ? (
        <div className="card p-12 text-center">
          <Search size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-500">
            Aramak için yukarıdaki kutuya yazın. Esas No, müvekkil adı, görev adı veya kullanıcı adı ile arama yapabilirsiniz.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="card p-12 text-center">
          <Search size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-500">
            "{query}" için sonuç bulunamadı.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Case results */}
          {results.filter((r) => r.type === 'case').length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <FolderKanban size={14} /> Dosyalar
              </h2>
              <div className="space-y-2">
                {results.filter((r) => r.type === 'case').map(({ item }) => {
                  const c = item as Case;
                  const countdown = getCountdownLabel(c.strictDate);
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="w-full card p-4 card-hover text-left"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-neutral-500">{c.caseNumber}</span>
                          {c.folioNumber && (
                            <span className="font-mono text-xs text-neutral-500">Föy: {c.folioNumber}</span>
                          )}
                          <span className={`badge ${getCaseTypeColor(c.caseType)} text-[10px]`}>{c.caseType}</span>
                          <span className={`badge ${statusColors[c.status]} text-[10px]`}>{getStatusLabel(c.status)}</span>
                        </div>
                        <span className={`badge ${priorityColors[countdown.level]} text-[10px] flex-shrink-0`}>
                          {countdown.text}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        {c.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <UserIcon size={12} /> {c.clientName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task results */}
          {results.filter((r) => r.type === 'task').length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <FileText size={14} /> Görevler
              </h2>
              <div className="space-y-2">
                {results.filter((r) => r.type === 'task').map(({ item, subTask }) => {
                  const c = item as Case;
                  const assignee = getUserById(users, subTask!.assignedTo);
                  return (
                    <button
                      key={subTask!.id}
                      onClick={() => onSelectCase(c.id)}
                      className="w-full card p-4 card-hover text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${subTask!.completed ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-100'}`}>
                            {subTask!.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                            <Hash size={12} /> {c.caseNumber} • {c.clientName}
                          </div>
                        </div>
                        {assignee && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className={`w-5 h-5 rounded ${assignee.color} text-white text-[9px] font-bold flex items-center justify-center`}>
                              {assignee.avatar}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User results */}
          {results.filter((r) => r.type === 'user').length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <UserIcon size={14} /> Kullanıcılar
              </h2>
              <div className="space-y-2">
                {results.filter((r) => r.type === 'user').map(({ user, caseCount }) => (
                  <div key={user.id} className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${user.color} text-white text-sm font-bold flex items-center justify-center`}>
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</div>
                        <div className="text-xs text-neutral-500">
                          {caseCount} atanan dosya
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
