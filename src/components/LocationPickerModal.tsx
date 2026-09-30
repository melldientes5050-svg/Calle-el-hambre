import React, { useState } from 'react';
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Utensils,
  Check,
  Plus,
  Navigation,
  Compass,
  AlertCircle,
  Crosshair,
  Radar
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { LocationCoordinates } from '../types';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ADDRESSES = [
  { id: 'addr-1', label: 'Mi Casa', address: 'Av. Las Palmas, Edif. Ávila, Apto 4-B', icon: Home },
  { id: 'addr-2', label: 'Oficina / Trabajo', address: 'Torre Empresarial Centro, Piso 5', icon: Briefcase },
  { id: 'addr-3', label: 'En Mesa del Local', address: 'Mesa 4 (Terraza)', icon: Utensils },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { currentAddress, currentCoordinates, setCurrentLocation } = useCart();
  const [customAddress, setCustomAddress] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<LocationCoordinates | null>(currentCoordinates);

  if (!isOpen) return null;

  // Real-time GPS location finder
  const handleGetLiveLocation = () => {
    setGpsError(null);
    setIsLocating(true);

    if (!('geolocation' in navigator)) {
      setGpsError('La geolocalización no está soportada por este navegador o dispositivo.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords: LocationCoordinates = {
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          label: `GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
        };

        setDetectedCoords(coords);
        const resolvedAddress = `Punto GPS Exacto (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) • Precisión: ±${Math.round(accuracy)}m`;
        setCurrentLocation(resolvedAddress, coords);
        setIsLocating(false);

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([40, 60, 40]);
          } catch {
            // ignore
          }
        }

        setTimeout(() => {
          onClose();
        }, 800);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Permiso de ubicación denegado. Activa los permisos de ubicación en tu navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('La señal GPS no está disponible en este momento.');
            break;
          case error.TIMEOUT:
            setGpsError('Tiempo de espera agotado al obtener la ubicación GPS.');
            break;
          default:
            setGpsError('No se pudo determinar el punto GPS exacto.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelect = (addr: string, coords?: LocationCoordinates) => {
    setCurrentLocation(addr, coords);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddress.trim()) {
      handleSelect(customAddress.trim(), detectedCoords || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 flex flex-col max-h-[90vh]">
        {/* Handle for drag down look */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mt-3 sm:hidden" />

        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Punto de Entrega Exacto</h3>
              <p className="text-[11px] text-slate-400">Ubicación en tiempo real por GPS o dirección</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white"
            aria-label="Cerrar selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
          {/* Real-time GPS Detection Button */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-950/60 via-slate-900 to-amber-950/40 border border-orange-500/40 p-3.5 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  GPS en Tiempo Real
                </span>
              </div>
              {detectedCoords && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ±{detectedCoords.accuracy}m precisión
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Detecta tus coordenadas satelitales en vivo para que el repartidor llegue al punto exacto sin perderse.
            </p>

            {detectedCoords && (
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                <span>Lat: {detectedCoords.latitude.toFixed(6)}</span>
                <span>Lng: {detectedCoords.longitude.toFixed(6)}</span>
              </div>
            )}

            <button
              onClick={handleGetLiveLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Radar className="w-4 h-4 animate-spin text-white" />
                  <span>Obteniendo coordenadas satelitales...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-white" />
                  <span>Fijar mi Punto Exacto con GPS</span>
                </>
              )}
            </button>

            {gpsError && (
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-[10px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Current Selection summary */}
          <div className="text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Dirección actual seleccionada:
            </span>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-xs font-semibold truncate">{currentAddress}</span>
            </div>
          </div>

          {/* Preset Addresses */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Puntos Frecuentes
            </span>

            {PRESET_ADDRESSES.map((item) => {
              const Icon = item.icon;
              const isSelected = currentAddress.includes(item.label) || currentAddress === item.address;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.address)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-orange-950/40 border-orange-500/80 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.label}</h4>
                      <p className="text-[11px] text-slate-400">{item.address}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Address Input */}
          {showCustomInput ? (
            <form onSubmit={handleCustomSubmit} className="pt-1 space-y-2">
              <input
                type="text"
                autoFocus
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Escribe calle, referencia, color de reja o casa..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
                >
                  Guardar Punto
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-dashed border-slate-700 hover:border-orange-500 text-slate-400 hover:text-orange-400 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Escribir dirección manual con referencia</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
