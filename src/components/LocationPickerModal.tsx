import React, { useState } from 'react';
import { X, MapPin, Home, Briefcase, Utensils, Check, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ADDRESSES = [
  { id: 'addr-1', label: 'Casa', address: 'Calle Mayor 42, 3ºB, Centro', icon: Home },
  { id: 'addr-2', label: 'Oficina / Trabajo', address: 'Paseo de la Castellana 80, Planta 4', icon: Briefcase },
  { id: 'addr-3', label: 'En el Restaurante', address: 'Mesa 4 (Salón Principal)', icon: Utensils },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { currentAddress, setCurrentAddress } = useCart();
  const [customAddress, setCustomAddress] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (addr: string) => {
    setCurrentAddress(addr);
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
      handleSelect(customAddress.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Handle for drag down look */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mt-3 sm:hidden" />

        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">¿Dónde te lo entregamos?</h3>
              <p className="text-[11px] text-slate-400">Selecciona o introduce tu dirección</p>
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

        <div className="p-4 space-y-2.5">
          {PRESET_ADDRESSES.map((item) => {
            const Icon = item.icon;
            const isSelected = currentAddress === item.address;

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item.address)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-orange-950/40 border-orange-500/80 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
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
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}

          {showCustomInput ? (
            <form onSubmit={handleCustomSubmit} className="pt-2 space-y-2">
              <input
                type="text"
                autoFocus
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Escribe calle, número, piso o mesa..."
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
                  Guardar y Usar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-700 hover:border-orange-500 text-slate-400 hover:text-orange-400 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir otra dirección o mesa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
