'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, ShoppingBag, Clock, TrendingUp, ArrowUpRight,
  Settings2, X, Plus, Trash2, RefreshCw, Calendar, RotateCcw,
  AlertTriangle
} from 'lucide-react';

import AdminSidebar from '@/components/AdminSidebar';

const INITIAL_PRICES = { kecil: 6000, besar: 12000, special: 17000 };
const DEFAULT_FALLBACK_TOPPINGS = [
  { id: '1', name: 'Katsuobushi', status: 'Aman', color: '#10b981', pct: 100 },
  { id: '2', name: 'Keju Mozza', status: 'Aman', color: '#10b981', pct: 100 },
  { id: '3', name: 'Sosis Ayam', status: 'Menipis', color: '#f59e0b', pct: 40 },
  { id: '4', name: 'Crabstick', status: 'Aman', color: '#10b981', pct: 100 },
  { id: '5', name: 'Kornet Gurih', status: 'Habis', color: '#ef4444', pct: 0 }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  
  // STATE FILTERING TANGGAL & KALENDER
  const [period, setPeriod] = useState('today');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // STATE UI
  const [activeHour, setActiveHour] = useState(2);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // STATE DATA HARGA, TOPPING & STATISTIK REAL-TIME
  const [prices, setPrices] = useState(INITIAL_PRICES);
  const [toppings, setToppings] = useState(DEFAULT_FALLBACK_TOPPINGS);
  const [newToppingName, setNewToppingName] = useState('');
  const [toppingError, setToppingError] = useState('');
  
  const [rawHistory, setRawHistory] = useState([]);
  const [kitchenCount, setKitchenCount] = useState(0);

  // Ambil Data Terkini dari Database Supabase via API
  const fetchDbData = async () => {
    try {
      // 1. Ambil Transaksi Masuk
      const resOrders = await fetch('/api/orders', { cache: 'no-store' });
      const jsonOrders = await resOrders.json();
      if (jsonOrders.success && Array.isArray(jsonOrders.data)) {
        const mapped = jsonOrders.data.map(o => {
          const createdAtDate = o.createdAt ? new Date(o.createdAt) : new Date();
          return {
            id: o.id,
            timestamp: createdAtDate.getTime(),
            date: createdAtDate.toISOString(),
            customerName: o.customerName,
            rawTotal: o.totalPrice || 0,
            total: `Rp ${(o.totalPrice || 0).toLocaleString('id-ID')}`,
            status: (o.status || '').toLowerCase(),
            items: (o.items || []).map(it => ({
              name: it.menuName,
              quantity: it.quantity,
              qty: it.quantity,
              price: it.price
            }))
          };
        });
        setRawHistory(mapped);

        // Hitung antrean aktif dapur (tidak termasuk ready dan cancelled)
        const activeKitchen = mapped.filter(o => {
          const s = o.status;
          return s === 'pending' || s === 'cooking' || s === 'waiting_verification';
        }).length;
        setKitchenCount(activeKitchen);
      }

      // 2. Ambil Daftar Menu & Harga Terkini
      const resMenu = await fetch('/api/menu', { cache: 'no-store' });
      const jsonMenu = await resMenu.json();
      if (jsonMenu.success && Array.isArray(jsonMenu.data) && jsonMenu.data.length > 0) {
        const newPrices = { ...INITIAL_PRICES };
        jsonMenu.data.forEach(m => {
          if (m.slug === 'kecil') newPrices.kecil = m.price;
          if (m.slug === 'besar') newPrices.besar = m.price;
          if (m.slug === 'special') newPrices.special = m.price;
        });
        setPrices(newPrices);
      }

      // 3. Ambil Status Buka / Tutup Toko dari Supabase
      const resStatus = await fetch('/api/store-status', { cache: 'no-store' });
      const jsonStatus = await resStatus.json();
      if (typeof jsonStatus.isOpen === 'boolean') {
        setIsOpen(jsonStatus.isOpen);
      }

      // 4. Ambil Seluruh Daftar Topping Real-Time dari Supabase
      const resToppings = await fetch('/api/toppings', { cache: 'no-store' });
      const jsonToppings = await resToppings.json();
      if (jsonToppings.success && Array.isArray(jsonToppings.data) && jsonToppings.data.length > 0) {
        setToppings(jsonToppings.data);
      }

    } catch (e) {
      console.error('Error sinkronisasi dashboard:', e);
    }
  };

  useEffect(() => {
    setIsMounted(true);

    // Judul Tab Browser Standar Industri POS
    document.title = 'Dashboard Penjualan | Siboy POS';

    const auth = localStorage.getItem('admin_auth');
    if (!auth) router.push('/admin/login');

    fetchDbData();

    // Polling tiap 4 detik agar sinkron live
    const interval = setInterval(fetchDbData, 4000);
    return () => clearInterval(interval);
  }, [router]);

  // RESET TOTAL TRANSAKSI KE 0 (DANGER ZONE DI DRAWER SETTINGS)
  const handleResetAllData = async () => {
    const confirmation = window.confirm(
      'PERINGATAN AUDIT SISTEM:\n\nSemua riwayat pesanan, omzet kasir, dan antrean dapur di Supabase akan dihapus permanen menjadi Rp 0.\n\nApakah Anda yakin ingin mengosongkan seluruh database?'
    );

    if (!confirmation) return;

    setIsResetting(true);
    try {
      const res = await fetch('/api/orders?reset_all=true', { method: 'DELETE' });
      const json = await res.json();

      if (json.success) {
        localStorage.removeItem('siboy_order_history');
        localStorage.removeItem('siboy_kitchen_orders');

        alert('Database bersih! Seluruh transaksi berhasil di-reset ke 0.');
        fetchDbData();
        setIsDrawerOpen(false);
      } else {
        alert(json.message || 'Gagal mereset data transaksi.');
      }
    } catch (err) {
      console.error(err);
      alert('Koneksi ke Supabase gagal saat mencoba mereset.');
    } finally {
      setIsResetting(false);
    }
  };

  // TOGGLE STATUS BUKA / TUTUP TOKO GLOBAL KE SUPABASE
  const toggleStoreStatus = async () => {
    const nextStatus = !isOpen;
    setIsOpen(nextStatus);

    try {
      const res = await fetch('/api/store-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.isOpen !== 'boolean') {
        throw new Error('Gagal update status di server');
      }
    } catch (err) {
      console.error('Gagal memperbarui status toko ke Supabase:', err);
      setIsOpen(!nextStatus);
      alert('Gagal mengubah status toko ke database.');
    }
  };

  const getPeriodLabel = () => {
    if (period === 'today') return 'Hari Ini';
    if (period === 'week') return '7 Hari Terakhir';
    if (period === 'month') return 'Bulan Ini';
    if (period === 'date' && selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return 'Hari Ini';
  };

  // KALKULASI TRANSAKSI 100% REAL-TIME DARI SUPABASE
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let finalRev = 0;
  let finalSold = 0;
  let sHour = { 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0 };
  let sDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let pType = { besar: 0, kecil: 0, special: 0 };

  rawHistory.forEach(ord => {
    const orderTimestamp = ord.timestamp || (ord.date ? new Date(ord.date).getTime() : null);
    if (!orderTimestamp) return;

    // Filter Standar Industri: Abaikan pesanan batal dan belum terverifikasi
    const s = ord.status;
    if (s === 'cancelled' || s === 'dibatalkan' || s === 'batal' || s === 'waiting_verification') {
      return;
    }

    const ordTimeObj = new Date(orderTimestamp);
    const ordTimeMs = ordTimeObj.getTime();

    let include = false;
    if (period === 'today') {
      include = ordTimeMs >= todayStart && ordTimeMs < todayStart + 24 * 60 * 60 * 1000;
    } else if (period === 'week') {
      include = ordTimeMs >= (todayStart - 6 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      include = ordTimeObj.getMonth() === now.getMonth() && ordTimeObj.getFullYear() === now.getFullYear();
    } else if (period === 'date' && selectedDate) {
      const [tY, tM, tD] = selectedDate.split('-').map(Number);
      include = ordTimeObj.getDate() === tD && 
                ordTimeObj.getMonth() === (tM - 1) && 
                ordTimeObj.getFullYear() === tY;
    }

    if (include) {
      const rawVal = ord.rawTotal ?? 0;
      finalRev += Number(rawVal) || 0;

      let qtyInOrder = 0;
      if (ord.items && Array.isArray(ord.items) && ord.items.length > 0) {
        ord.items.forEach(it => {
          const q = Number(it.qty || it.quantity || 1);
          qtyInOrder += q;
          const n = (it.name || '').toLowerCase();
          if (n.includes('besar')) pType.besar += q;
          else if (n.includes('special')) pType.special += q;
          else pType.kecil += q;
        });
      } else {
        qtyInOrder = 1;
        pType.besar += 1;
      }

      finalSold += qtyInOrder;

      const h = ordTimeObj.getHours();
      if (h >= 16 && h <= 22) {
        sHour[h] += qtyInOrder;
      } else if (h < 16) {
        sHour[16] += qtyInOrder;
      } else {
        sHour[22] += qtyInOrder;
      }

      const jsDay = ordTimeObj.getDay();
      const d = jsDay === 0 ? 6 : jsDay - 1;
      sDay[d] += qtyInOrder;
    }
  });

  const finalAvg = finalSold > 0 ? Math.round(finalRev / finalSold) : 0;
  const displayAvg = `Rp ${finalAvg.toLocaleString('id-ID')}`;

  // Builder Grafik Jam Ramai Real-Time
  const waveData = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const h = 16 + i;
    const val = sHour[h] || 0;
    return { hour: `${h}:00`, x: 25 + (i * 70), val };
  });

  const maxWaveVal = Math.max(...waveData.map(d => d.val), 5); 
  waveData.forEach(d => { d.y = 85 - ((d.val / maxWaveVal) * 70); });
  const pathData = waveData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.y}`).join(' ');
  const areaPathData = `${pathData} L 445 90 L 25 90 Z`;
  const topHour = waveData.reduce((max, obj) => obj.val > max.val ? obj : max, waveData[0]);

  // Siklus Harian Real-Time
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const daysTraffic = dayNames.map((day, i) => ({ day, val: sDay[i] || 0 }));
  const maxDayVal = Math.max(...daysTraffic.map(d => d.val), 5);
  daysTraffic.forEach(d => { 
    d.pct = `${(d.val / maxDayVal) * 100}%`; 
    d.isPeak = d.val === maxDayVal && d.val > 0;
  });

  // Tipe Kardus Real-Time
  const portionData = [
    { label: 'Porsi Besar', pcs: pType.besar, color: '#ef4444' },
    { label: 'Porsi Kecil', pcs: pType.kecil, color: '#3b82f6' },
    { label: 'Porsi Special', pcs: pType.special, color: '#10b981' }
  ];

  const totalBox = portionData.reduce((acc, curr) => acc + curr.pcs, 0);
  let cumulativeOffset = 0;
  portionData.forEach(slice => {
    const pct = totalBox > 0 ? (slice.pcs / totalBox) * 100 : 0;
    slice.pctText = Math.round(pct);
    slice.dash = `${pct} 100`;
    slice.offset = `${cumulativeOffset}`;
    cumulativeOffset -= pct;
  });

  // UPDATE HARGA MENU KE SUPABASE
  const handlePriceChange = async (key, value) => {
    const val = parseInt(value, 10) || 0;
    const updated = { ...prices, [key]: val };
    setPrices(updated);

    try {
      await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: key, price: val }),
      });
    } catch (err) {
      console.error('Gagal update harga ke Supabase:', err);
    }
  };

  // UPDATE STATUS TOPPING KE SUPABASE
  const cycleToppingStatus = async (id) => {
    const target = toppings.find(t => t.id === id);
    if (!target) return;

    let nextStatus = 'Aman';
    let nextColor = '#10b981';
    let nextPct = 100;

    if (target.status === 'Aman') {
      nextStatus = 'Menipis';
      nextColor = '#f59e0b';
      nextPct = 40;
    } else if (target.status === 'Menipis') {
      nextStatus = 'Habis';
      nextColor = '#ef4444';
      nextPct = 0;
    }

    const updated = toppings.map(t => 
      t.id === id ? { ...t, status: nextStatus, color: nextColor, pct: nextPct } : t
    );
    setToppings(updated);

    try {
      await fetch('/api/toppings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: nextStatus,
          color: nextColor,
          pct: nextPct
        }),
      });
    } catch (err) {
      console.error('Gagal update topping ke database:', err);
      fetchDbData();
    }
  };

  // TAMBAH TOPPING BARU
  const handleAddTopping = async () => {
    if (!newToppingName.trim()) return setToppingError('Nama tidak boleh kosong.');

    try {
      const res = await fetch('/api/toppings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newToppingName.trim() }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setToppings(prev => [...prev, data.data]);
        setNewToppingName(''); 
        setToppingError('');
      } else {
        setToppingError(data.error || 'Gagal menambahkan topping.');
      }
    } catch (err) {
      console.error('Gagal tambah topping ke database:', err);
      setToppingError('Koneksi database bermasalah.');
    }
  };

  // HAPUS TOPPING
  const handleDeleteTopping = async (id) => {
    const backup = [...toppings];
    setToppings(prev => prev.filter(t => t.id !== id));

    try {
      const res = await fetch(`/api/toppings?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Gagal menghapus topping dari database:', err);
      setToppings(backup);
      alert('Gagal menghapus topping.');
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 relative pb-16 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundSize: '32px 32px', backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)' }} />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-10 space-y-6 transition-all duration-300 ${isDrawerOpen || isSidebarOpen ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
        
        {/* HEADER BERSIH & PROFESIONAL */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border-2 border-slate-100 p-4 sm:p-5 sm:px-7 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center relative z-20">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)} 
              className="w-10 h-10 bg-white text-red-600 hover:bg-red-50 border-2 border-slate-100 hover:border-red-200 rounded-xl transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <span className="w-4 h-0.5 bg-red-600 rounded-full" />
              <span className="w-3 h-0.5 bg-red-600 rounded-full" />
              <span className="w-4 h-0.5 bg-red-600 rounded-full" />
            </button>

            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>SIBOY</span>
                <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-red-600 relative inline-block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  POS <svg className="absolute w-full h-2 -bottom-0.5 left-0 text-amber-400 z-[-1]" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M5 12 Q 30 5 70 12 T 95 12" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="transparent" /></svg>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">Dashboard Live {getPeriodLabel()}</p>
                {period === 'date' && (
                  <button 
                    type="button"
                    onClick={() => { setPeriod('today'); setSelectedDate(''); }}
                    className="text-[9px] font-black uppercase text-red-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Hari Ini
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Filter Kalender & Periode */}
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-9 h-9 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                  period === 'date' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Pilih Periode / Tanggal"
              >
                <Calendar className="w-4 h-4" />
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex flex-col gap-1 mb-3">
                      {[
                        { id: 'today', l: 'Hari Ini' }, 
                        { id: 'week', l: '7 Hari Terakhir' }, 
                        { id: 'month', l: 'Bulan Ini' }
                      ].map(p => (
                        <button 
                          key={p.id}
                          type="button"
                          onClick={() => { setPeriod(p.id); setSelectedDate(''); setIsFilterOpen(false); }}
                          className={`text-left text-xs font-bold px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${period === p.id && !selectedDate ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {p.l}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block px-1">Pilih Tanggal Tertentu</span>
                      <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={e => {
                          setSelectedDate(e.target.value);
                          setPeriod('date');
                          setIsFilterOpen(false);
                        }} 
                        className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-red-400 cursor-pointer" 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Toggle Status Buka / Tutup Global */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-full">
              <span className={`text-[10px] font-black uppercase tracking-wider ml-1 ${isOpen ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isOpen ? 'Buka' : 'Tutup'}
              </span>
              <button 
                type="button"
                onClick={toggleStoreStatus} 
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer shadow-inner ${isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isOpen ? 'translate-x-5' : 'translate-x-1'}`}/>
              </button>
            </div>
          </div>
        </div>

        {/* 3 KARTU METRIK UTAMA 100% REAL-TIME */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 sm:p-6 text-white shadow-[0_12px_30px_rgb(16,185,129,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-white/80 mb-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Total Pendapatan</span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center"><DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Rp {finalRev.toLocaleString('id-ID')}</p>
            </div>
            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-xs font-bold text-white/90 mt-5">
              <span>Omzet {getPeriodLabel()}</span>
              <span className="text-white/70">Database Supabase</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 sm:p-6 text-white shadow-[0_12px_30px_rgb(245,158,11,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-white/80 mb-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Porsi Keluar</span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center"><ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>{finalSold} <span className="text-sm font-bold text-white/80">Porsi</span></p>
            </div>
            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-xs font-bold text-white/90 mt-5">
              <span className="text-white/70">Rata-rata per order</span><span>{displayAvg}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-5 sm:p-6 text-white shadow-[0_12px_30px_rgb(14,165,233,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-white/80 mb-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Antrean Dapur</span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center"><Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>{kitchenCount} <span className="text-sm font-bold text-white/80">Pesanan</span></p>
            </div>
            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-xs font-bold text-white/90 mt-5">
              <span className="text-white/80">Di Layar KDS</span>
              <button type="button" onClick={() => router.push('/admin/kitchen')} className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 text-white font-black cursor-pointer transition-colors">
                Kitchen <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* AREA GRAFIK REAL-TIME */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between relative">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Jam Ramai</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">Sebaran {getPeriodLabel()}</p>
              </div>
              <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md">
                Puncak: {topHour.hour}
              </span>
            </div>

            <div className="w-full pt-8 pb-2 relative">
              {hoveredHour !== null && (
                <div 
                  className="absolute z-20 bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase px-3.5 py-2 rounded-xl shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-200 flex flex-col items-center gap-1"
                  style={{ left: `${(waveData[hoveredHour].x / 470) * 100}%`, top: `${waveData[hoveredHour].y}px`, marginTop: '-12px' }}
                >
                  <span className="text-slate-400">{waveData[hoveredHour].hour} WIB</span>
                  <span className="text-amber-400 text-xs">{waveData[hoveredHour].val} Pcs</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
                </div>
              )}

              <svg viewBox="0 0 470 110" className="w-full h-32 overflow-visible" onMouseLeave={() => setHoveredHour(null)}>
                <defs>
                  <linearGradient id="glowRed" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="25" y1="15" x2="445" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="25" y1="50" x2="445" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="25" y1="85" x2="445" y2="85" stroke="#e2e8f0" strokeWidth="1" />
                
                {finalSold > 0 && <path d={areaPathData} fill="url(#glowRed)" />}
                <path d={pathData} fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {waveData.map((pt, i) => (
                  <g key={i} className="cursor-pointer group" onMouseEnter={() => setHoveredHour(i)} onClick={() => setActiveHour(i)}>
                    <circle cx={pt.x} cy={pt.y} r="20" fill="transparent" />
                    <circle cx={pt.x} cy={pt.y} r={hoveredHour === i || activeHour === i ? 6 : 4} className={`transition-all duration-200 ${hoveredHour === i || activeHour === i ? 'fill-red-600 stroke-white stroke-[3px]' : 'fill-slate-300 group-hover:fill-red-500'}`} />
                    <text x={pt.x} y="106" fontSize="9.5" textAnchor="middle" className={`font-bold transition-colors ${hoveredHour === i || activeHour === i ? 'fill-red-600 font-black' : 'fill-slate-400'}`}>
                      {pt.hour.split(':')[0]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-600 mt-2">
              <span>Jam Terpilih: <strong className="text-red-600">{waveData[activeHour].hour} WIB</strong></span>
              <span>Total: <strong className="text-slate-900">{waveData[activeHour].val} Porsi</strong></span>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-3xl border-2 border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Siklus</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">Tren mingguan terakumulasi</p>
            </div>
            <div className="h-32 flex items-end justify-between gap-1.5 pt-4 border-b border-slate-100 pb-2 mt-4">
              {daysTraffic.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-10">
                    {d.val} Porsi
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>

                  <div className="w-3 sm:w-3.5 h-24 bg-slate-50 border border-slate-100 rounded-full flex flex-col justify-end p-[1px]">
                    <div 
                      className="w-full rounded-full transition-all duration-700 bg-slate-300 group-hover:bg-red-500" 
                      style={{ height: d.pct, backgroundColor: d.isPeak ? '#dc2626' : undefined }} 
                    />
                  </div>
                  <span className={`text-[9px] font-bold transition-colors ${d.isPeak ? 'text-red-600 font-black' : 'text-slate-500'}`}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1 w-full text-left sm:border-r border-slate-100 sm:pr-4">
              <div className="pb-2 border-b border-slate-100 mb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Tipe Kardus</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">Sebaran {getPeriodLabel()}</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {portionData.map((slice, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: slice.color }}></span>
                      <span className="text-slate-600 uppercase">{slice.label}</span>
                    </div>
                    <span className="text-slate-900 font-black">{slice.pctText}% ({slice.pcs})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path stroke="#f1f5f9" strokeWidth="5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                {totalBox > 0 && portionData.map((slice, i) => (
                  <path key={i} strokeDasharray={slice.dash} strokeDashoffset={slice.offset} strokeWidth="5" strokeLinecap="butt" stroke={slice.color} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" className="transition-all duration-1000 ease-out" />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 leading-none">{totalBox}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Kotak</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS BAHAN TOPPING */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Ketersediaan Topping</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">Klik kartu untuk ubah status instan (Aman, Menipis, Habis). Langsung sinkron ke HP pembeli.</p>
            </div>
            <button 
              type="button" 
              onClick={() => setIsDrawerOpen(true)} 
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Settings2 className="w-4 h-4 text-slate-500" /> Atur Harga & Bahan
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {toppings.map((top) => (
              <div 
                key={top.id} 
                onClick={() => cycleToppingStatus(top.id)}
                className={`border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none ${
                  top.status === 'Aman' ? 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md' :
                  top.status === 'Menipis' ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' :
                  'bg-slate-50 border-slate-200 opacity-60'
                }`}
                title="Klik untuk ubah status bahan"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black truncate ${top.status === 'Habis' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{top.name}</span>
                  <RefreshCw className="w-3 h-3 text-slate-300" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                    top.status === 'Aman' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    top.status === 'Menipis' ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' :
                    'bg-slate-200 text-slate-600 border-slate-300'
                  }`}>
                    {top.status}
                  </span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: top.color }}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* DRAWER PENGATURAN HARGA, BAHAN, & ZONA DESTRUKTIF */}
      {isDrawerOpen && <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Pengaturan Menu & Stok</h2>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Ubah harga jual & status persediaan bahan langsung ke Supabase.</p>
          </div>
          <button type="button" onClick={() => setIsDrawerOpen(false)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:hidden">
          
          {/* BAGIAN HARGA MENU */}
          <section className="space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Ubah Harga Menu</h3>
              <p className="text-[10px] font-bold text-slate-400">Tersinkron langsung ke Supabase & Layar Kasir POS</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Porsi Kecil (5 pcs)</h4>
                  <span className="text-[10px] text-slate-400 font-bold">Menu Camilan</span>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input type="number" value={prices.kecil} onChange={(e) => handlePriceChange('kecil', e.target.value)} className="w-full bg-white border border-slate-200 text-xs font-black text-right pr-3 pl-7 py-2 rounded-xl outline-none focus:border-red-500" />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Porsi Besar (10 pcs)</h4>
                  <span className="text-[10px] text-slate-400 font-bold">Paling Laris</span>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input type="number" value={prices.besar} onChange={(e) => handlePriceChange('besar', e.target.value)} className="w-full bg-white border border-slate-200 text-xs font-black text-right pr-3 pl-7 py-2 rounded-xl outline-none focus:border-red-500" />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Porsi Special (15 pcs)</h4>
                  <span className="text-[10px] text-slate-400 font-bold">Porsi Puas</span>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <input type="number" value={prices.special} onChange={(e) => handlePriceChange('special', e.target.value)} className="w-full bg-white border border-slate-200 text-xs font-black text-right pr-3 pl-7 py-2 rounded-xl outline-none focus:border-red-500" />
                </div>
              </div>
            </div>
          </section>

          {/* BAGIAN TAMBAH & KELOLA BAHAN TOPPING */}
          <section className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Kelola Bahan Topping</h3>
              <p className="text-[10px] font-bold text-slate-400">Bahan 'Habis' otomatis terkunci dan tidak bisa dipilih pembeli</p>
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ketik topping baru..." 
                value={newToppingName} 
                onChange={(e) => setNewToppingName(e.target.value)} 
                className="flex-1 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-red-500 bg-slate-50" 
              />
              <button 
                type="button" 
                onClick={handleAddTopping} 
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {toppingError && <p className="text-[10px] text-red-500 font-bold">{toppingError}</p>}

            <div className="space-y-2.5">
              {toppings.map((top) => (
                <div key={top.id} className="bg-white border-2 border-slate-100 rounded-2xl p-3 flex items-center justify-between hover:border-slate-200">
                  <div>
                    <h4 className={`text-xs font-black ${top.status === 'Habis' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{top.name}</h4>
                    <span className="text-[9px] text-slate-400 font-bold">Status Bahan</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => cycleToppingStatus(top.id)} className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${top.status === 'Aman' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : top.status === 'Menipis' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{top.status}</button>
                    <button type="button" onClick={() => handleDeleteTopping(top.id)} className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DANGER ZONE: RESET TOTAL (STANDAR POS INDUSTRI) */}
          <section className="space-y-3 pt-4 border-t-2 border-dashed border-rose-200">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-wider">Zona Berbahaya (Audit Data)</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Fitur khusus untuk mengosongkan riwayat transaksi database Supabase. Gunakan sebelum sesi presentasi atau saat memulai buku kas baru agar grafik dan omzet kembali murni ke Rp 0.
            </p>
            <button
              type="button"
              disabled={isResetting}
              onClick={handleResetAllData}
              className="w-full py-3 px-4 rounded-xl border border-rose-300 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Mengosongkan Database...' : 'Kosongkan Semua Transaksi (0)'}</span>
            </button>
          </section>

        </div>
      </div>

      <AdminSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onOpenSettings={() => setIsDrawerOpen(true)} 
      />

    </div>
  );
}