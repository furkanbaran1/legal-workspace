import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Case, ActivityLog, AppSettings, User, Attachment } from '@/types';
import { USERS, INITIAL_CASES, INITIAL_ACTIVITIES } from '@/data/mockData';
import { api } from '@/services/api';

interface StoreContextType {
  users: User[];
  currentUser: User;
  settings: AppSettings;
  cases: Case[];
  activities: ActivityLog[];
  loading: boolean;
  error: string | null;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setCurrentUser: (userId: string) => void;
  addUser: (user: Omit<User, 'id'> & { username?: string; password?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'subTasks' | 'attachments'>) => Promise<void>;
  updateCase: (caseId: string, updates: Partial<Case>) => Promise<void>;
  deleteCase: (caseId: string) => Promise<void>;
  toggleSubTask: (caseId: string, subTaskId: string) => void;
  addSubTask: (caseId: string, title: string, assignedTo: string) => void;
  deleteSubTask: (caseId: string, subTaskId: string) => void;
  addAttachment: (caseId: string, attachment: Omit<Attachment, 'id'>) => void;
  uploadFileAttachment: (caseId: string, file: File) => Promise<void>;
  deleteAttachment: (caseId: string, attachmentId: string) => void;
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'avukatlik_burosu_settings';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { theme: 'light', currentUserId: 'u_dev' };
  });

  const [users, setUsers] = useState<User[]>(USERS);
  const [cases, setCases] = useState<Case[]>(INITIAL_CASES);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    return (
      users.find((u) => u.id === settings.currentUserId) ||
      users.find((u) => u.role === 'developer') ||
      users[0] || {
        id: 'u_dev',
        name: 'Sistem Geliştirici',
        role: 'developer',
        avatar: 'DEV',
        color: 'bg-purple-600',
      }
    );
  }, [users, settings.currentUserId]);

  // Backend'den Canlı Verileri Çek ve Geliştirici Hesabını Garantiye Al
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [fetchedCases, rawUsers, fetchedActivities] = await Promise.all([
        api.getCases().catch(() => INITIAL_CASES),
        api.getUsers().catch(() => USERS),
        api.getActivities().catch(() => INITIAL_ACTIVITIES),
      ]);

      // Sunucudan gelen listede developer yoksa otomatik ekleyelim
      let verifiedUsers = rawUsers;
      const hasDev = verifiedUsers.some((u) => u.role === 'developer' || u.id === 'u_dev');
      if (!hasDev) {
        const devUser: User = {
          id: 'u_dev',
          name: 'Sistem Geliştirici',
          role: 'developer',
          avatar: 'DEV',
          color: 'bg-purple-600',
        };
        verifiedUsers = [devUser, ...verifiedUsers];
      }

      setCases(fetchedCases);
      setUsers(verifiedUsers);
      setActivities(fetchedActivities);
    } catch (err: any) {
      console.error('Veri senkronizasyon hatası:', err);
      setError(err.message || 'Veriler sunucudan çekilemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sayfa yüklendiğinde backend'den verileri getir
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Tema ve Ayarları Kaydet
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}

    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  const setCurrentUser = useCallback((userId: string) => {
    setSettings((prev) => ({ ...prev, currentUserId: userId }));
  }, []);

  // Kullanıcı Ekle
  const addUser = useCallback(async (userData: Omit<User, 'id'> & { username?: string; password?: string }) => {
    try {
      const createdUser = await api.createUser({
        username: userData.username || userData.name.toLowerCase().replace(/\s+/g, ''),
        password: userData.password || '123456',
        name: userData.name,
        role: userData.role,
        color: userData.color,
      });
      setUsers((prev) => [...prev, createdUser]);
    } catch (err: any) {
      const fallbackUser: User = {
        id: 'u_' + Date.now(),
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        color: userData.color || 'bg-primary-500',
      };
      setUsers((prev) => [...prev, fallbackUser]);
    }
  }, []);

  // Kullanıcı Sil
  const deleteUser = useCallback(async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  }, []);

  // Dava Ekle (API + Fallback)
  const addCase = useCallback(async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'subTasks' | 'attachments'>) => {
    const newCase: Case = {
      ...caseData,
      id: 'c_' + Date.now(),
      subTasks: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCases((prev) => [newCase, ...prev]);

    try {
      await api.createCase(newCase);
    } catch (err) {
      console.warn('Backend baglantisi yok, dava yerel hafizaya eklendi.');
    }
  }, []);

  // Dava Güncelle (API + Fallback)
  const updateCase = useCallback(async (caseId: string, updates: Partial<Case>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );

    try {
      await api.updateCase(caseId, updates);
    } catch (err) {
      console.warn('Backend baglantisi yok, guncelleme yerel hafizada saklandi.');
    }
  }, []);

  // Dava Sil (API + Fallback)
  const deleteCase = useCallback(async (caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));

    try {
      await api.deleteCase(caseId);
    } catch (err) {
      console.warn('Backend baglantisi yok, silme islemi yerel hafizada yapildi.');
    }
  }, []);

  // Alt Görev Tamamla/Aç
  const toggleSubTask = useCallback((caseId: string, subTaskId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          subTasks: c.subTasks.map((st) =>
            st.id === subTaskId
              ? {
                  ...st,
                  completed: !st.completed,
                  completedAt: !st.completed ? new Date().toISOString() : undefined,
                  completedBy: !st.completed ? currentUser.id : undefined,
                }
              : st
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [currentUser.id]);

  // Alt Görev Ekle
  const addSubTask = useCallback((caseId: string, title: string, assignedTo: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          subTasks: [...c.subTasks, { id: 's_' + Date.now(), title, assignedTo, completed: false }],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Alt Görev Sil
  const deleteSubTask = useCallback((caseId: string, subTaskId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, subTasks: c.subTasks.filter((st) => st.id !== subTaskId), updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  // Manuel Dosya/Ek Bilgisi Ekle
  const addAttachment = useCallback((caseId: string, attachment: Omit<Attachment, 'id'>) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, attachments: [...c.attachments, { ...attachment, id: 'a_' + Date.now() }], updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  // Gerçek Dosya/Fotoğraf Yükleme Fonksiyonu
  const uploadFileAttachment = useCallback(async (caseId: string, file: File) => {
    try {
      const uploadedAttachment = await api.uploadAttachment(caseId, file);
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, attachments: [...c.attachments, uploadedAttachment], updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      const localAttachment: Attachment = {
        id: 'a_' + Date.now(),
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        uploadedBy: currentUser.id,
        uploadedAt: new Date().toISOString(),
      };
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, attachments: [...c.attachments, localAttachment], updatedAt: new Date().toISOString() }
            : c
        )
      );
    }
  }, [currentUser.id]);

  // Ek Sil
  const deleteAttachment = useCallback((caseId: string, attachmentId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, attachments: c.attachments.filter((a) => a.id !== attachmentId), updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  // Aktivite Ekle
  const addActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    const newLog: ActivityLog = {
      ...activity,
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    };
    setActivities((prev) => [newLog, ...prev]);
  }, [currentUser]);

  const value = useMemo<StoreContextType>(
    () => ({
      users,
      currentUser,
      settings,
      cases,
      activities,
      loading,
      error,
      setTheme,
      toggleTheme,
      setCurrentUser,
      addUser,
      deleteUser,
      addCase,
      updateCase,
      deleteCase,
      toggleSubTask,
      addSubTask,
      deleteSubTask,
      addAttachment,
      uploadFileAttachment,
      deleteAttachment,
      addActivity,
      refreshData,
    }),
    [
      users,
      currentUser,
      settings,
      cases,
      activities,
      loading,
      error,
      setTheme,
      toggleTheme,
      setCurrentUser,
      addUser,
      deleteUser,
      addCase,
      updateCase,
      deleteCase,
      toggleSubTask,
      addSubTask,
      deleteSubTask,
      addAttachment,
      uploadFileAttachment,
      deleteAttachment,
      addActivity,
      refreshData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore, bir StoreProvider içerisinde kullanılmalıdır');
  return ctx;
}