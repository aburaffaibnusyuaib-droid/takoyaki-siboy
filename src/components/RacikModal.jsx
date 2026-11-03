'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check, Ban, Leaf, Flame, Store } from 'lucide-react';

/* ================= VECTOR FOOD ICONS ================= */
const SausageHorizontalIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="8" width="18" height="8" rx="4" />
    <path d="M8 8v8" />
    <path d="M12 8v8" />
    <path d="M16 8v8" />
  </svg>
);

const BeefSteakIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 6.5C17.5 4 13.5 3 9 4.5S3 9 3 13.5c0 4.5 3.5 7.5 8 7.5s9.5-3 9.5-7.5c0-2.5-.5-5-1.5-7z" />
    <ellipse cx="10" cy="11.5" rx="2.5" ry="1.8" fill="currentColor" fillOpacity="0.2" />
    <path d="M14 9.5c1.5 1 2.5 3 1.5 5" />
    <path d="M7 16c1.5.5 3 0 4-.5" />
  </svg>
);

const CrabIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="14" rx="5" ry="4" />
    <path d="M7 11c-2-3-4-2-4 1 0 2 2 3 4 2" />
    <path d="M17 11c2-3 4-2 4 1 0 2-2 3-4 2" />
    <path d="M6 15l-3 2" />
    <path d="M6 17l-2 3" />
    <path d="M18 15l3 2" />
    <path d="M18 17l2 3" />
  </svg>
);

const CheeseWedgeIcon = ({ className = 'w-4.5 h-4.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 18h18L18 8 3 13v5z" />
    <path d="M3 13l15-5" />
    <circle cx="8" cy="15.5" r="1" fill="currentColor" />
    <circle cx="14" cy="14" r="1.3" fill="currentColor" />
    <circle cx="12" cy="11" r="0.8" fill="currentColor" />
  </svg>
);

const KatsuobushiIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 8c3-3 7 0 9-1s4 4 1 5-6 1-8 3-4-4-2-7z" />
    <path d="M11 16c2-2 5 0 7-1" />
  </svg>
);

const TomatoIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="14" r="7.5" />
    <path d="M12 6.5V3" />
    <path d="M9.5 5.5c1.5 1 2.5 1 2.5 1s1 0 2.5-1" />
  </svg>
);

const MayoSwirlIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 9c2.5-3 5.5 3 8 0s4-3 8 0" />
    <path d="M4 15c2.5-3 5.5 3 8 0s4-3 8 0" />
  </svg>
);

const DEFAULT_TOPPINGS = [
  { id: '1', name: 'Katsuobushi', status: 'Aman' },
  { id: '2', name: 'Keju Mozza', status: 'Aman' },
  { id: '3', name: 'Sosis Ayam', status: 'Menipis' },
  { id: '4', name: 'Crabstick', status: 'Aman' },
  { id: '5', name: 'Kornet Gurih', status: 'Habis' }
];

