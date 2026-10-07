'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, Clock, Flame, Receipt, 
  ChevronRight, Store, Sparkles, Banknote, QrCode, RefreshCw,
  MessageCircle, XCircle
} from 'lucide-react';

const WA_BUSINESS_PHONE = '628567637987';

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

function TicketContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');

  const [isMounted, setIsMounted] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data pesanan langsung dari Supabase tanpa cache browser
  const fetchOrderLive = async () => {
    if (!targetId) {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          parseAndSetOrder(json.data[0]);
        } else {
          setCurrentOrder(null);
        }
      } catch (e) {
        fallbackLocalStorage();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(targetId)}`, { cache: 'no-store' });
      const json = await res.json();

      if (json.success && json.data) {
        parseAndSetOrder(json.data);
      } else {
        fallbackLocalStorage();
      }
    } catch (e) {
      fallbackLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Parsing data Supabase agar sesuai dengan UI kartu tiket
  const parseAndSetOrder = (dbOrder) => {
    const rawStatus = (dbOrder.status || '').toLowerCase();
    let mappedStatus = 'pending';

    if (rawStatus === 'cooking' || rawStatus === 'dimasak') {
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

    // Ekstrak nomor antrean [#01] jika ada di catatan
    const queueMatch = dbOrder.notes?.match(/\[#(.*?)\]/);
    let queueBadge = queueMatch ? `#${queueMatch[1]}` : `#${dbOrder.id.slice(-3)}`;
    if (!queueMatch && dbOrder.id.startsWith('SB-')) {
      const parts = dbOrder.id.split('-');
      queueBadge = `#${parts[parts.length - 1]}`;
    }

    const orderTime = dbOrder.createdAt
      ? new Date(dbOrder.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '-';

    const isQris = (dbOrder.notes || '').toUpperCase().includes('QRIS');
    const cleanNotes = dbOrder.notes?.replace(/\[#(.*?)\]\s*/, '') || '';

    // Update Judul Tab Dinamis sesuai Nomor Antrean
    document.title = `Karcis ${queueBadge} | Takoyaki Siboy`;

    setCurrentOrder({
      id: dbOrder.id,
      queueNumber: queueBadge,
      status: mappedStatus,
      customerName: dbOrder.customerName || 'PELANGGAN',
      customerPhone: dbOrder.customerPhone || '-',
      time: orderTime,
      total: `Rp ${(dbOrder.totalPrice || 0).toLocaleString('id-ID')}`,
      numericTotal: dbOrder.totalPrice || 0,
      pay: isQris ? 'QRIS' : 'CASH',
      notes: cleanNotes,
      items: (dbOrder.items || []).map((it) => ({
        name: it.menuName,
        qty: it.quantity,
        price: it.price,
        toppings: it.menuName.includes('(') ? it.menuName.split('(')[1]?.replace(')', '') : 'Porsi Standar'
      }))
    });
  };

  // Cadangan offline bila koneksi terputus
  const fallbackLocalStorage = () => {
    try {
      const historyOrders = JSON.parse(localStorage.getItem('siboy_order_history') || '[]');
      const kitchenOrders = JSON.parse(localStorage.getItem('siboy_kitchen_orders') || '[]');

      if (historyOrders.length === 0) return setCurrentOrder(null);

      const matchedHistory = targetId 
        ? historyOrders.find(h => h.id === targetId) 
        : historyOrders[0];

      if (!matchedHistory) return setCurrentOrder(null);

      const activeInKitchen = kitchenOrders.find(k => k.id === matchedHistory.id);
      let liveStatus = activeInKitchen ? activeInKitchen.status : (matchedHistory.status || 'ready');
      let liveQueue = activeInKitchen?.qNo || matchedHistory.qNo || '#01';

      document.title = `Karcis ${liveQueue} | Takoyaki Siboy`;

      setCurrentOrder({
        ...matchedHistory,
        status: liveStatus,
        queueNumber: liveQueue,
        customerName: matchedHistory.customerName || matchedHistory.name || 'PELANGGAN'
      });
    } catch (err) {}
  };

  useEffect(() => {
    setIsMounted(true);
    document.title = 'Live Order Ticket | Takoyaki Siboy';
    fetchOrderLive();

    const interval = setInterval(fetchOrderLive, 3000);
    return () => clearInterval(interval);
  }, [targetId]);

  const isUnverified = currentOrder?.status === 'waiting_verification';
  const isCash = currentOrder?.pay === 'CASH';

  // Handler kirim pesan konfirmasi ke WhatsApp Bisnis
  const handleSendToWhatsApp = () => {
    if (!currentOrder) return;

    const itemsSummary = (currentOrder.items || [])
      .map((it) => `• ${it.qty}x ${it.name} (${it.toppings})`)
      .join('\n');

    const message = `Halo Takoyaki Siboy! 🐙
Saya ingin konfirmasi pesanan dari web:

🎫 *No. Antrean:* ${currentOrder.queueNumber}
🆔 *Order ID:* ${currentOrder.id}
👤 *Nama:* ${currentOrder.customerName}
📞 *No. HP:* ${currentOrder.customerPhone || '-'}

📦 *Menu Dipesan:*
${itemsSummary || '-'}

💰 *Total Pembayaran:* ${currentOrder.total}
💳 *Metode Bayar:* ${currentOrder.pay} (${isUnverified ? 'Menunggu Kasir' : 'Lunas'})
📍 *Metode Ambil:* Ambil di Gerai (Self Pick-up)

Mohon dicek dan diproses ya kak. Terima kasih!`;

    const waUrl = `https://wa.me/${WA_BUSINESS_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const statusConfig = {
    waiting_verification: {
      bg: 'bg-amber-50/95', border: 'border-amber-300', text: 'text-amber-950',
      iconBg: 'bg-amber-500', icon: <Clock className="w-5 h-5 text-white animate-spin" />,
      title: isCash ? 'Menunggu Bayar' : 'Verifikasi Mutasi',
      desc: isCash ? 'Bayar ke meja kasir' : 'Menunggu verifikasi kasir'
    },
    pending: {
      bg: 'bg-sky-50/95', border: 'border-sky-200', text: 'text-sky-950', 
      iconBg: 'bg-sky-500', icon: <Clock className="w-5 h-5 text-white animate-pulse" />,
      title: 'Antrean Masuk', desc: 'Menunggu giliran wajan'
    },
    cooking: {
      bg: 'bg-red-50/95', border: 'border-red-200', text: 'text-red-950', 
      iconBg: 'bg-red-600', icon: <Flame className="w-5 h-5 text-white animate-bounce" />,
      title: 'Sedang Dipanggang', desc: 'Takoyaki di atas loyang'
    },
    ready: {
      bg: 'bg-emerald-50/95', border: 'border-emerald-200', text: 'text-emerald-950', 
      iconBg: 'bg-emerald-500', icon: <CheckCircle2 className="w-5 h-5 text-white" />,
      title: 'Pesanan Siap!', desc: 'Silakan ambil di kasir'
    },
    cancelled: {
      bg: 'bg-rose-50/95', border: 'border-rose-300', text: 'text-rose-950', 
      iconBg: 'bg-rose-600', icon: <XCircle className="w-5 h-5 text-white" />,
      title: 'Pesanan Dibatalkan', desc: 'Hubungi kasir di gerai'
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          <span>Memuat Karcis Digital...</span>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-black text-slate-800 uppercase">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 mt-1">
            {targetId ? `Transaksi "${targetId}" tidak ditemukan.` : 'Belum ada transaksi aktif.'}
          </p>
        </div>
      </div>
    );
  }

  const activeTheme = statusConfig[currentOrder.status] || statusConfig.pending;
  const isMultiItem = (currentOrder.items?.length || 0) > 1;

  return (
    <div className="min-h-[100dvh] bg-slate-100 sm:bg-slate-200/80 flex justify-center items-center sm:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-[460px] bg-[#faf9f6] sm:rounded-[2.5rem] sm:shadow-2xl relative flex flex-col sm:border sm:border-slate-200/80 overflow-hidden">
        
        {/* Motif Background Grid */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30" style={{ backgroundSize: '24px 24px', backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)' }} />

        {/* 1. HEADER BRAND */}
        <div className="pt-4 sm:pt-5 pb-3 px-5 sm:px-6 flex items-center justify-between relative z-10 shrink-0 border-b border-slate-100/90 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SIBOY<span className="text-amber-500">POS</span>
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Live Order Tracker</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-lg">
            {currentOrder.id}
          </span>
        </div>

        {/* 2. BODY KONTEN */}
        <div className="p-4 sm:p-5 relative z-10 flex-1 flex flex-col justify-between overflow-y-auto space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* KARTU NOMOR ANTREAN */}
          <div className={`rounded-2xl p-4 sm:p-4.5 border-2 transition-all flex items-center justify-between shadow-xs shrink-0 ${activeTheme.bg} ${activeTheme.border}`}>
            <div className="min-w-0 pr-2">
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60 block leading-none">No. Antrean</span>
              <h2 className={`text-4xl sm:text-5xl font-black tracking-normal leading-tight py-1 my-0.5 ${activeTheme.text}`}>
                {currentOrder.queueNumber}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border bg-white/80 ${activeTheme.border} ${activeTheme.text}`}>
                  A/N
                </span>
                <span className={`text-xs sm:text-sm font-black uppercase truncate max-w-[140px] sm:max-w-[170px] ${activeTheme.text}`}>
                  {currentOrder.customerName}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end text-right shrink-0">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs mb-1.5 ${activeTheme.iconBg}`}>
                {activeTheme.icon}
              </div>
              <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight leading-tight ${activeTheme.text}`}>{activeTheme.title}</h3>
              <p className={`text-[9px] sm:text-[10px] font-bold opacity-75 mt-0.5 leading-none ${activeTheme.text}`}>{activeTheme.desc}</p>
            </div>
          </div>

          {/* BANNER INSTRUKSI KASIR */}
          {isUnverified && (
            <div className={`rounded-2xl p-3 sm:p-3.5 border shrink-0 flex items-start gap-2.5 shadow-xs ${
              isCash 
                ? 'bg-amber-100/90 border-amber-300 text-amber-950' 
                : 'bg-sky-50 border-sky-300 text-sky-950'
            }`}>
              {isCash ? (
                <Banknote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              ) : (
                <QrCode className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              )}
              <div className="text-[10.5px] sm:text-[11px] leading-snug flex-1">
                <p className="font-black uppercase text-[10px] mb-0.5">
                  {isCash ? 'Instruksi Bayar Tunai' : 'Verifikasi Pembayaran'}
                </p>
                <p className="font-semibold opacity-90">
                  {isCash ? (
                    <>Sebutkan <strong>No. Antrean {currentOrder.queueNumber}</strong> di kasir & bayar <strong>{currentOrder.total}</strong> agar pesanan langsung dipanggang koki.</>
                  ) : (
                    <>Transfer QRIS Anda sedang dicek. Tunjukkan bukti transfer ke kasir bila antrean padat.</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TOMBOL KONFIRMASI WHATSAPP BISNIS */}
          <div className="rounded-2xl p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-900">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                  WhatsApp Bisnis Gerai
                </span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Self Pick-Up
              </span>
            </div>

            <button
              onClick={handleSendToWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Kirim Bukti Karcis ke WhatsApp</span>
            </button>

            <p className="text-[9px] text-emerald-700 font-semibold text-center leading-tight">
              Kirim bukti karcis agar pesanan langsung disiapkan koki selagi Anda menuju gerai
            </p>
          </div>

          {/* STRUK DETAIL BELANJA */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col shrink-0">
            <div className="px-4 py-2 sm:py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600">Rincian Belanja</h4>
              </div>
              <span className="text-[9px] font-bold text-slate-400">{currentOrder.time} WIB</span>
            </div>

            {/* List Menu Item */}
            <div className={`p-3 sm:p-3.5 space-y-2.5 ${isMultiItem ? 'max-h-[140px] sm:max-h-[160px] overflow-y-auto' : ''}`}>
              {currentOrder.items && Array.isArray(currentOrder.items) ? (
                currentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex-1 pr-3">
                      <p className="text-xs sm:text-[13px] font-black text-slate-900 leading-tight">{item.qty}x {item.name}</p>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-500 leading-snug mt-0.5">
                        {item.toppings}
                      </p>
                    </div>
                    <span className="text-xs sm:text-[13px] font-black text-slate-800 whitespace-nowrap">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              ) : null}

              {currentOrder.notes && (
                <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Catatan: "{currentOrder.notes}"
                </p>
              )}
            </div>

            {/* Total Footer Struk */}
            <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50/90 border-t border-dashed border-slate-200 flex justify-between items-center">
              <div>
                <span className={`inline-block border px-2 py-0.5 rounded text-[8px] sm:text-[8.5px] font-black uppercase ${
                  currentOrder.status === 'cancelled'
                    ? 'bg-rose-100/90 border-rose-300 text-rose-900'
                    : isUnverified 
                      ? 'bg-amber-100/90 border-amber-300 text-amber-900' 
                      : 'bg-emerald-100/60 border-emerald-200 text-emerald-800'
                }`}>
                  {currentOrder.status === 'cancelled' ? 'BATAL' : isUnverified ? (isCash ? 'BELUM LUNAS' : 'MENUNGGU KASIR') : 'LUNAS'} ({currentOrder.pay})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8.5px] text-slate-400 font-bold block uppercase leading-none mb-0.5">Total Bayar</span>
                <p className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-none">
                  {currentOrder.total}
                </p>
              </div>
            </div>
          </div>

          {/* 3. PROMO INSTAGRAM */}
          <a 
            href="https://instagram.com/takoyaki_siboy" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl p-[1.5px] shadow-xs active:scale-[0.99] transition-transform shrink-0"
          >
            <div className="bg-white/10 backdrop-blur-xs rounded-[10px] px-3.5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-xs">
                  <InstagramIcon className="w-3 h-3" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-black text-white tracking-wider uppercase">Follow @takoyaki_siboy</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80" />
            </div>
          </a>

          {/* 4. FOOTER IDENTITY */}
          <div className="text-center pt-1 pb-1 shrink-0">
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              Powered by Siboy POS <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function TicketTracker() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">Memuat Karcis...</div>}>
      <TicketContent />
    </Suspense>
  );
}