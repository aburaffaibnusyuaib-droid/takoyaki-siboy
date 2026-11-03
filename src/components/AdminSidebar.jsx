'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  X, Store, LayoutDashboard, ChefHat, ClipboardList, 
  Settings2, Tag, LogOut, Ticket 
} from 'lucide-react';

export default function AdminSidebar({ isOpen, setIsOpen, onOpenSettings }) {
  const router = useRouter();
  const pathname = usePathname();

  // State untuk menghitung badge dinamis
  const [kitchenStats, setKitchenStats] = useState({
    waiting: 0,
    cooking: 0,
    totalActive: 0
  });

  // Baca data localStorage secara real-time
  useEffect(() => {
    const syncKitchenData = () => {
      try {
        const rawData = localStorage.getItem('siboy_kitchen_orders');
        if (!rawData) {
          setKitchenStats({ waiting: 0, cooking: 0, totalActive: 0 });
          return;
        }

        const orders = JSON.parse(rawData);
        if (Array.isArray(orders)) {
          const waiting = orders.filter(o => o.status === 'waiting_verification').length;
          const pending = orders.filter(o => o.status === 'pending').length;
          const cooking = orders.filter(o => o.status === 'cooking').length;

          setKitchenStats({
            waiting,
            cooking,
            totalActive: waiting + pending + cooking
          });
        }
      } catch (err) {
        setKitchenStats({ waiting: 0, cooking: 0, totalActive: 0 });
      }
    };

    syncKitchenData();

    // Listener saat KitchenView update data lewat storage event
    window.addEventListener('storage', syncKitchenData);
    // Interval fallback agar angka selalu sinkron antar-tab/komponen
    const interval = setInterval(syncKitchenData, 1000);

    return () => {
      window.removeEventListener('storage', syncKitchenData);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/');
  };

  if (!isOpen) return null;

  const getHeaderTheme = () => {
    if (pathname.startsWith('/admin/kitchen')) {
      return {
        box: 'bg-amber-500 text-white border-amber-500 shadow-amber-500/30',
        badge: 'KDS DAPUR AKTIF',
        icon: <ChefHat className="w-5 h-5" />
      };
    }
    if (pathname.startsWith('/admin/pos')) {
      return {
        box: 'bg-slate-900 text-white border-slate-800 shadow-slate-900/30',
        badge: 'TERMINAL KASIR',
        icon: <Store className="w-5 h-5" />
      };
    }
    if (pathname.startsWith('/admin/orders')) {
      return {
        box: 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-600/30',
        badge: 'RIWAYAT ORDER',
        icon: <ClipboardList className="w-5 h-5" />
      };
    }
    return {
      box: 'bg-red-600 text-white border-red-700 shadow-red-600/30',
      badge: 'GEROBAK DIGITAL',
      icon: <Store className="w-5 h-5" />
    };
  };

  const theme = getHeaderTheme();

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity cursor-pointer" 
        onClick={() => setIsOpen(false)} 
      />

      <div className={`relative w-[280px] max-w-[85vw] bg-[#fdfcf9] h-full shadow-2xl z-10 transform transition-transform duration-300 ease-out flex flex-col border-r border-slate-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Header Dinamis */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md transition-all duration-300 ${theme.box}`}>
              {theme.icon}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-slate-800 tracking-tight leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SIBOY<span className="text-amber-500">POS</span>
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{theme.badge}</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setIsOpen(false)} 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/60 hover:border-red-100 transition-all cursor-pointer active:scale-95 shadow-sm"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Menu Navigasi Utama */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-3">Navigasi Utama</p>
          
          {/* 1. Dashboard */}
          <button 
            type="button"
            onClick={() => { setIsOpen(false); router.push('/admin'); }} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              pathname === '/admin' 
                ? 'bg-red-600 text-white font-black shadow-[0_4px_20px_rgba(220,38,38,0.3)]' 
                : 'text-slate-600 hover:bg-red-50 hover:text-red-600 group'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${pathname === '/admin' ? 'text-white' : 'text-slate-400 group-hover:text-red-500'} transition-colors`} /> 
            Dashboard
          </button>

          {/* 2. Kasir (POS) */}
          <button 
            type="button"
            onClick={() => { setIsOpen(false); router.push('/admin/pos'); }} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              pathname.startsWith('/admin/pos') 
                ? 'bg-slate-900 text-white font-black shadow-[0_4px_20px_rgba(15,23,42,0.35)]' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 group'
            }`}
          >
            <Store className={`w-5 h-5 ${pathname.startsWith('/admin/pos') ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} transition-colors`} /> 
            Kasir (POS)
          </button>
          
          {/* 3. Kitchen View - DINAMIS BADGE */}
          <button 
            type="button"
            onClick={() => { setIsOpen(false); router.push('/admin/kitchen'); }} 
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              pathname.startsWith('/admin/kitchen') 
                ? 'bg-amber-500 text-white font-black shadow-[0_4px_20px_rgba(245,158,11,0.35)]' 
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-600 group'
            }`}
          >
            <div className="flex items-center gap-3">
              <ChefHat className={`w-5 h-5 ${pathname.startsWith('/admin/kitchen') ? 'text-white' : 'text-slate-400 group-hover:text-amber-500'} transition-colors`} /> 
              Kitchen View
            </div>

            {/* Render Badge hanya jika totalActive > 0 */}
            {kitchenStats.totalActive > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/admin/kitchen')
                  ? 'bg-white text-amber-900 border-white/50 shadow-sm'
                  : kitchenStats.waiting > 0
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm animate-pulse'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {kitchenStats.waiting > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                )}
                {kitchenStats.waiting > 0 
                  ? `${kitchenStats.waiting} Perlu Verif` 
                  : `${kitchenStats.totalActive} Antre`}
              </span>
            )}
          </button>

          {/* 4. Order History */}
          <button 
            type="button"
            onClick={() => { setIsOpen(false); router.push('/admin/orders'); }} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              pathname.startsWith('/admin/orders') 
                ? 'bg-indigo-600 text-white font-black shadow-[0_4px_20px_rgba(79,70,229,0.35)]' 
                : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 group'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${pathname.startsWith('/admin/orders') ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`} /> 
            Order History
          </button>

          {/* 5. Demo Karcis HP */}
          <button 
            type="button"
            onClick={() => { setIsOpen(false); window.open('/ticket', '_blank'); }} 
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 font-bold text-sm transition-all cursor-pointer group mt-2 border border-transparent hover:border-emerald-100"
          >
            <Ticket className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" /> 
            Demo Karcis HP
          </button>
        </div>

        {/* Footer Sidebar */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
          {onOpenSettings && (
            <button 
              type="button"
              onClick={() => { setIsOpen(false); onOpenSettings(); }} 
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
            >
              <Tag className="w-4 h-4" /> Atur Harga Menu
            </button>
          )}
          <button 
            type="button"
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-transparent border border-transparent text-slate-500 hover:bg-red-50 hover:border-red-100 hover:text-red-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar Akun
          </button>
        </div>

      </div>
    </div>
  );
}