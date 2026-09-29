import React from 'react';
import { Store, Layers, ShoppingBag, Package, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';

export type NavTab = 'home' | 'cartas' | 'cart' | 'orders' | 'notifications';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenCart,
}) => {
  const { cartCount, unreadCount, orders } = useCart();

  const handleTabClick = (tab: NavTab) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }
    if (tab === 'cart') {
      onOpenCart();
    } else {
      onSelectTab(tab);
    }
  };

  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Locales',
      icon: Store,
    },
    {
      id: 'cartas' as NavTab,
      label: 'Cartas',
      icon: Layers,
    },
    {
      id: 'cart' as NavTab,
      label: 'Carrito',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'orders' as NavTab,
      label: 'Pedidos',
      icon: Package,
      badge: orders.length > 0 ? orders.length : undefined,
      badgeColor: 'bg-slate-700',
    },
    {
      id: 'notifications' as NavTab,
      label: 'Alertas',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-red-500',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-2xl transition-all">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-90 ${
                isActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[10px] font-black text-white shadow-md ${
                      item.badgeColor || 'bg-orange-600'
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold tracking-tight transition-colors ${
                  isActive ? 'text-orange-400 font-bold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 absolute -bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
