export type UserRole = 'admin' | 'avukat' | 'stajyer' | 'sekreter' | 'katip' | 'developer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  color: string;
}

export type CaseType = 'Duruşma' | 'İcra' | 'Dilekçe Yazımı' | 'Keşif' | 'Danışmanlık' | 'Sulh';
export type CaseStatus = 'aktif' | 'kapali' | 'beklemede';
export type PriorityLevel = 'critical' | 'warning' | 'normal';

export interface SubTask {
  id: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  dataUrl?: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  folioNumber: string;
  title: string;
  clientName: string;
  caseType: CaseType;
  status: CaseStatus;
  assignedTo: string[];
  targetDate: string;
  strictDate: string;
  priority: PriorityLevel;
  description: string;
  subTasks: SubTask[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'case' | 'task' | 'file' | 'system';
  targetId: string;
  targetName: string;
  timestamp: string;
}

export type ViewName = 'dashboard' | 'cases' | 'tasks' | 'search' | 'activity' | 'users';

export interface AppSettings {
  theme: 'light' | 'dark';
  currentUserId: string;
}
