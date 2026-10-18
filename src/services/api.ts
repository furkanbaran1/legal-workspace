import { Case, User, ActivityLog } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Token'ı localStorage'dan alma yardımcısı
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // 1. Giriş Yap (Login)
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Giriş yapılamadı.');
    }
    return res.json(); // { token, user } döner
  },

  // 2. Kullanıcıları Getir
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Kullanıcılar alınamadı.');
    return res.json();
  },

  // 3. Yeni Kullanıcı Ekle (Admin / Dev yetkisi gerekir)
  createUser: async (userData: { username: string; password?: string; name: string; role: string; color?: string }) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kullanıcı oluşturulamadı.');
    }
    return res.json();
  },

  // 4. Kullanıcı Sil (Admin / Dev yetkisi gerekir)
  deleteUser: async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Kullanıcı silinemedi.');
    }
    return res.json();
  },

  // 5. Dosyaları/Davaları Getir
  getCases: async (): Promise<Case[]> => {
    const res = await fetch(`${API_BASE_URL}/cases`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Davalar çekilemedi.');
    return res.json();
  },

  // 6. Yeni Dava/Dosya Oluştur
  createCase: async (caseData: Partial<Case>): Promise<Case> => {
    const res = await fetch(`${API_BASE_URL}/cases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(caseData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Dava dosyası oluşturulamadı.');
    }
    return res.json();
  },

  // 7. Dava Güncelle (Örn: Alt görev tamamlama, durum değiştirme)
  updateCase: async (caseId: string, caseData: Partial<Case>): Promise<Case> => {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(caseData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Dava güncellenemedi.');
    }
    return res.json();
  },

  // 8. Dava Sil
  deleteCase: async (caseId: string) => {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Dava silinemedi.');
    }
    return res.json();
  },

  // 9. Dosya / Fotoğraf Yükle (Mobil Kamera & PDF)
  uploadAttachment: async (caseId: string, file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/attachments`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Dosya yüklenemedi.');
    return res.json();
  },

  // 10. Aktivite Kayıtlarını Getir
  getActivities: async (): Promise<ActivityLog[]> => {
    const res = await fetch(`${API_BASE_URL}/activities`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Aktivite logları alınamadı.');
    return res.json();
  },
};