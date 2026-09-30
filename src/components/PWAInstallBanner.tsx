import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Suppress if already running in standalone mode or dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  // If in compact mode (e.g. inside header)
  if (compact) {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-95 transition"
          aria-label="Instalar App PWA"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 active:scale-95 transition"
            aria-label="Instalar en iPhone"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Instalar PWA</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-orange-400">📱</span> Instalar en iOS Safari
                  </h3>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-orange-400">
                      <Share className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">1. Pulsa Compartir</p>
                      <p className="text-xs text-slate-400">Toca el botón compartir en la barra inferior de Safari.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-orange-400">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">2. Añadir a pantalla de inicio</p>
                      <p className="text-xs text-slate-400">Desplázate hacia abajo y selecciona "Añadir a pantalla de inicio".</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full rounded-xl bg-orange-600 hover:bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg transition"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  }

  // Full banner representation (e.g. for homepage)
  return (
    <div className="relative mx-4 my-3 rounded-2xl bg-gradient-to-r from-orange-600/20 via-amber-600/15 to-orange-500/10 border border-orange-500/30 p-3.5 backdrop-blur-md shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Instalar App</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Accede a las cartas sin conexión a internet y recibe alertas push de pedidos.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1"
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {isInstallable && (
          <button
            onClick={install}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-2 px-3 text-xs font-bold shadow-md active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar en el dispositivo</span>
          </button>
        )}

        {isIOS && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 py-2 px-3 text-xs font-semibold active:scale-95 transition"
          >
            <Share className="w-3.5 h-3.5 text-orange-400" />
            <span>Instalar en iOS</span>
          </button>
        )}

        {!isInstallable && !isIOS && (
          <div className="text-[11px] text-slate-400 italic">
            Compatible con Chrome, Edge y Safari como app de escritorio o móvil.
          </div>
        )}
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-orange-400">📱</span> Instalar en iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-orange-400">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">1. Pulsa Compartir</p>
                  <p className="text-xs text-slate-400">En la barra de herramientas de Safari (abajo en iPhone).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-orange-400">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">2. Añadir a pantalla de inicio</p>
                  <p className="text-xs text-slate-400">Aparecerá el icono en tu pantalla como una app.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-orange-600 hover:bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
