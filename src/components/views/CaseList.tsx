import { useState, useMemo } from 'react';
import { Plus, Filter, FolderKanban, Search, Users, Calendar } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import {
  getCountdownLabel, getCaseTypeColor, getStatusLabel, getProgressPercent,
  getCompletedSubTaskCount, formatDateShort, getUserById
} from '@/utils/helpers';
import type { CaseType, CaseStatus, Case } from '@/types';

interface CaseListProps {
  onSelectCase: (caseId: string) => void;
  onAddCase: () => void;
}

const CASE_TYPES: CaseType[] = ['Duruşma', 'İcra', 'Dilekçe Yazımı', 'Keşif', 'Danışmanlık', 'Sulh'];
const STATUS_FILTERS: { value: CaseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'beklemede', label: 'Beklemede' },
  { value: 'kapali', label: 'Kapalı' },
];

export function CaseList({ onSelectCase, onAddCase }: CaseListProps) {
  const { cases, users } = useStore();
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.caseType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.caseNumber.toLowerCase().includes(q) ||
          (c.folioNumber || '').toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cases, statusFilter, typeFilter, search]);

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
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
            Dosya & Dava Takibi
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {filtered.length} dosya listeleniyor
          </p>
        </div>
        <button onClick={onAddCase} className="btn-primary flex-shrink-0">
          <Plus size={18} />
          <span className="hidden sm:inline">Yeni Dosya</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Esas No, föy no, dosya adı veya müvekkil ara..."
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex-shrink-0"
        >
          <Filter size={16} />
          Filtrele
        </button>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="card p-4 space-y-3 animate-slide-down">
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-2">Durum</div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === s.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-2">Dosya Türü</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                Tümü
              </button>
              {CASE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Case list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderKanban size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-500">Filtrelere uygun dosya bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((caseItem: Case) => {
            const countdown = getCountdownLabel(caseItem.strictDate);
            const progress = getProgressPercent(caseItem);
            const completed = getCompletedSubTaskCount(caseItem);
            return (
              <button
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem.id)}
                className="card p-5 card-hover text-left group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`badge ${getCaseTypeColor(caseItem.caseType)} flex-shrink-0`}>
                      {caseItem.caseType}
                    </span>
                    <span className={`badge ${statusColors[caseItem.status]} flex-shrink-0`}>
                      {getStatusLabel(caseItem.status)}
                    </span>
                  </div>
                  <span className={`badge ${priorityColors[countdown.level]} flex-shrink-0`}>
                    {countdown.text}
                  </span>
                </div>

                {/* Title & case number */}
                <div className="mb-3">
                  <div className="font-mono text-xs text-neutral-500 mb-1">
                    {caseItem.caseNumber}
                    {caseItem.folioNumber ? ` • Föy: ${caseItem.folioNumber}` : ''}
                  </div>
                  <h3 className="font-display font-semibold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                    {caseItem.title}
                  </h3>
                </div>

                {/* Client */}
                <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  <Users size={14} className="text-neutral-400" />
                  <span className="truncate">{caseItem.clientName}</span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Hedef: {formatDateShort(caseItem.targetDate)}</span>
                  </div>
                  <div className="text-neutral-300 dark:text-neutral-700">•</div>
                  <div className="flex items-center gap-1 font-medium">
                    <span>Kesin: {formatDateShort(caseItem.strictDate)}</span>
                  </div>
                </div>

                {/* Progress */}
                {caseItem.subTasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-neutral-500">Alt Görevler</span>
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {completed}/{caseItem.subTasks.length}
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
                  </div>
                )}

                {/* Assigned users */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex -space-x-2">
                    {caseItem.assignedTo.slice(0, 3).map((uid) => {
                      const user = getUserById(users, uid);
                      if (!user) return null;
                      return (
                        <div
                          key={uid}
                          className={`w-6 h-6 rounded-full ${user.color} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-neutral-900`}
                          title={user.name}
                        >
                          {user.avatar}
                        </div>
                      );
                    })}
                  </div>
                  {caseItem.attachments.length > 0 && (
                    <span className="text-xs text-neutral-400 ml-auto">
                      📎 {caseItem.attachments.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
