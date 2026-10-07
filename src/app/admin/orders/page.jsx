'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, FileText, Download, MoreHorizontal, 
  X, Eye, Printer, Trash2, Receipt, Menu,
  TrendingUp, CreditCard, Banknote, RefreshCw
} from 'lucide-react';

import AdminSidebar from '@/components/AdminSidebar';

export default function OrderHistory() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [period, setPeriod] = useState('all'); 
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [historyData, setHistoryData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Ambil data langsung dari Supabase via /api/orders
  const loadOrdersFromDb = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((o) => {
          const createdAtDate = o.createdAt ? new Date(o.createdAt) : new Date();
          const formattedDate = createdAtDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          const formattedTime = createdAtDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          });

          const isQris = (o.notes || '').toUpperCase().includes('QRIS');
          const queueMatch = o.notes?.match(/\[#(.*?)\]/);
          const queueBadge = queueMatch ? `#${queueMatch[1]}` : `#${o.id.slice(-3)}`;

          return {
            id: o.id,
            queueBadge,
            timestamp: createdAtDate.getTime(),
            date: formattedDate,
            time: formattedTime,
            customerName: o.customerName || 'Pelanggan',
            totalPrice: o.totalPrice || 0,
            total: `Rp ${(o.totalPrice || 0).toLocaleString('id-ID')}`,
            pay: isQris ? 'QRIS' : 'CASH',
            stat: (o.status || 'pending').toLowerCase(),
            notes: o.notes || '',
            items: (o.items || []).map((it) => ({
              id: it.id,
              name: it.menuName,
              qty: it.quantity,
              price: it.price,
            }))
          };
        });

        setHistoryData(mapped);
      }
    } catch (e) {
      console.error('Gagal mengambil data dari Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);

    // Judul Tab Browser Standar Industri POS
    document.title = 'Order History | Siboy POS';

    const auth = localStorage.getItem('admin_auth');
    if (!auth) router.push('/admin/login');

    loadOrdersFromDb();
  }, [router]);

  const resolveOrderType = (row) => {
    if (row.items && Array.isArray(row.items) && row.items.length > 0) {
      return row.items.map(it => `${it.qty}x ${it.name}`).join(' + ');
    }
    return 'Takoyaki Siboy';
  };

  const filterByPeriod = (item) => {
    if (period === 'all') return true;
    if (!item.timestamp) return true;

    const itemDate = new Date(Number(item.timestamp));
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const itemTimeMs = itemDate.getTime();

    if (period === 'today') {
      return itemTimeMs >= todayStart && itemTimeMs < todayStart + 24 * 60 * 60 * 1000;
    }
    if (period === 'week') {
      return itemTimeMs >= (todayStart - 6 * 24 * 60 * 60 * 1000);
    }
    if (period === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredData = historyData
    .filter(filterByPeriod)
    .filter(item => {
      const q = searchTerm.toLowerCase();
      const idMatch = item.id && item.id.toLowerCase().includes(q);
      const nameMatch = (item.customerName || '').toLowerCase().includes(q);
      const typeMatch = resolveOrderType(item).toLowerCase().includes(q);
      return idMatch || nameMatch || typeMatch;
    });

  // Hanya pesanan sah (bukan dibatalkan/unverified) yang dihitung omzetnya
  const validCompletedOrders = filteredData.filter(d => 
    d.stat !== 'cancelled' && 
    d.stat !== 'dibatalkan' && 
    d.stat !== 'batal' && 
    d.stat !== 'waiting_verification'
  );

  const totalOmzet = validCompletedOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const totalCash = validCompletedOrders.filter(d => d.pay === 'CASH').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const totalQris = validCompletedOrders.filter(d => d.pay === 'QRIS').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  // Hapus transaksi tunggal (untuk membuang data uji coba spesifik)
  const handleDelete = async (id) => {
    if (confirm(`Yakin ingin menghapus data transaksi ${id} dari database Supabase?`)) {
      try {
        const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setHistoryData(prev => prev.filter(item => item.id !== id));
        } else {
          alert('Gagal menghapus: ' + json.message);
        }
      } catch (err) {
        alert('Gagal menghapus pesanan dari server.');
      }
      setActiveDropdown(null);
    }
  };

  const handlePrintStruk = (row) => {
    setSelectedOrder(row);
    setActiveDropdown(null);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const exportToExcel = () => {
    const headers = ['ID Transaksi', 'No Antrean', 'Tanggal', 'Waktu', 'Pelanggan', 'Rincian Menu', 'Total Bayar', 'Metode', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(r => {
        const typeText = resolveOrderType(r).replace(/"/g, '""');
        const custName = (r.customerName || 'PELANGGAN').replace(/"/g, '""');
        return `"${r.id}","${r.queueBadge || '-'}","${r.date}","${r.time}","${custName}","${typeText}","${r.totalPrice}","${r.pay}","${r.stat}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Laporan_Transaksi_Siboy_${new Date().toLocaleDateString('id-ID')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => window.print();

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 relative pb-16 overflow-x-hidden print:bg-white print:pb-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <div className="absolute inset-0 pointer-events-none z-0 print:hidden" style={{ backgroundSize: '32px 32px', backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)' }} />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-10 space-y-6 transition-all duration-300 ${isSidebarOpen ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
        
        {/* HEADER BERSIH (STANDAR ENTERPRISE) */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border-2 border-slate-100 p-4 sm:p-5 sm:px-7 shadow-sm flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)} 
              className="w-12 h-12 bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-200 rounded-2xl transition-all flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
            >
              <Menu className="w-6 h-6 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-slate-800 leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                ORDER <span className="text-indigo-600">HISTORY</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 hidden sm:block">Audit & Riwayat Transaksi Supabase</p>
            </div>
          </div>

          {/* Refresh Bersih (Icon Button Minimalis) */}
          <button
            type="button"
            onClick={loadOrdersFromDb}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Muat Ulang Transaksi"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {/* METRIK KARTU OMZET */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Omzet Sah</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Rp {totalOmzet.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{validCompletedOrders.length} Transaksi Selesai</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Tunai (Cash)</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Rp {totalCash.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Uang Fisik Kasir</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">QRIS Non-Tunai</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Rp {totalQris.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Masuk Rekening / e-Wallet</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TABEL TRANSAKSI */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-visible print:border-slate-300 print:shadow-none print:rounded-none">
          
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
            <div className="relative w-full lg:max-w-xs">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari ID, Pelanggan, Menu..." 
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-400 transition-colors shadow-inner" 
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode:</span>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                  <option value="all">Semua Data ({historyData.length})</option>
                  <option value="today">Hari Ini</option>
                  <option value="week">7 Hari Terakhir</option>
                  <option value="month">Bulan Ini</option>
                </select>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <button type="button" onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl hover:bg-rose-100 transition-colors shadow-sm cursor-pointer active:scale-95">
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button type="button" onClick={exportToExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer active:scale-95">
                <Download className="w-4 h-4" /> Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-10 sm:pb-0 min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 print:bg-slate-100 border-b border-slate-100 print:border-slate-300 text-[10px] font-black uppercase tracking-widest text-slate-400 print:text-slate-800">
                  <th className="p-4 pl-6 whitespace-nowrap">ID Transaksi</th>
                  <th className="p-4 whitespace-nowrap">Pelanggan</th>
                  <th className="p-4 whitespace-nowrap">Menu Utama</th>
                  <th className="p-4 whitespace-nowrap">Total & Bayar</th>
                  <th className="p-4 whitespace-nowrap text-center">Status</th>
                  <th className="p-4 pr-6 whitespace-nowrap text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-bold text-sm">
                      Memuat data transaksi dari Supabase...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-bold text-sm">
                      Belum ada transaksi di periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => {
                    const resolvedMenu = resolveOrderType(row);
                    const rawStatus = (row.stat || '').toLowerCase();
                    const isWaiting = rawStatus === 'pending' || rawStatus === 'waiting_verification';
                    const isCooking = rawStatus === 'cooking';
                    const isDone = rawStatus === 'selesai' || rawStatus === 'ready';
                    const isCancelled = rawStatus === 'cancelled' || rawStatus === 'dibatalkan' || rawStatus === 'batal';

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              {row.queueBadge}
                            </span>
                            <span className="font-mono text-xs font-black text-slate-800 block">{row.id}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-0.5 block">{row.date} • {row.time}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-slate-800 block uppercase">
                            {row.customerName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-black text-slate-900 block max-w-[280px] truncate">{resolvedMenu}</span>
                          {row.notes && (
                            <span className="text-[9px] font-bold text-slate-400 block mt-0.5 truncate max-w-[250px]">
                              {row.notes}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-black block mb-1 ${isCancelled ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {row.total}
                          </span>
                          <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${row.pay === 'QRIS' ? 'bg-sky-50 text-sky-600 border-sky-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                            {row.pay}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-full border print:border-slate-400
                            ${isCancelled
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : isWaiting 
                                ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                : isCooking
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : isDone 
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                    : 'bg-slate-100 text-slate-600 border-slate-200'} print:text-black print:bg-transparent`}>
                            {isCancelled ? 'Dibatalkan' : isWaiting ? 'Menunggu' : isCooking ? 'Dimasak' : isDone ? 'Selesai' : row.stat}
                          </span>
                        </td>
                        
                        <td className="p-4 pr-6 text-center relative print:hidden">
                          <button 
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === row.id ? null : row.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          {activeDropdown === row.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute right-8 top-10 z-20 w-36 bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button type="button" onClick={() => { setSelectedOrder(row); setActiveDropdown(null); }} className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left cursor-pointer">
                                  <Eye className="w-3.5 h-3.5" /> Lihat Detail
                                </button>
                                <button type="button" onClick={() => handlePrintStruk(row)} className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-colors text-left cursor-pointer">
                                  <Printer className="w-3.5 h-3.5" /> Cetak Struk
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button type="button" onClick={() => handleDelete(row.id)} className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" /> Hapus Baris
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-b-3xl print:hidden">
            <span className="text-[10px] font-bold text-slate-400">Total: {filteredData.length} Catatan Masuk Database</span>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL PESANAN */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Detail Transaksi</h3>
                  <p className="font-mono text-xs font-bold text-indigo-600 mt-0.5">{selectedOrder.queueBadge} • {selectedOrder.id}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <div className="flex justify-between items-end pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Pelanggan</p>
                  <p className="text-sm font-black text-slate-800 uppercase">{selectedOrder.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Waktu</p>
                  <p className="text-xs font-bold text-slate-600">{selectedOrder.date} • {selectedOrder.time}</p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rincian Menu</p>
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex justify-between text-xs font-black text-slate-800">
                        <span>{it.qty}x {it.name}</span>
                        <span>Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                  {selectedOrder.notes && (
                    <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Catatan: "{selectedOrder.notes}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-bold text-slate-600">
                  {resolveOrderType(selectedOrder)}
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Bayar</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white">{selectedOrder.total}</span>
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-700 text-slate-300 bg-slate-800">{selectedOrder.pay}</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => handlePrintStruk(selectedOrder)} 
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL ADMIN SIDEBAR */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

    </div>
  );
}