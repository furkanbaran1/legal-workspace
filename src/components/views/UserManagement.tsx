import { useState } from 'react';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { getRoleLabel } from '@/utils/helpers';
import { Modal } from '@/components/ui/Modal';
import type { UserRole } from '@/types';

const ROLE_COLORS: Record<string, string> = {
  avukat: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400',
  stajyer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  sekreter: 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-400',
  admin: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  developer: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
};

const AVATAR_COLORS = [
  'bg-primary-500', 'bg-emerald-500', 'bg-accent-500',
  'bg-rose-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500', 'bg-purple-600',
];

export function UserManagement() {
  const { users, currentUser, addUser, deleteUser, cases } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'avukat' as UserRole,
  });

  const handleAddUser = () => {
    if (!formData.name.trim()) return;
    const initials = formData.name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
    addUser({ name: formData.name.trim(), role: formData.role, avatar: initials, color });
    setFormData({ name: '', role: 'avukat' as UserRole });
    setShowAddForm(false);
  };

  const getUserCaseCount = (userId: string) =>
    cases.filter((c) => c.assignedTo.includes(userId)).length;

  const userRoleStr = currentUser.role as string;
  const hasAccess = userRoleStr === 'admin' || userRoleStr === 'developer';

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <Shield size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
        <h2 className="font-display font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
          Yetkisiz Erişim
        </h2>
        <p className="text-sm text-neutral-500 max-w-sm">
          Bu bölüm yalnızca yönetici veya geliştirici rolüne sahip kullanıcılar içindir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
            Kişi Yönetimi
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Ekip üyelerini ekleyin ve yönetin ({users.length} kişi)
          </p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex-shrink-0">
          <UserPlus size={18} />
          <span className="hidden sm:inline">Kişi Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const caseCount = getUserCaseCount(user.id);
          const isSelf = user.id === currentUser.id;
          const roleStr = user.role as string;
          
          // Güvenlik Kuralı: Admin, developer rolündeki kullanıcıyı silebilir mi? Hayır.
          const isAdminTryingToDeleteDev = userRoleStr === 'admin' && roleStr === 'developer';
          const canDelete = !isSelf && !isAdminTryingToDeleteDev;

          return (
            <div key={user.id} className="card p-5 card-hover">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${user.color} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                    {user.name}
                  </h3>
                  <span className={`badge ${ROLE_COLORS[roleStr] || 'bg-neutral-100 text-neutral-700'} mt-1`}>
                    {getRoleLabel(roleStr)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
                <UserIcon size={14} />
                <span>{caseCount} atanan dosya</span>
                {isSelf && (
                  <span className="ml-auto badge bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
                    Aktif Kullanıcı
                  </span>
                )}
              </div>

              {canDelete ? (
                <button
                  onClick={() => setShowDeleteConfirm(user.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} /> Kullanıcıyı Sil
                </button>
              ) : isAdminTryingToDeleteDev ? (
                <div className="w-full text-center text-xs text-neutral-400 py-2 flex items-center justify-center gap-1.5">
                  <Shield size={12} /> Yönetici geliştiriciyi silemez
                </div>
              ) : (
                <div className="w-full text-center text-xs text-neutral-400 py-2">
                  Aktif kullanıcı silinemez
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kişi Ekle Modal */}
      <Modal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Yeni Kişi Ekle"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Ad Soyad *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              placeholder="örn: Av. Ayşe Demir"
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Rol
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['avukat', 'stajyer', 'sekreter', 'admin', 'developer'] as string[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setFormData({ ...formData, role: r as UserRole })}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    (formData.role as string) === r
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {getRoleLabel(r)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">
              İptal
            </button>
            <button onClick={handleAddUser} className="btn-primary" disabled={!formData.name.trim()}>
              Ekle
            </button>
          </div>
        </div>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal
        open={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="Kullanıcıyı Sil"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
            <strong>{users.find((u) => u.id === showDeleteConfirm)?.name}</strong> kullanıcısını silmek istediğinize emin misiniz?
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary">
              İptal
            </button>
            <button
              onClick={() => {
                if (showDeleteConfirm) deleteUser(showDeleteConfirm);
                setShowDeleteConfirm(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}