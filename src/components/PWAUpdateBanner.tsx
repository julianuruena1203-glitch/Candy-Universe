import React from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

interface PWAUpdateBannerProps {
  needRefresh: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const PWAUpdateBanner: React.FC<PWAUpdateBannerProps> = ({
  needRefresh,
  onUpdate,
  onDismiss,
}) => {
  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] bg-gradient-to-r from-[#5b15b5] to-[#7c3aed] text-white p-4 rounded-2xl shadow-2xl border border-purple-300/40 animate-in slide-in-from-bottom duration-300 no-print">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">
              Nueva versión disponible
            </h4>
            <p className="text-xs text-purple-100 font-light mt-0.5 leading-snug">
              Se han realizado cambios y mejoras en Candy Universe. Actualiza para ver las últimas novedades.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
          title="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onUpdate}
          className="flex-1 py-2 px-3 bg-white hover:bg-purple-50 text-[#5b15b5] font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0ea5e9]" />
          <span>Actualizar Ahora</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-normal text-xs rounded-xl transition-colors cursor-pointer"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
};
