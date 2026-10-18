import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/store/StoreContext';
import type { CaseType, CaseStatus, PriorityLevel } from '@/types';

interface CaseFormProps {
  open: boolean;
  onClose: () => void;
  editingCaseId?: string | null;
}

const CASE_TYPES: CaseType[] = ['Duruşma', 'İcra', 'Dilekçe Yazımı', 'Keşif', 'Danışmanlık', 'Sulh'];

export function CaseForm({ open, onClose, editingCaseId }: CaseFormProps) {
  const { users, addCase, updateCase, cases } = useStore();
  const editingCase = editingCaseId ? cases.find((c) => c.id === editingCaseId) : null;

  const [formData, setFormData] = useState({
    caseNumber: '',
    folioNumber: '',
    title: '',
    clientName: '',
    caseType: 'Duruşma' as CaseType,
    status: 'aktif' as CaseStatus,
    assignedTo: [] as string[],
    targetDate: '',
    strictDate: '',
    priority: 'normal' as PriorityLevel,
    description: '',
  });

  useEffect(() => {
    if (editingCase) {
      setFormData({
        caseNumber: editingCase.caseNumber,
        folioNumber: editingCase.folioNumber || '',
        title: editingCase.title,
        clientName: editingCase.clientName,
        caseType: editingCase.caseType,
        status: editingCase.status,
        assignedTo: editingCase.assignedTo,
        targetDate: editingCase.targetDate,
        strictDate: editingCase.strictDate,
        priority: editingCase.priority,
        description: editingCase.description,
      });
    } else {
      setFormData({
        caseNumber: '',
        folioNumber: '',
        title: '',
        clientName: '',
        caseType: 'Duruşma',
        status: 'aktif',
        assignedTo: [],
        targetDate: '',
        strictDate: '',
        priority: 'normal',
        description: '',
      });
    }
  }, [editingCase, open]);

  const handleSubmit = () => {
    if (!formData.caseNumber.trim() || !formData.title.trim() || !formData.clientName.trim()) return;
    if (!formData.strictDate) return;

    const data = {
      ...formData,
      targetDate: formData.targetDate || formData.strictDate,
      assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo : [users[0].id],
    };

    if (editingCase) {
      updateCase(editingCase.id, data);
    } else {
      addCase(data);
    }
    onClose();
  };

  const toggleAssignee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }));
  };

  const isValid = !!(formData.caseNumber.trim() && formData.title.trim() && formData.clientName.trim() && formData.strictDate);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingCase ? 'Dosyayı Düzenle' : 'Yeni Dosya Oluştur'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Esas No *
            </label>
            <input
              type="text"
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              placeholder="örn: 2026/142 E."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Föy Numarası
            </label>
            <input
              type="text"
              value={formData.folioNumber}
              onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
              placeholder="örn: F-0142"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Müvekkil Adı *
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="örn: Ahmet Yılmaz"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Dosya Başlığı *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="örn: Cevap Dilekçesi Sunulması"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Dosya Türü
            </label>
            <select
              value={formData.caseType}
              onChange={(e) => setFormData({ ...formData, caseType: e.target.value as CaseType })}
              className="input-field"
            >
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStatus })}
              className="input-field"
            >
              <option value="aktif">Aktif</option>
              <option value="beklemede">Beklemede</option>
              <option value="kapali">Kapalı</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Öncelik
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
              className="input-field"
            >
              <option value="critical">Kesin Tarih</option>
              <option value="warning">Yaklaşan Tarih</option>
              <option value="normal">Hedef Tarih</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Hedef Tarih
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Kesin Tarih (Yasal Süre) *
            </label>
            <input
              type="date"
              value={formData.strictDate}
              onChange={(e) => setFormData({ ...formData, strictDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Atanan Kişiler
          </label>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => toggleAssignee(u.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  formData.assignedTo.includes(u.id)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <div className={`w-5 h-5 rounded ${u.color} text-white text-[9px] font-bold flex items-center justify-center`}>
                  {u.avatar}
                </div>
                {u.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Dosya ile ilgili detaylar, notlar..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button onClick={onClose} className="btn-secondary">
            İptal
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={!isValid}>
            {editingCase ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
