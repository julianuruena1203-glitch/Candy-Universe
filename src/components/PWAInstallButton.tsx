import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, CheckCircle2, X, ExternalLink, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'prominent' | 'compact' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // If already running as an installed desktop PWA standalone app
  if (isInstalled) {
    if (variant === 'prominent' || variant === 'settings') {
      return (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-emerald-900">Aplicación de Escritorio Instalada</span>
            <span className="text-[11px] text-emerald-700 font-light">Estás ejecutando el punto de venta en modo de ventana independiente.</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowInstructionsModal(true);
      }
    } else {
      setShowInstructionsModal(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Instalar Candy Universe en el escritorio del ordenador"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] hover:opacity-95 text-white text-xs font-medium shadow-xs shadow-purple-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar en PC</span>
          <span className="sm:hidden">Instalar</span>
        </button>
      )}

      {variant === 'prominent' && (
        <div className="w-full bg-gradient-to-r from-purple-900 via-[#5b15b5] to-[#0284c7] rounded-2xl p-4 text-white shadow-lg shadow-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Monitor className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <span>Instalar Candy Universe en el Escritorio</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-200 text-[10px] font-medium border border-cyan-300/30">
                  PC & Mac
                </span>
              </h4>
              <p className="text-xs text-purple-200/90 font-light mt-0.5">
                Ábrelo como aplicación independiente de escritorio y actualízalo automáticamente cada vez que haya cambios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full sm:w-auto py-2 px-4 bg-white hover:bg-purple-50 text-[#5b15b5] rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <span>Instalar Aplicación</span>
          </button>
        </div>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full py-2.5 px-3 bg-purple-50/80 hover:bg-purple-100/90 border border-purple-200/80 rounded-xl text-xs font-medium text-purple-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Monitor className="w-4 h-4 text-[#6d28d9]" />
          <span>Instalar en el Escritorio de este Ordenador</span>
        </button>
      )}

      {variant === 'settings' && (
        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#6d28d9]" />
              <span className="text-xs font-medium text-purple-950">Acceso de Escritorio (PWA)</span>
            </div>
            <button
              type="button"
              onClick={handleInstallClick}
              className="py-1 px-2.5 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] hover:opacity-95 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3 h-3" />
              <span>Instalar</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-light">
            Instala el punto de venta en tu barra de tareas o escritorio para abrirlo sin barra de navegación y con auto-actualización.
          </p>
        </div>
      )}

      {/* Guided Installation Modal */}
      {showInstructionsModal && (
        <div
          onClick={() => setShowInstructionsModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#0ea5e9] text-white flex items-center justify-center shadow-xs">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                    Instalar en el Escritorio del Ordenador
                  </h3>
                  <p className="text-[11px] text-slate-500 font-light">
                    Candy Universe Punto de Venta (PWA)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-purple-900 hover:bg-purple-50 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Guide */}
            {!isIOS ? (
              <div className="space-y-3.5 text-xs text-slate-600">
                <p className="font-light">
                  Puedes tener el aplicativo de <strong>Candy Universe</strong> directamente en tu escritorio y barra de tareas como un programa nativo de Windows o Mac:
                </p>

                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6d28d9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900 font-medium">Desde Google Chrome o Microsoft Edge:</strong>
                      <p className="text-slate-500 font-light mt-0.5">
                        En la barra de direcciones (arriba a la derecha), haz clic en el icono de <strong>Instalar</strong> (un monitor con flecha o un símbolo <strong>⊕</strong>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2.5 border-t border-purple-100/70">
                    <span className="w-5 h-5 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900 font-medium">O desde el menú de opciones del navegador:</strong>
                      <p className="text-slate-500 font-light mt-0.5">
                        Haz clic en los tres puntos (<strong>⋮</strong>) &gt; <strong>Guardar y compartir</strong> (o "Aplicaciones") &gt; <strong>Instalar Candy Universe</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2.5 border-t border-purple-100/70">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900 font-medium">¿Estás en un panel integrado o vista previa?</strong>
                      <p className="text-slate-500 font-light mt-0.5">
                        Abre el enlace directamente en una ventana completa de tu navegador para que se active la instalación con 1 clic:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={window.location.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6d28d9] hover:bg-[#5b15b5] text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir en Ventana Completa</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 text-purple-900 rounded-xl text-xs font-normal transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#0ea5e9]" />}
                          <span>{copied ? '¡Enlace copiado!' : 'Copiar Enlace'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Update info */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-50 to-purple-50 border border-purple-100 text-purple-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-[#5b15b5]">
                    <RefreshCw className="w-3.5 h-3.5 text-[#0ea5e9]" />
                    <span>Actualizaciones automáticas continuas</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-light">
                    Cada vez que se publique una nueva versión o modificación en la página web, la aplicación en tu ordenador se sincronizará automáticamente mediante el Service Worker y te avisará para recargar al instante sin perder ventas ni datos.
                  </p>
                </div>
              </div>
            ) : (
              /* Content for iOS Safari */
              <div className="space-y-3 text-xs text-slate-600">
                <p className="font-light">
                  Para instalar en iPhone o iPad desde Safari:
                </p>
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6d28d9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-slate-700">
                      Toca el botón <strong>Compartir</strong> (ícono de cuadro con flecha hacia arriba) en la barra de Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 pt-2 border-t border-purple-100/60">
                    <span className="w-5 h-5 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-slate-700">
                      Desliza hacia abajo y presiona <strong>"Agregar al inicio"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-2.5 px-4 bg-purple-100 hover:bg-purple-200 text-[#581c87] font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
