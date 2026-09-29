import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, Leaf, Wheat, ShoppingBag } from 'lucide-react';
import { LocalTenant, Product, ProductExtra } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  local: LocalTenant | null;
  onClose: () => void;
  onAdded: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  local,
  onClose,
  onAdded,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [instructions, setInstructions] = useState('');

  if (!product || !local) return null;

  const toggleExtra = (extra: ProductExtra) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const extrasTotal = selectedExtras.reduce((acc, e) => acc + e.price, 0);
  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, local.id, local.name, quantity, selectedExtras, instructions);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700 shadow-lg active:scale-90 transition"
          aria-label="Cerrar detalle"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-950 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

          {/* Local Tenant Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 text-xs text-orange-400 font-bold">
            <span>{local.name}</span>
          </div>

          {/* Dietary tags */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
            {product.vegan && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700">
                <Leaf className="w-3 h-3" /> Vegano
              </span>
            )}
            {product.glutenFree && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-700">
                <Wheat className="w-3 h-3" /> Sin Gluten
              </span>
            )}
            {product.spicy && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-700">
                <Flame className="w-3 h-3" /> Picante
              </span>
            )}
          </div>
        </div>

        {/* Scrollable details & extras */}
        <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-black text-white">{product.name}</h2>
              <span className="text-lg font-black text-orange-400 shrink-0">
                {product.price.toFixed(2)} €
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Extras / Personalización */}
          {product.extras && product.extras.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Ingredientes Extras Opcionales
              </h3>
              <div className="space-y-2">
                {product.extras.map((extra) => {
                  const isChecked = selectedExtras.some((e) => e.id === extra.id);
                  return (
                    <div
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-orange-950/40 border-orange-500/80 text-white'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            isChecked
                              ? 'bg-orange-600 border-orange-500 text-white'
                              : 'border-slate-600 bg-slate-800'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium">{extra.name}</span>
                      </div>
                      <span className="text-xs font-bold text-orange-400">
                        +{extra.price.toFixed(2)} €
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen instructions / notes */}
          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Instrucciones para la cocina (opcional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ej: Sin cebolla, salsa aparte, bien tostado..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
              maxLength={120}
            />
          </div>
        </div>

        {/* Bottom bar with quantity and add to cart */}
        <div className="p-4 bg-slate-950/95 border-t border-slate-800/80 flex items-center gap-3 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 active:scale-95 transition"
              aria-label="Restar unidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-bold text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition"
              aria-label="Sumar unidad"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-[0.98] text-white px-4 py-3 font-bold text-sm shadow-xl shadow-orange-950/50 transition"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Añadir a la Carta</span>
            </span>
            <span>{totalPrice.toFixed(2)} €</span>
          </button>
        </div>
      </div>
    </div>
  );
};
