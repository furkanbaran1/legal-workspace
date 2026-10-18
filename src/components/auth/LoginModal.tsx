import React, { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { USERS } from '@/data/mockData'; // <-- Doğrudan mockData'dan garantili çekiyoruz
import { Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginModal: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const { setCurrentUser } = useStore();
  
  // Store'u beklememek için doğrudan USERS sabitini kullanıyoruz
  const [selectedUserId, setSelectedUserId] = useState<string>(USERS[4]?.id || 'u_dev');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === '123456' || password === 'admin123456' || password === 'dev123456') {
      setCurrentUser(selectedUserId);
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError('Hatalı şifre! (Demo Şifre: 123456)');
    }
  };

  const selectedUser = USERS.find((u) => u.id === selectedUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Üst Başlık & Logo */}
        <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-700 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Hukuk Dava Otomasyonu</h2>
          <p className="text-sm text-primary-100 mt-1">Lütfen devam etmek için giriş yapın</p>
        </div>

        {/* Form Alanı */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Kullanıcı Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Kullanıcı Hesabı
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()}) {u.role === 'developer' ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parola Girdisi */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Şifrenizi girin..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Demo Şifresi: <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">123456</code></p>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 group"
          >
            <span>Sisteme Giriş Yap</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Rol Detayı */}
        {selectedUser && (
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/50 text-center text-xs text-slate-500">
            Aktif Rol: <span className="font-semibold text-primary-600 dark:text-primary-400 uppercase">{selectedUser.role}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;