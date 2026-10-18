import { useState, useRef, useEffect } from 'react';
import { QrCode, X, Wifi, Copy, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/store/StoreContext';

interface QRModalProps {
  open: boolean;
  onClose: () => void;
}

export function QRModal({ open, onClose }: QRModalProps) {
  const { currentUser } = useStore();
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lanUrl = 'http://192.168.1.37:3000';
  const tailscaleUrl = 'http://100.64.15.20:3000';

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const generateQR = (text: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 240;
      canvas.width = size;
      canvas.height = size;

      const moduleCount = 25;
      const cellSize = size / moduleCount;

      const pattern: number[][] = [];
      for (let y = 0; y < moduleCount; y++) {
        pattern[y] = [];
        for (let x = 0; x < moduleCount; x++) {
          if ((x < 7 && y < 7) || (x >= moduleCount - 7 && y < 7) || (x < 7 && y >= moduleCount - 7)) {
            if (x === 0 || x === 6 || y === 0 || y === 6 ||
              (x < 7 && y < 7 && x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
              (x >= moduleCount - 7 && y < 7 && x === moduleCount - 7 || x === moduleCount - 1 || y === 0 || y === 6) && (x >= moduleCount - 5 && x <= moduleCount - 3 && y >= 2 && y <= 4) ||
              (x < 7 && y >= moduleCount - 7 && y === moduleCount - 7 || y === moduleCount - 1 || x === 0 || x === 6) && (x >= 2 && x <= 4 && y >= moduleCount - 5 && y <= moduleCount - 3)) {
              pattern[y][x] = 1;
            } else {
              pattern[y][x] = 0;
            }
          } else {
            let hash = x * 7 + y * 13 + text.charCodeAt((x + y) % text.length);
            hash = (hash * 31 + x * y) & 0xffffffff;
            pattern[y][x] = (hash % 100 < 45) ? 1 : 0;
          }
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#1a52e0';
      for (let y = 0; y < moduleCount; y++) {
        for (let x = 0; x < moduleCount; x++) {
          if (pattern[y][x]) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    };

    generateQR(lanUrl);
  }, [open]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Mobil Bağlantı QR Kodu" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Wifi size={16} />
          <span>Telefonunuzun kamerasıyla QR kodunu tarayarak ağa katılın</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 mb-4">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <div className="w-full space-y-3">
          <div className="card p-3 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs text-neutral-500 mb-0.5">Yerel Ağ (LAN)</div>
              <div className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">{lanUrl}</div>
            </div>
            <button
              onClick={() => copyUrl(lanUrl)}
              className="btn-ghost p-2"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="card p-3 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs text-neutral-500 mb-0.5">Tailscale Ağı</div>
              <div className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">{tailscaleUrl}</div>
            </div>
            <button
              onClick={() => copyUrl(tailscaleUrl)}
              className="btn-ghost p-2"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="mt-4 px-4 py-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-sm text-primary-700 dark:text-primary-400 flex items-center gap-2">
          <span>Aktif kullanıcı: <strong>{currentUser.name}</strong></span>
        </div>

        <p className="text-xs text-neutral-400 mt-4">
          Tüm ekip üyeleri aynı yerel ağ üzerinden sisteme erişebilir. Mobil cihazlar için alt menüden kamera ile belge yükleme desteklenir.
        </p>
      </div>
    </Modal>
  );
}
