import React, { useState, useEffect } from 'react';
import { INITIAL_LOCALES } from './data/mockLocales';
import { LocalTenant } from './types';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Header } from './components/Header';
import { LocalCard } from './components/LocalCard';
import { LocalCartaView } from './components/LocalCartaView';
import { CartDrawer } from './components/CartDrawer';
import { OrdersView } from './components/OrdersView';
import { NotificationsCenter } from './components/NotificationsCenter';
import { UserProfileView } from './components/UserProfileView';
import { AdminPanel } from './components/AdminPanel';
import { OwnerPortal } from './components/OwnerPortal';
import { BottomNav, NavTab } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LocationPickerModal } from './components/LocationPickerModal';
import { LiveOrderTrackerModal } from './components/LiveOrderTrackerModal';
import { LargeReceiptModal } from './components/LargeReceiptModal';
import { LargeReceiptModal } from './components/LargeReceiptModal';
import { Search, Utensils, Store } from 'lucide-react';

function AppContent() {
  const {
    activeTrackingOrder,
    setActiveTrackingOrder,
    completedReceiptOrder,
    setCompletedReceiptOrder,
  } = useCart();
  const [locales, setLocales] = useState<LocalTenant[]>(INITIAL_LOCALES);
  const [selectedLocal, setSelectedLocal] = useState<LocalTenant | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDeviceFrame, setIsDeviceFrame] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Todas');

  // Locales loaded from mock on mount

  // Distinct cuisines list
  const cuisines = ['Todas', ...Array.from(new Set(locales.map((l) => l.cuisine)))];

  // Filter locales
  const filteredLocales = locales.filter((loc) => {
    const matchesCuisine = selectedCuisine === 'Todas' || loc.cuisine === selectedCuisine;
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.products.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCuisine && matchesSearch;
  });

  const handleSelectLocal = (local: LocalTenant) => {
    setSelectedLocal(local);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLocales = () => {
    setSelectedLocal(null);
  };

  const handleGoHome = () => {
    setSelectedLocal(null);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToStoreFromCart = (storeId: string) => {
    const targetStore = locales.find((l) => l.id === storeId);
    if (targetStore) {
      setSelectedLocal(targetStore);
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start items-center ${
        isDeviceFrame ? 'py-4 sm:py-8 bg-slate-900/60' : ''
      }`}
    >
      <OfflineIndicator />

      {/* Main Container - Mobile First Frame or Full Screen */}
      <div
        className={`w-full flex flex-col bg-slate-950 relative overflow-hidden transition-all duration-300 ${
          isDeviceFrame
            ? 'max-w-md min-h-[844px] rounded-[42px] border-[10px] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10'
            : 'max-w-lg min-h-screen'
        }`}
      >
        {/* Device Notch Simulation (only when device frame mode is active) */}
        {isDeviceFrame && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-3 border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-slate-950" />
          </div>
        )}

        {/* Global Top App Header */}
        <Header
          onOpenNotifications={() => {
            setSelectedLocal(null);
            setActiveTab('notifications');
          }}
          onOpenLocationPicker={() => setIsLocationModalOpen(true)}
          onOpenProfile={() => {
            setSelectedLocal(null);
            setActiveTab('profile');
          }}
          isDeviceFrame={isDeviceFrame}
          onToggleDeviceFrame={() => setIsDeviceFrame((v) => !v)}
          onGoHome={handleGoHome}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 w-full flex flex-col">
          {selectedLocal ? (
            /* Individual Local Tenant Carta View - Dentro están todos sus platos */
            <LocalCartaView
              local={selectedLocal}
              onBack={handleBackToLocales}
              onOpenCart={() => setIsCartOpen(true)}
              onSwitchStore={(store) => setSelectedLocal(store)}
            />
          ) : (
            /* Tabs Navigation */
            <>
              {activeTab === 'home' && (
                <div className="pb-safe space-y-4 pt-1">
                  {/* PWA In-App Install Banner */}
                  <PWAInstallBanner />

                  {/* Cartas de Locales - Sección Principal */}
                  <div className="px-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-orange-400" />
                        <div>
                          <h2 className="text-sm font-black text-white uppercase tracking-wider">
                            Cartas de Locales ({filteredLocales.length})
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            Pulsa sobre una carta para ver sus platos de comida
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-orange-400 font-bold">Menú Digital</span>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar hamburguesas, perros, pinchos, batidos, cachapas..."
                        className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
                      />
                    </div>

                    {/* Cuisine Filter Pills with Emojis */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {cuisines.map((c) => {
                        const emoji =
                          c === 'Hamburguesas'
                            ? '🍔'
                            : c === 'Perro caliente'
                            ? '🌭'
                            : c === 'Pinchos'
                            ? '🍢'
                            : c === 'Batidos'
                            ? '🥤'
                            : c === 'Cachapas'
                            ? '🌽'
                            : c === 'Arroz chino'
                            ? '🥡'
                            : '🍽️';

                        return (
                          <button
                            key={c}
                            onClick={() => setSelectedCuisine(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                              selectedCuisine === c
                                ? 'bg-orange-600 text-white shadow-md shadow-orange-950/40'
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{c}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Cartas List - Aparecen Solas sin plato estrella adjunto ni estrellas artificiales */}
                    {filteredLocales.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-4">
                        <Utensils className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs font-semibold">No se encontraron cartas de locales.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredLocales.map((local) => (
                          <LocalCard
                            key={local.id}
                            local={local}
                            onSelect={handleSelectLocal}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <OrdersView onExploreLocales={() => setActiveTab('home')} />
              )}

              {activeTab === 'profile' && (
                <UserProfileView
                  onOpenOrderTracking={(order) => setActiveTrackingOrder(order)}
                  onExploreCartas={() => setActiveTab('home')}
                  onOpenAdminPanel={() => setActiveTab('admin')}
                  onOpenOwnerPortal={() => setActiveTab('owner')}
                />
              )}

              {activeTab === 'admin' && (
                <AdminPanel
                  locales={locales}
                  onUpdateLocales={(updated) => setLocales(updated)}
                  onOpenReceipt={(order) => setCompletedReceiptOrder(order)}
                />
              )}

              {activeTab === 'owner' && (
                <OwnerPortal
                  locales={locales}
                  onUpdateLocales={(updated) => setLocales(updated)}
                  onOpenReceipt={(order) => setCompletedReceiptOrder(order)}
                />
              )}

              {activeTab === 'notifications' && <NotificationsCenter />}
            </>
          )}
        </main>

        {/* Global Multi-Store Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onOrderCompleted={() => {
            setSelectedLocal(null);
            setActiveTab('profile');
          }}
          onNavigateToStore={handleNavigateToStoreFromCart}
        />

        {/* Location Picker Modal */}
        <LocationPickerModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
        />

        {/* Live Order Tracker Modal */}
        <LiveOrderTrackerModal
          order={activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
        />

        {/* Large Receipt Modal upon order or payment reception */}
        <LargeReceiptModal
          order={completedReceiptOrder}
          onClose={() => setCompletedReceiptOrder(null)}
          onOpenTracking={(order) => {
            setCompletedReceiptOrder(null);
            setActiveTrackingOrder(order);
          }}
        />



        {/* Native Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedLocal(null);
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => setIsCartOpen(true)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
