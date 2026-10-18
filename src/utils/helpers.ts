import type { Case, PriorityLevel, User } from '@/types';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${formatDateShort(dateStr)} ${hours}:${mins}`;
};

export const daysUntil = (dateStr: string): number => {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getCountdownLabel = (dateStr: string): { text: string; level: PriorityLevel | 'overdue' | 'done' } => {
  const days = daysUntil(dateStr);
  if (days < 0) return { text: `${Math.abs(days)} gün gecikti`, level: 'overdue' };
  if (days === 0) return { text: 'Bugün', level: 'critical' };
  if (days === 1) return { text: 'Yarın', level: 'critical' };
  if (days <= 3) return { text: `${days} gün kaldı`, level: 'critical' };
  if (days <= 7) return { text: `${days} gün kaldı`, level: 'warning' };
  return { text: `${days} gün kaldı`, level: 'normal' };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') return 'pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'doc';
  return 'file';
};

export const getPriorityLabel = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'critical': return 'Kesin Tarih';
    case 'warning': return 'Yaklaşan Tarih';
    case 'normal': return 'Hedef Tarih';
  }
};

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'avukat': return 'Avukat';
    case 'stajyer': return 'Stajyer';
    case 'sekreter': return 'Sekreter';
    case 'admin': return 'Yönetici';
    case 'developer': return 'Geliştirici / Sistem Admin';
    default: return role;
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'aktif': return 'Aktif';
    case 'kapali': return 'Kapalı';
    case 'beklemede': return 'Beklemede';
    default: return status;
  }
};

export const getCaseTypeColor = (caseType: string): string => {
  const colors: Record<string, string> = {
    'Duruşma': 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
    'İcra': 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
    'Dilekçe Yazımı': 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    'Keşif': 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400',
    'Danışmanlık': 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400',
    'Sulh': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  };
  return colors[caseType] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
};

export const getUserById = (users: User[], id: string): User | undefined => users.find((u) => u.id === id);

export const getUserNames = (users: User[], ids: string[]): string =>
  ids.map((id) => getUserById(users, id)?.name || 'Bilinmeyen').join(', ');

export const isCaseOverdue = (caseItem: Case): boolean =>
  caseItem.status === 'aktif' && daysUntil(caseItem.strictDate) < 0;

export const isCaseDueToday = (caseItem: Case): boolean =>
  caseItem.status === 'aktif' && daysUntil(caseItem.strictDate) === 0;

export const getCompletedSubTaskCount = (caseItem: Case): number =>
  caseItem.subTasks.filter((st) => st.completed).length;

export const getProgressPercent = (caseItem: Case): number => {
  if (caseItem.subTasks.length === 0) return 0;
  return Math.round((getCompletedSubTaskCount(caseItem) / caseItem.subTasks.length) * 100);
};

export const generateId = (): string =>
  `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dakika önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay < 30) return `${diffDay} gün önce`;
  return formatDateShort(dateStr);
};