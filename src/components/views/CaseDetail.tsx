import { useState, useRef } from 'react';
import {
  ArrowLeft, Plus, Trash2, Check, Clock, Calendar, Users, FileText,
  Paperclip, Camera, Image as ImageIcon, File as FileIcon, Download,
  AlertCircle, CheckCircle2, Circle, User as UserIcon, Shield
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import {
  getCountdownLabel, getCaseTypeColor, getStatusLabel, getPriorityLabel,
  formatDate, formatDateTime, formatFileSize, getFileIcon, getUserById,
  getCompletedSubTaskCount, getProgressPercent, getUserNames
} from '@/utils/helpers';
import { Modal } from '@/components/ui/Modal';
import type { CaseType, CaseStatus, PriorityLevel } from '@/types';

interface CaseDetailProps {
  caseId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function CaseDetail({ caseId, onBack, onEdit }: CaseDetailProps) {
  const { cases, users, currentUser, toggleSubTask, addSubTask, deleteSubTask, addAttachment, deleteAttachment, deleteCase } = useStore();
  const caseItem = cases.find((c) => c.id === caseId);

  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskAssignee, setNewSubTaskAssignee] = useState(users[0]?.id || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!caseItem) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Dosya bulunamadı.</p>
        <button onClick={onBack} className="btn-secondary mt-4">Geri Dön</button>
      </div>
    );
  }

  const countdown = getCountdownLabel(caseItem.strictDate);
  const progress = getProgressPercent(caseItem);
  const completed = getCompletedSubTaskCount(caseItem);

  // Yönetici veya Geliştirici kontrolü[cite: 7]
  const userRoleStr = currentUser.role as string;
  const isAdminOrDev = userRoleStr === 'admin' || userRoleStr === 'developer';

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

  const handleAddSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    addSubTask(caseItem.id, newSubTaskTitle.trim(), newSubTaskAssignee);
    setNewSubTaskTitle('');
    setShowAddSubTask(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        addAttachment(caseItem.id, {
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          uploadedBy: currentUser.id,
          uploadedAt: new Date().toISOString(),
          dataUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const renderFileIcon = (fileType: string) => {
    const icon = getFileIcon(fileType);
    switch (icon) {
      case 'image': return <ImageIcon size={18} className="text-sky-500" />;
      case 'pdf': return <FileText size={18} className="text-red-500" />;
      case 'doc': return <FileText size={18} className="text-blue-500" />;
      default: return <FileIcon size={18} className="text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <ArrowLeft size={16} />
        Dosya Listesine Dön
      </button>

      {/* Case header */}
      <div className="card p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-sm text-neutral-500">{caseItem.caseNumber}</span>
              {caseItem.folioNumber && (
                <span className="font-mono text-sm text-neutral-500">
                  Föy: {caseItem.folioNumber}
                </span>
              )}
              <span className={`badge ${getCaseTypeColor(caseItem.caseType)}`}>{caseItem.caseType}</span>
              <span className={`badge ${statusColors[caseItem.status]}`}>{getStatusLabel(caseItem.status)}</span>
              <span className={`badge ${priorityColors[caseItem.priority]}`}>{getPriorityLabel(caseItem.priority)}</span>
            </div>
            <h1 className="font-display font-bold text-xl lg:text-2xl text-neutral-900 dark:text-neutral-100 mb-2">
              {caseItem.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              <Users size={16} className="text-neutral-400" />
              <span>Müvekkil: <strong>{caseItem.clientName}</strong></span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={onEdit} className="btn-secondary text-xs px-3 py-2">
              Düzenle
            </button>
          </div>
        </div>

        {/* Description */}
        {caseItem.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            {caseItem.description}
          </p>
        )}

        {/* Date cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <Calendar size={14} /> Hedef Tarih
            </div>
            <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {formatDate(caseItem.targetDate)}
            </div>
          </div>
          <div className={`rounded-xl p-4 border-2 ${
            countdown.level === 'overdue' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' :
            countdown.level === 'critical' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' :
            countdown.level === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' :
            'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
          }`}>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <AlertCircle size={14} /> Kesin Tarih (Yasal Süre)
            </div>
            <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {formatDate(caseItem.strictDate)}
            </div>
            <div className={`text-xs font-medium mt-1 ${
              countdown.level === 'overdue' ? 'text-red-600 dark:text-red-400' :
              countdown.level === 'critical' ? 'text-red-600 dark:text-red-400' :
              countdown.level === 'warning' ? 'text-amber-600 dark:text-amber-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`}>
              {countdown.text}
            </div>
          </div>
        </div>

        {/* Progress */}
        {caseItem.subTasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">İlerleme</span>
              <span className="text-sm font-medium text-neutral-500">{completed}/{caseItem.subTasks.length} tamamlandı</span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
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

        {/* Assigned team */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-xs text-neutral-500">Atanan Kişiler:</span>
          <div className="flex -space-x-2">
            {caseItem.assignedTo.map((uid) => {
              const user = getUserById(users, uid);
              if (!user) return null;
              return (
                <div
                  key={uid}
                  className={`w-7 h-7 rounded-full ${user.color} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-neutral-900`}
                  title={user.name}
                >
                  {user.avatar}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-neutral-500">{getUserNames(users, caseItem.assignedTo)}</span>
        </div>
      </div>

      {/* Sub-tasks */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary-500" />
            Alt Görevler ({completed}/{caseItem.subTasks.length})
          </h2>
          <button onClick={() => setShowAddSubTask(true)} className="btn-ghost text-xs">
            <Plus size={14} /> Görev Ekle
          </button>
        </div>

        {caseItem.subTasks.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-400">
            Henüz alt görev eklenmemiş.
          </div>
        ) : (
          <div className="space-y-2">
            {caseItem.subTasks.map((subTask) => {
              const assignee = getUserById(users, subTask.assignedTo);
              return (
                <div
                  key={subTask.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    subTask.completed
                      ? 'bg-emerald-50 dark:bg-emerald-500/5'
                      : 'bg-neutral-50 dark:bg-neutral-800/50'
                  }`}
                >
                  <button
                    onClick={() => toggleSubTask(caseItem.id, subTask.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      subTask.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500'
                    }`}
                  >
                    {subTask.completed && <Check size={14} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${
                      subTask.completed
                        ? 'text-neutral-400 line-through'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      {subTask.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                      {assignee && (
                        <>
                          <div className={`w-4 h-4 rounded ${assignee.color} text-white text-[8px] font-bold flex items-center justify-center`}>
                            {assignee.avatar}
                          </div>
                          <span>{assignee.name}</span>
                        </>
                      )}
                      {subTask.completed && subTask.completedAt && (
                        <span className="text-emerald-500">• {formatDateTime(subTask.completedAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Sadece Yönetici ve Geliştirici alt görev silebilir[cite: 7, 8] */}
                  {isAdminOrDev && (
                    <button
                      onClick={() => deleteSubTask(caseItem.id, subTask.id)}
                      className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
                      title="Alt Görevi Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Paperclip size={18} className="text-primary-500" />
            Dosya & Ekler ({caseItem.attachments.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="btn-secondary text-xs px-3 py-2"
            >
              <Camera size={14} />
              <span className="hidden sm:inline">Kamera</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary text-xs px-3 py-2"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Dosya Yükle</span>
            </button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {caseItem.attachments.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-400">
            <Paperclip size={28} className="mx-auto mb-2 opacity-40" />
            Henüz dosya eklenmemiş. PDF, resim veya kamera ile belge yükleyebilirsiniz.
          </div>
        ) : (
          <div className="space-y-2">
            {caseItem.attachments.map((att) => {
              const uploader = getUserById(users, att.uploadedBy);
              // Eki yükleyen kişi VEYA Yönetici/Geliştirici silebilir
              const canDeleteAttachment = att.uploadedBy === currentUser.id || isAdminOrDev;

              return (
                <div
                  key={att.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center flex-shrink-0">
                    {renderFileIcon(att.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {att.fileName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                      <span>{formatFileSize(att.fileSize)}</span>
                      <span>•</span>
                      <span>{uploader?.name || 'Bilinmeyen'}</span>
                      <span>•</span>
                      <span>{formatDateTime(att.uploadedAt)}</span>
                    </div>
                  </div>
                  {att.dataUrl && (
                    <a
                      href={att.dataUrl}
                      download={att.fileName}
                      className="p-2 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                    >
                      <Download size={16} />
                    </a>
                  )}
                  {canDeleteAttachment && (
                    <button
                      onClick={() => deleteAttachment(caseItem.id, att.id)}
                      className="p-2 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Eki Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete section (Sadece Admin ve Developer görebilir)[cite: 7] */}
      {isAdminOrDev && (
        <div className="card p-5 border-red-200 dark:border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Dosyayı Sil</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Bu işlem geri alınamaz (Yalnızca Yönetici / Geliştirici).</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={16} /> Sil
            </button>
          </div>
        </div>
      )}

      {/* Add SubTask Modal */}
      <Modal
        open={showAddSubTask}
        onClose={() => setShowAddSubTask(false)}
        title="Alt Görev Ekle"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Görev Adı
            </label>
            <input
              type="text"
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
              placeholder="örn: Tebligat kayıtlarını kontrol et"
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Atanan Kişi
            </label>
            <select
              value={newSubTaskAssignee}
              onChange={(e) => setNewSubTaskAssignee(e.target.value)}
              className="input-field"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowAddSubTask(false)} className="btn-secondary">
              İptal
            </button>
            <button onClick={handleAddSubTask} className="btn-primary" disabled={!newSubTaskTitle.trim()}>
              Ekle
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Dosyayı Sil"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
            <strong>{caseItem.title}</strong> ({caseItem.caseNumber}) dosyasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
              İptal
            </button>
            <button
              onClick={() => {
                deleteCase(caseItem.id);
                onBack();
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