export default function MenuModal({ product, onClose, onAddToCart, isOpenStore = true }) {
  const [quantity, setQuantity] = useState(product?.quantity || 1);
  const [selectedToppings, setSelectedToppings] = useState(product?.toppings || []);
  const [pakaiSayur, setPakaiSayur] = useState(
    product?.sayur !== undefined ? !product.sayur.includes('Tanpa') : true
  );
  const [selectedSaus, setSelectedSaus] = useState(product?.saus || ['pedas', 'mayones']);
  const [catatan, setCatatan] = useState(product?.catatan || '');
  const [toppingsStock, setToppingsStock] = useState(DEFAULT_TOPPINGS);

  // 1. SINKRONISASI STOK TOPPING LIVE DARI SUPABASE
  useEffect(() => {
    let isMounted = true;

    const fetchToppings = async () => {
      try {
        const res = await fetch('/api/toppings', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setToppingsStock(json.data);

            // Bersihkan pilihan jika ada topping yang tiba-tiba berstatus 'Habis'
            const outOfStockNames = json.data
              .filter((t) => t.status === 'Habis')
              .map((t) => t.name);

            setSelectedToppings((prev) => 
              prev.filter((topName) => !outOfStockNames.includes(topName))
            );
          }
        }
      } catch (e) {
        console.warn('Gagal memuat topping real-time, menggunakan data fallback.');
      }
    };

    fetchToppings();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (product) {
      setQuantity(product.quantity || 1);
      setSelectedToppings(product.toppings || []);
      setPakaiSayur(product.sayur !== undefined ? !product.sayur.includes('Tanpa') : true);
      setSelectedSaus(product.saus || ['pedas', 'mayones']);
      setCatatan(product.catatan || '');
    }
  }, [product]);

  if (!product) return null;

  const unitPrice = product.numericPrice || product.unitPrice || 6000;
  const totalPrice = unitPrice * quantity;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Helper Ikon Fleksibel untuk topping lama maupun topping baru
  const getToppingIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('sosis')) return <SausageHorizontalIcon className="w-4 h-4 text-orange-500" />;
    if (n.includes('kornet') || n.includes('daging') || n.includes('beef')) return <BeefSteakIcon className="w-4 h-4 text-rose-700" />;
    if (n.includes('crab') || n.includes('kepiting')) return <CrabIcon className="w-4 h-4 text-red-500" />;
    if (n.includes('keju') || n.includes('mozza') || n.includes('cheese')) return <CheeseWedgeIcon className="w-4.5 h-4.5 text-amber-500" />;
    if (n.includes('katsuobushi') || n.includes('cakalang') || n.includes('ikan')) return <KatsuobushiIcon className="w-4 h-4 text-yellow-700" />;
    return <Flame className="w-4 h-4 text-amber-500" />;
  };

  const sausOptions = [
    { 
      id: 'pedas', 
      label: 'Saus Pedas', 
      icon: <Flame className="w-4 h-4 text-red-600 stroke-[2.2]" />,
      activeStyle: 'border-red-600 text-red-700 bg-red-50',
      checkStyle: 'bg-red-600'
    },
    { 
      id: 'tomat', 
      label: 'Saus Tomat', 
      icon: <TomatoIcon className="w-4 h-4 text-rose-600" />,
      activeStyle: 'border-rose-500 text-rose-700 bg-rose-50',
      checkStyle: 'bg-rose-500'
    },
    { 
      id: 'mayones', 
      label: 'Mayones', 
      icon: <MayoSwirlIcon className="w-4 h-4 text-amber-500" />,
      activeStyle: 'border-amber-400 text-amber-700 bg-amber-50',
      checkStyle: 'bg-amber-400'
    },
    { 
      id: 'tanpasaus', 
      label: 'Tanpa Saus', 
      icon: <Ban className="w-4 h-4 text-slate-400 stroke-[2.2]" />,
      activeStyle: 'border-slate-400 text-slate-600 bg-slate-50',
      checkStyle: 'bg-slate-500'
    },
  ];

  const handleToggleTopping = (name, isHabis) => {
    if (!isOpenStore || isHabis) return;
    if (name === 'polos' || name === 'Tanpa Topping') {
      setSelectedToppings(['Tanpa Topping']);
      return;
    }
    let updated = selectedToppings.filter((item) => item !== 'polos' && item !== 'Tanpa Topping');
    if (updated.includes(name)) {
      updated = updated.filter((item) => item !== name);
    } else {
      updated.push(name);
    }
    setSelectedToppings(updated);
  };

  const handleToggleSaus = (id) => {
    if (!isOpenStore) return;
    if (id === 'tanpasaus') {
      setSelectedSaus(['tanpasaus']);
      return;
    }
    let updated = selectedSaus.filter((item) => item !== 'tanpasaus');
    if (updated.includes(id)) {
      updated = updated.filter((item) => item !== id);
    } else {
      updated.push(id);
    }
    setSelectedSaus(updated);
  };

  const handleAdd = () => {
    if (!isOpenStore) return;

    const orderData = {
      ...product,
      quantity,
      unitPrice,
      totalPrice,
      toppings: selectedToppings.length > 0 ? selectedToppings : ['Tanpa Topping'],
      sayur: pakaiSayur ? 'Pakai Sayur (Kol & Daun Bawang)' : 'Tanpa Sayur',
      saus: selectedSaus.length > 0 ? selectedSaus : ['tanpasaus'],
      catatan,
      editingIndex: product.editingIndex,
    };

    if (onAddToCart) onAddToCart(orderData);
    onClose();
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 relative text-slate-800 cursor-default"
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0">
              <Image 
                src={product.image || '/produk.jpg'} 
                alt={product.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {product.name}
              </h3>
              <p className="text-sm text-red-600 font-black mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {product.price || `Rp ${unitPrice.toLocaleString('id-ID')}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="group w-9 h-9 rounded-full bg-slate-100 hover:bg-red-600 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 hover:scale-105 shadow-sm cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 stroke-[2.5]" />
          </button>
        </div>

        {/* Banner Peringatan Jika Toko Sedang Tutup */}
        {!isOpenStore && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center gap-2 text-rose-800 text-[11px] font-bold">
            <Store className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Gerai sedang tutup. Menu ini hanya dalam mode pratinjau dan tidak dapat dipesan.</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-7 scrollbar-hide bg-[#fcfcfc]">
          
          {/* Section 1: Pilihan Topping */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-black uppercase text-slate-900 tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                PILIH ISIAN / TOPPING
              </label>
              <span className="text-[10px] text-slate-400 font-bold">Bisa racik campur</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {toppingsStock.map((topping) => {
                const isHabis = topping.status === 'Habis';
                const isSelected = selectedToppings.includes(topping.name);

                return (
                  <button
                    key={topping.id || topping.name}
                    disabled={isHabis || !isOpenStore}
                    onClick={() => handleToggleTopping(topping.name, isHabis)}
                    type="button"
                    className={`group py-2.5 px-3.5 rounded-full border transition-all duration-200 flex items-center justify-between text-left active:scale-[0.98] ${
                      isHabis || !isOpenStore
                        ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : isSelected
                          ? 'border-amber-500 text-amber-900 bg-amber-50 shadow-sm cursor-pointer'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div className="flex items-center justify-center w-6 h-6 shrink-0">
                        {getToppingIcon(topping.name)}
                      </div>
                      <div className="truncate">
                        <span className={`font-serif text-[13px] block truncate ${isSelected ? 'font-black' : 'font-bold'} ${isHabis ? 'line-through' : ''}`}>
                          {topping.name}
                        </span>
                        {topping.status === 'Menipis' && (
                          <span className="text-[8px] font-black uppercase text-amber-600 tracking-widest block leading-none">Menipis</span>
                        )}
                        {isHabis && (
                          <span className="text-[8px] font-black uppercase text-red-500 tracking-widest block leading-none">Habis</span>
                        )}
                      </div>
                    </div>
                    {isSelected && !isHabis && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-inner bg-amber-500">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Pilihan Polos / Tanpa Topping */}
              <button
                type="button"
                disabled={!isOpenStore}
                onClick={() => handleToggleTopping('Tanpa Topping', false)}
                className={`group py-2.5 px-3.5 rounded-full border transition-all duration-200 flex items-center justify-between text-left active:scale-[0.98] ${
                  !isOpenStore
                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                    : selectedToppings.includes('Tanpa Topping') || selectedToppings.includes('polos')
                      ? 'border-slate-400 text-slate-700 bg-slate-100 shadow-sm cursor-pointer'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-6 h-6">
                    <Ban className="w-4 h-4 text-slate-400 stroke-[2.2]" />
                  </div>
                  <span className="font-serif text-[13px] font-bold">Tanpa Topping</span>
                </div>
                {(selectedToppings.includes('Tanpa Topping') || selectedToppings.includes('polos')) && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-inner bg-slate-500">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Sayuran */}
          <div className="space-y-3.5">
            <div className="px-1">
              <label className="text-sm font-black uppercase text-slate-900 tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SAYURAN (KOL & BAWANG)
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!isOpenStore}
                onClick={() => setPakaiSayur(true)}
                className={`py-2.5 px-3.5 rounded-full border transition-all duration-200 flex items-center justify-between text-left active:scale-[0.98] ${
                  !isOpenStore
                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                    : pakaiSayur 
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50 shadow-sm cursor-pointer' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-6 h-6">
                    <Leaf className={`w-4.5 h-4.5 stroke-[2.2] ${pakaiSayur ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                  <span className={`font-serif text-[13px] ${pakaiSayur ? 'font-black' : 'font-bold'}`}>Pakai Sayur</span>
                </div>
                {pakaiSayur && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                  </div>
                )}
              </button>
              
              <button
                type="button"
                disabled={!isOpenStore}
                onClick={() => setPakaiSayur(false)}
                className={`py-2.5 px-3.5 rounded-full border transition-all duration-200 flex items-center justify-between text-left active:scale-[0.98] ${
                  !isOpenStore
                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                    : !pakaiSayur 
                      ? 'border-slate-400 text-slate-600 bg-slate-50 shadow-sm cursor-pointer' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-6 h-6">
                    <Ban className="w-4.5 h-4.5 stroke-[2.2] text-slate-400" />
                  </div>
                  <span className={`font-serif text-[13px] ${!pakaiSayur ? 'font-black' : 'font-bold'}`}>Tanpa Sayur</span>
                </div>
                {!pakaiSayur && (
                  <div className="w-4 h-4 rounded-full bg-slate-500 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Saus */}
          <div className="space-y-3.5">
            <div className="px-1">
              <label className="text-sm font-black uppercase text-slate-900 tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                PILIHAN SAUS
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {sausOptions.map((saus) => {
                const isSelected = selectedSaus.includes(saus.id);

                return (
                  <button
                    key={saus.id}
                    disabled={!isOpenStore}
                    onClick={() => handleToggleSaus(saus.id)}
                    type="button"
                    className={`group py-2.5 px-3.5 rounded-full border transition-all duration-200 flex items-center justify-between text-left active:scale-[0.98] ${
                      !isOpenStore
                        ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : isSelected
                          ? `${saus.activeStyle} shadow-sm cursor-pointer`
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm shadow-slate-100/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-6 h-6">
                        {saus.icon}
                      </div>
                      <span className={`font-serif text-[13px] ${isSelected ? 'font-black' : 'font-bold'}`}>
                        {saus.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-inner ${saus.checkStyle}`}>
                        <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Catatan */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 block px-1 font-serif">Catatan Khusus (Opsional):</label>
            <textarea
              disabled={!isOpenStore}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Sausnya dipisah ya bang..."
              rows={2}
              className={`w-full bg-white border border-slate-200 rounded-3xl p-4 text-xs font-serif text-slate-800 placeholder:text-slate-400 transition-all resize-none shadow-sm ${
                !isOpenStore ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
              }`}
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 bg-white flex items-center justify-between gap-3 shrink-0 rounded-b-[2rem] z-10 relative border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-full border border-slate-100 shrink-0">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-40 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
              disabled={quantity <= 1 || !isOpenStore}
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="font-black text-sm text-slate-900 w-4 text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 flex items-center justify-center text-white transition-colors shadow-sm shadow-red-500/30 cursor-pointer disabled:cursor-not-allowed"
              disabled={!isOpenStore}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {isOpenStore ? (
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-5 rounded-full text-xs font-black tracking-widest uppercase flex items-center justify-between transition-all active:scale-[0.98] shadow-lg shadow-red-600/25 cursor-pointer"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <span>{product.editingIndex !== undefined ? 'SIMPAN PERUBAHAN' : 'TAMBAH KE KERANJANG'}</span>
              <span className="bg-white/20 px-2.5 py-1 rounded-full text-white font-black backdrop-blur-sm">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 bg-slate-200 border border-slate-300 text-slate-400 py-4 px-5 rounded-full text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 cursor-not-allowed select-none"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <Store className="w-4 h-4 text-slate-400" />
              <span>GERAI SEDANG TUTUP</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}