'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, BellOff, Flame, CheckCircle2, RotateCcw, Clock, Menu,
  Hourglass, Check, X, ChefHat
} from 'lucide-react';

import AdminSidebar from '@/components/AdminSidebar';

export default function KitchenView() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // Tab Switcher untuk Mobile
  const [mobileTab, setMobileTab] = useState('waiting'); // 'waiting' | 'pending' | 'cooking'

  const [orders, setOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastFinishedOrder, setLastFinishedOrder] = useState(null);

  const prevWaitingCountRef = useRef(0);

  // Set Judul Tab Browser Dinamis
  useEffect(() => {
    document.title = 'Kitchen Display (KDS) | Siboy POS';
  }, []);

  // Notifikasi Suara Web Audio API
  const playAlertSound = () => {
    if (!isSoundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // Format payload database Supabase ke format tiket dapur
  const formatDbToKitchen = (dbOrders) => {
    return dbOrders.map((o) => {
      const rawStatus = (o.status || '').toLowerCase();
      let mappedStatus = 'waiting_verification';

      if (rawStatus === 'pending' || rawStatus === 'diproses') {
        mappedStatus = 'pending';
      } else if (rawStatus === 'cooking' || rawStatus === 'dimasak') {
        mappedStatus = 'cooking';
      } else if (rawStatus === 'ready' || rawStatus === 'selesai' || rawStatus === 'siap') {
        mappedStatus = 'ready';
      } else if (rawStatus === 'cancelled' || rawStatus === 'dibatalkan' || rawStatus === 'batal') {
        mappedStatus = 'cancelled';
      } else if (rawStatus === 'waiting_verification' || rawStatus === 'waiting') {
        mappedStatus = 'waiting_verification';
      } else {
        mappedStatus = 'pending';
      }

      const orderTime = o.createdAt
        ? new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';

      // Ekstrak nomor antrean harian [#01], [#02] jika ada di catatan/notes
      let queueBadge = `#${o.id.slice(-3)}`;
      const queueMatch = o.notes?.match(/\[#(.*?)\]/);
      if (queueMatch) {
        queueBadge = `#${queueMatch[1]}`;
      } else if (o.id.startsWith('SB-')) {
        const parts = o.id.split('-');
        queueBadge = `#${parts[parts.length - 1]}`;
      }

      return {
        id: o.id,
        qNo: queueBadge,
        time: orderTime,
        status: mappedStatus,
        customerName: o.customerName || 'Pelanggan',
        notes: o.notes?.replace(/\[#(.*?)\]\s*/, '') || '',
        total: `Rp ${(o.totalPrice || 0).toLocaleString('id-ID')}`,
        pay: (o.notes || '').toUpperCase().includes('QRIS') ? 'QRIS' : 'CASH',
        items: o.items?.map((it) => ({
          name: it.menuName,
          qty: it.quantity,
          price: it.price,
          toppings: it.menuName.includes('(') ? it.menuName.split('(')[1]?.replace(')', '') : 'Polos',
          veg: '',
          spicy: ''
        })) || []
      };
    });
  };

  // Mengambil data dari Supabase via API
  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const formatted = formatDbToKitchen(json.data);
        
        // Buang status 'ready' dan 'cancelled' agar dapur benar-benar bersih saat pesanan tuntas
        const activeOrders = formatted.filter(
          o => o.status !== 'ready' && o.status !== 'cancelled'
        );
        setOrders(activeOrders);

        // Suara alert bila ada order waiting baru
        const waitingCount = activeOrders.filter(o => o.status === 'waiting_verification').length;
        if (waitingCount > prevWaitingCountRef.current) {
          playAlertSound();
          setMobileTab('waiting');
        }
        prevWaitingCountRef.current = waitingCount;

        // Simpan cache aktif
        localStorage.setItem('siboy_kitchen_orders', JSON.stringify(activeOrders));
      }
    } catch (e) {
      console.warn('Mode offline / gagal sinkron KDS');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('admin_auth');
      if (!auth) router.push('/admin/login');
    }

    loadOrders();
    const interval = setInterval(loadOrders, 3000); // Polling update database tiap 3 detik

    return () => clearInterval(interval);
  }, [router, isSoundEnabled]);

  // Fungsi pembantu update status ke Supabase
  const patchStatusToSupabase = async (orderId, newStatus) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
    } catch (e) {
      console.error('Gagal update status ke Supabase:', e);
    }
  };

  // 1. Verifikasi Masuk ke Antrean Siap Masak (Waiting -> Pending)
  const verifyToPending = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'pending' } : o));
    patchStatusToSupabase(orderId, 'pending');
  };

  // 2. Tolak Pesanan Fiktif (Status: cancelled)
  const rejectOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    patchStatusToSupabase(orderId, 'cancelled');
  };

  // 3. Masukkan ke Wajan (Pending -> Cooking)
  const moveToCooking = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cooking' } : o));
    patchStatusToSupabase(orderId, 'cooking');
  };

  // 4. Selesai (Cooking -> Ready)
  const finishOrder = (order) => {
    setOrders(prev => prev.filter(o => o.id !== order.id));
    patchStatusToSupabase(order.id, 'ready');

    setLastFinishedOrder(order);
    setToastMessage(`Pesanan ${order.qNo} (${order.customerName || order.name}) Selesai!`);
    
    setTimeout(() => {
      setToastMessage(null);
      setLastFinishedOrder(null);
    }, 5000);
  };

  const undoFinish = () => {
    if (lastFinishedOrder) {
      const restored = [...orders, { ...lastFinishedOrder, status: 'cooking' }];
      setOrders(restored);
      patchStatusToSupabase(lastFinishedOrder.id, 'cooking');
      setToastMessage(null);
      setLastFinishedOrder(null);
    }
  };

  const waitingOrders = orders.filter(o => o.status === 'waiting_verification');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 relative pb-24 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundSize: '32px 32px', backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)' }} />

      <div className={`max-w-[1700px] mx-auto px-3 sm:px-6 pt-4 sm:pt-6 relative z-10 transition-all duration-300 ${isSidebarOpen ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
        
        {/* COMPACT HEADER */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border-2 border-slate-100 p-3 sm:px-5 shadow-sm flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)} 
              className="w-11 h-11 sm:w-12 sm:h-12 bg-white text-amber-500 hover:bg-amber-50 border-2 border-slate-100 hover:border-amber-500 rounded-2xl transition-all flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-base sm:text-2xl font-black uppercase tracking-tight text-slate-800 leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                KITCHEN <span className="text-amber-500">KDS</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">Sistem Monitor Alur Dapur</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer shadow-sm ${isSoundEnabled ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
            >
              {isSoundEnabled ? <Bell className="w-3.5 h-3.5 animate-pulse" /> : <BellOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSoundEnabled ? 'Suara Aktif' : 'Mute'}</span>
            </button>
          </div>
        </div>

        {/* SEGMENTED TAB BAR KHUSUS MOBILE */}
        <div className="lg:hidden grid grid-cols-3 gap-1.5 p-1.5 bg-slate-200/70 backdrop-blur-md rounded-2xl mb-4 sticky top-2 z-30 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileTab('waiting')}
            className={`py-2.5 px-1 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'waiting'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Verif</span>
            <span className="bg-slate-950/20 px-1.5 py-0.2 rounded-full text-[9px]">{waitingOrders.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('pending')}
            className={`py-2.5 px-1 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'pending'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Antrean</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[9px]">{pendingOrders.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('cooking')}
            className={`py-2.5 px-1 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'cooking'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Wajan</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[9px]">{cookingOrders.length}</span>
          </button>
        </div>

        {/* 3 KOLOM UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
          
          {/* KOLOM 1: VERIFIKASI KASIR */}
          <div className={`bg-amber-500/5 rounded-3xl p-3.5 sm:p-5 border-2 border-amber-300/80 min-h-[500px] ${
            mobileTab !== 'waiting' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b-2 border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950">1. Perlu Verifikasi</h2>
              </div>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-xs">
                {waitingOrders.length} Masuk
              </span>
            </div>

            <div className="space-y-3.5">
              {waitingOrders.length === 0 && (
                <div className="py-14 text-center">
                  <CheckCircle2 className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-amber-700/70">Semua pesanan sudah terverifikasi.</p>
                </div>
              )}

              {waitingOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm relative overflow-hidden space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tighter leading-none">{order.qNo}</span>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 block">{order.id} • {order.time}</span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase truncate max-w-[120px] sm:max-w-[150px]">
                          {order.customerName}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      {order.pay}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-bold text-slate-700">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-slate-900 font-black text-xs">
                          <span>{it.qty}x {it.name}</span>
                        </div>
                      </div>
                    ))}

                    {order.notes && (
                      <p className="text-[10px] text-amber-900 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Catatan: "{order.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total:</span>
                    <span className="text-sm font-black text-red-600">{order.total}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => rejectOrder(order.id)}
                      className="py-2.5 px-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Tolak
                    </button>

                    <button
                      type="button"
                      onClick={() => verifyToPending(order.id)}
                      className="py-2.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-sky-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Terima Antrean
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM 2: ANTREAN SIAP MASAK */}
          <div className={`bg-sky-500/5 rounded-3xl p-3.5 sm:p-5 border-2 border-sky-300/80 min-h-[500px] ${
            mobileTab !== 'pending' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b-2 border-sky-200 pb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-sky-600" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-sky-950">2. Siap Masak</h2>
              </div>
              <span className="bg-sky-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-xs">
                {pendingOrders.length} Antre
              </span>
            </div>

            <div className="space-y-3.5">
              {pendingOrders.length === 0 && (
                <div className="py-14 text-center">
                  <Clock className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-sky-700/70">Tidak ada antrean tunggu.</p>
                </div>
              )}

              {pendingOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-sky-300 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl sm:text-4xl font-black text-sky-600 tracking-tighter leading-none">{order.qNo}</span>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 block">{order.id} • {order.time}</span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase truncate max-w-[120px] sm:max-w-[150px]">
                          {order.customerName}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      Terkonfirmasi
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-bold text-slate-700">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-xl text-xs font-bold">
                        <span className="text-slate-900">{it.qty}x {it.name}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={() => moveToCooking(order.id)} 
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer active:scale-[0.98]"
                  >
                    <Flame className="w-4 h-4" /> Masukkan ke Wajan
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM 3: SEDANG DIMASAK DI WAJAN */}
          <div className={`bg-red-500/5 rounded-3xl p-3.5 sm:p-5 border-2 border-red-300/80 min-h-[500px] ${
            mobileTab !== 'cooking' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b-2 border-red-200 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-950">3. Di Atas Wajan</h2>
              </div>
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-xs">
                {cookingOrders.length} Dipanggang
              </span>
            </div>

            <div className="space-y-3.5">
              {cookingOrders.length === 0 && (
                <div className="py-14 text-center">
                  <Flame className="w-8 h-8 text-red-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-red-700/70">Wajan sedang kosong.</p>
                </div>
              )}

              {cookingOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-red-400 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl sm:text-4xl font-black text-red-600 tracking-tighter leading-none">{order.qNo}</span>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 block">{order.id} • {order.time}</span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase truncate max-w-[120px] sm:max-w-[150px]">
                          {order.customerName}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 animate-pulse">
                      Dipanggang
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-bold text-slate-700">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="bg-red-50/50 border border-red-100 p-2 rounded-xl text-xs font-bold">
                        <span className="text-slate-900">{it.qty}x {it.name}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={() => finishOrder(order)} 
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Angkat & Selesai
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* TOAST NOTIFIKASI UNDO */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <div className="w-px h-5 bg-slate-700 mx-1"></div>
          <button onClick={undoFinish} className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" /> Batal (Undo)
          </button>
        </div>
      )}

      {/* SIDEBAR GLOBAL */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

    </div>
  );
}