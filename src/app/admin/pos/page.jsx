'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Search, X, Plus, Minus, Check, Ban, Leaf, Flame, Store, 
  ShoppingCart, Trash2, CheckCircle2, Printer,
  Banknote, ScanLine, Menu, User, ChevronUp, Pencil
} from 'lucide-react';

import AdminSidebar from '@/components/AdminSidebar';

/* ================= VECTOR FOOD ICONS ================= */
const SausageHorizontalIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="8" width="18" height="8" rx="4" /><path d="M8 8v8" /><path d="M12 8v8" /><path d="M16 8v8" /></svg>
);
const BeefSteakIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 6.5C17.5 4 13.5 3 9 4.5S3 9 3 13.5c0 4.5 3.5 7.5 8 7.5s9.5-3 9.5-7.5c0-2.5-.5-5-1.5-7z" /><ellipse cx="10" cy="11.5" rx="2.5" ry="1.8" fill="currentColor" fillOpacity="0.2" /><path d="M14 9.5c1.5 1 2.5 3 1.5 5" /><path d="M7 16c1.5.5 3 0 4-.5" /></svg>
);
const CrabIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="14" rx="5" ry="4" /><path d="M7 11c-2-3-4-2-4 1 0 2 2 3 4 2" /><path d="M17 11c2-3 4-2 4 1 0 2-2 3-4 2" /><path d="M6 15l-3 2" /><path d="M6 17l-2 3" /><path d="M18 15l3 2" /><path d="M18 17l2 3" /></svg>
);
const CheeseWedgeIcon = ({ className = 'w-4.5 h-4.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 18h18L18 8 3 13v5z" /><path d="M3 13l15-5" /><circle cx="8" cy="15.5" r="1" fill="currentColor" /><circle cx="14" cy="14" r="1.3" fill="currentColor" /><circle cx="12" cy="11" r="0.8" fill="currentColor" /></svg>
);
const KatsuobushiIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 8c3-3 7 0 9-1s4 4 1 5-6 1-8 3-4-4-2-7z" /><path d="M11 16c2-2 5 0 7-1" /></svg>
);
const TomatoIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="14" r="7.5" /><path d="M12 6.5V3" /><path d="M9.5 5.5c1.5 1 2.5 1 2.5 1s1 0 2.5-1" /></svg>
);
const MayoSwirlIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 9c2.5-3 5.5 3 8 0s4-3 8 0" /><path d="M4 15c2.5-3 5.5 3 8 0s4-3 8 0" /></svg>
);

const TOPPING_ICON_MAP = {
  'Sosis Ayam': <SausageHorizontalIcon className="w-4 h-4 text-orange-500" />,
  'Kornet Gurih': <BeefSteakIcon className="w-4 h-4 text-rose-700" />,
  'Crabstick': <CrabIcon className="w-4 h-4 text-red-500" />,
  'Keju Mozza': <CheeseWedgeIcon className="w-4.5 h-4.5 text-amber-500" />,
  'Katsuobushi': <KatsuobushiIcon className="w-4 h-4 text-yellow-700" />,
};

/* ================= MODAL RACIK & EDIT PESANAN ================= */
function MenuModal({ product, editingItem, toppingsStock, onClose, onSave }) {
  if (!product && !editingItem) return null;

  const currentData = editingItem || product;

  const [quantity, setQuantity] = useState(editingItem ? editingItem.qty : 1);
  const [selectedToppings, setSelectedToppings] = useState(
    editingItem?.customs?.toppings?.filter((t) => !t.includes('Polos')) || []
  );
  const [pakaiSayur, setPakaiSayur] = useState(
    editingItem ? !editingItem.customs.veg.includes('Tanpa') : true
  );
  const [selectedSaus, setSelectedSaus] = useState(
    editingItem?.customs?.sauce || ['pedas', 'mayones']
  );
  const [spicyLevel, setSpicyLevel] = useState(
    editingItem?.customs?.spicyLevel || 'Level 2'
  );
  const [catatan, setCatatan] = useState(
    editingItem?.customs?.note || ''
  );

  const unitPrice = currentData.price || 6000;
  const totalPrice = unitPrice * quantity;

  const sausOptions = [
    { id: 'pedas', label: 'Saus Pedas', icon: <Flame className="w-4 h-4 text-red-600 stroke-[2.2]" />, activeStyle: 'border-red-600 text-red-700 bg-red-50', checkStyle: 'bg-red-600' },
    { id: 'tomat', label: 'Saus Tomat', icon: <TomatoIcon className="w-4 h-4 text-rose-600" />, activeStyle: 'border-rose-500 text-rose-700 bg-rose-50', checkStyle: 'bg-rose-500' },
    { id: 'mayones', label: 'Mayones', icon: <MayoSwirlIcon className="w-4 h-4 text-amber-500" />, activeStyle: 'border-amber-400 text-amber-700 bg-amber-50', checkStyle: 'bg-amber-400' },
    { id: 'tanpasaus', label: 'Tanpa Saus', icon: <Ban className="w-4 h-4 text-slate-400 stroke-[2.2]" />, activeStyle: 'border-slate-400 text-slate-600 bg-slate-50', checkStyle: 'bg-slate-500' },
  ];

  const handleToggleTopping = (name) => {
    if (name === 'Tanpa Topping') return setSelectedToppings(['Tanpa Topping']);
    let updated = selectedToppings.filter((item) => item !== 'Tanpa Topping');
    if (updated.includes(name)) updated = updated.filter((item) => item !== name);
    else updated.push(name);
    setSelectedToppings(updated);
  };

  const handleToggleSaus = (id) => {
    if (id === 'tanpasaus') return setSelectedSaus(['tanpasaus']);
    let updated = selectedSaus.filter((item) => item !== 'tanpasaus');
    if (updated.includes(id)) updated = updated.filter((item) => item !== id);
    else updated.push(id);
    setSelectedSaus(updated);
  };

  const handleSave = () => {
    const payload = {
      cartId: editingItem ? editingItem.cartId : Date.now(),
      id: currentData.id,
      name: currentData.name,
      pcs: currentData.pcs,
      price: unitPrice,
      qty: quantity,
      totalPrice,
      customs: {
        toppings: selectedToppings.length > 0 ? selectedToppings : ['Tanpa Topping (Polos)'],
        veg: pakaiSayur ? 'Pakai Sayur (Kol & Daun Bawang)' : 'Tanpa Sayur',
        sauce: selectedSaus.length > 0 ? selectedSaus : ['Tanpa Saus'],
        spicyLevel: selectedSaus.includes('pedas') ? spicyLevel : null,
        note: catatan,
      },
    };
    onSave(payload, !!editingItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                {editingItem ? 'EDIT MENU' : 'MENU BARU'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {currentData.name}
              </h3>
            </div>
            <p className="text-sm font-black text-red-600 mt-1">Rp {unitPrice.toLocaleString('id-ID')}</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"><X className="w-5 h-5 stroke-[2.5]" /></button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#fcfcfc] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* PILIH TOPPING */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-800 tracking-wider">PILIH TOPPING</label>
              <span className="text-[10px] text-slate-400 font-bold">Bisa Mix</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {toppingsStock.map((topping) => {
                const isHabis = topping.status === 'Habis';
                const isSelected = selectedToppings.includes(topping.name);
                const icon = TOPPING_ICON_MAP[topping.name] || <Flame className="w-4 h-4 text-amber-500" />;

                return (
                  <button 
                    key={topping.id} 
                    type="button" 
                    disabled={isHabis}
                    onClick={() => handleToggleTopping(topping.name)} 
                    className={`group py-2.5 px-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-left ${
                      isHabis 
                        ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                        : isSelected 
                          ? 'border-amber-500 text-amber-900 bg-amber-50 shadow-xs cursor-pointer' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-4 h-4 shrink-0">{icon}</div>
                      <div className="truncate">
                        <span className={`font-bold text-xs block truncate ${isHabis ? 'line-through' : ''}`}>{topping.name}</span>
                        {topping.status === 'Menipis' && <span className="text-[8px] font-black uppercase text-amber-600">Menipis</span>}
                        {isHabis && <span className="text-[8px] font-black uppercase text-red-500">Habis</span>}
                      </div>
                    </div>
                    {isSelected && !isHabis && (
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              <button 
                type="button" 
                onClick={() => handleToggleTopping('Tanpa Topping')} 
                className={`group py-2.5 px-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  selectedToppings.includes('Tanpa Topping') 
                    ? 'border-slate-400 text-slate-700 bg-slate-100 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-slate-400 stroke-[2.2]" />
                  <span className="font-bold text-xs">Tanpa Topping</span>
                </div>
                {selectedToppings.includes('Tanpa Topping') && (
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* SAYURAN */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-slate-800 tracking-wider">SAYURAN</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                onClick={() => setPakaiSayur(true)} 
                className={`group py-2.5 px-3 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${pakaiSayur ? 'border-emerald-500 text-emerald-800 bg-emerald-50' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <div className="flex items-center gap-2"><Leaf className={`w-4 h-4 ${pakaiSayur ? 'text-emerald-500' : 'text-slate-400'}`} /><span className="font-bold text-xs">Pakai Sayur</span></div>
                {pakaiSayur && <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white stroke-[3]" /></div>}
              </button>
              <button 
                type="button" 
                onClick={() => setPakaiSayur(false)} 
                className={`group py-2.5 px-3 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${!pakaiSayur ? 'border-slate-400 text-slate-700 bg-slate-100' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <div className="flex items-center gap-2"><Ban className="w-4 h-4 text-slate-400" /><span className="font-bold text-xs">Tanpa Sayur</span></div>
                {!pakaiSayur && <div className="w-3.5 h-3.5 rounded-full bg-slate-500 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white stroke-[3]" /></div>}
              </button>
            </div>
          </div>

          {/* SAUS & LEVEL */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-slate-800 tracking-wider">PILIHAN SAUS</label>
            <div className="grid grid-cols-2 gap-2">
              {sausOptions.map((saus) => (
                <button 
                  key={saus.id} 
                  type="button" 
                  onClick={() => handleToggleSaus(saus.id)} 
                  className={`group py-2.5 px-3 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${selectedSaus.includes(saus.id) ? `${saus.activeStyle}` : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  <div className="flex items-center gap-2"><div className="w-4 h-4">{saus.icon}</div><span className="font-bold text-xs">{saus.label}</span></div>
                  {selectedSaus.includes(saus.id) && <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${saus.checkStyle}`}><Check className="w-2.5 h-2.5 text-white stroke-[3]" /></div>}
                </button>
              ))}
            </div>

            {selectedSaus.includes('pedas') && (
              <div className="bg-red-50 p-3 rounded-xl border-2 border-red-100 flex flex-col justify-center mt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1.5">Level Kepedasan</p>
                <div className="flex gap-1.5 sm:gap-2">
                  {['Level 1', 'Level 2', 'Level 3'].map((lvl) => (
                    <button 
                      key={lvl} 
                      type="button" 
                      onClick={() => setSpicyLevel(lvl)} 
                      className={`flex-1 py-1.5 text-xs font-black uppercase rounded-xl border-2 transition-colors cursor-pointer ${spicyLevel === lvl ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-white text-red-600 border-red-200 hover:bg-red-100'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CATATAN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 px-1">Catatan Khusus:</label>
            <textarea 
              value={catatan} 
              onChange={(e) => setCatatan(e.target.value)} 
              placeholder="Contoh: Sausnya dipisah, agak garing..." 
              rows={2} 
              className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-400 resize-none" 
            />
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="p-3.5 sm:p-4 bg-white flex items-center justify-between gap-3 shrink-0 border-t border-slate-100">
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-600 active:scale-95 cursor-pointer"><Minus className="w-4 h-4 stroke-[2.5]" /></button>
            <span className="font-black text-sm text-slate-900 w-5 text-center">{quantity}</span>
            <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white active:scale-95 cursor-pointer"><Plus className="w-4 h-4 stroke-[2.5]" /></button>
          </div>
          <button 
            type="button" 
            onClick={handleSave} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-between shadow-md active:scale-[0.98] cursor-pointer transition-all"
          >
            <span>{editingItem ? 'SIMPAN PERUBAHAN' : 'TAMBAH PESANAN'}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-md text-[11px]">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= HALAMAN KASIR POS UTAMA ================= */
export default function POSPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const [baseUrl, setBaseUrl] = useState('');
  const [catalogMenus, setCatalogMenus] = useState([
    { id: 'M1', name: 'Porsi Kecil', pcs: '5 pcs', price: 6000, desc: 'Takoyaki gurih hangat 5 butir.', badge: 'Camilan', emoji: '🍢' },
    { id: 'M2', name: 'Porsi Besar', pcs: '10 pcs', price: 12000, desc: 'Porsi favorit 10 butir mantap kenyang.', badge: 'Paling Laris', emoji: '🐙' },
    { id: 'M3', name: 'Porsi Special', pcs: '15 pcs', price: 17000, desc: 'Porsi puas 15 butir melimpah rame-rame.', badge: 'Porsi Puas', emoji: '🔥' }
  ]);
  const [toppingsStock, setToppingsStock] = useState([
    { id: 1, name: 'Katsuobushi', status: 'Aman' },
    { id: 2, name: 'Keju Mozza', status: 'Aman' },
    { id: 3, name: 'Sosis Ayam', status: 'Menipis' },
    { id: 4, name: 'Crabstick', status: 'Aman' },
    { id: 5, name: 'Kornet Gurih', status: 'Habis' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('Take Away');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Nomor antrean harian otomatis (#01, #02, dst)
  const [queueDisplay, setQueueDisplay] = useState('#01');
  const [lastOrderId, setLastOrderId] = useState('');

  // Sinkronkan nomor antrean hari ini dari Supabase
  const syncTodayQueue = async () => {
    try {
      const res = await fetch('/api/orders?action=next_queue');
      const json = await res.json();
      if (json.success) {
        setQueueDisplay(json.formattedQ);
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Judul Tab Browser Standar Industri POS
    document.title = 'Kasir Terminal POS | Siboy POS';

    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
      localStorage.setItem('admin_auth', 'true');

      try {
        const savedToppings = localStorage.getItem('siboy_toppings');
        if (savedToppings) {
          setToppingsStock(JSON.parse(savedToppings));
        }
      } catch (e) {}
    }

    syncTodayQueue();

    fetch('/api/menu')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const formatted = json.data.map((m) => ({
            id: m.id,
            slug: m.slug,
            name: m.name,
            pcs: m.pcs,
            price: m.price,
            desc:
              m.slug === 'kecil'
                ? 'Takoyaki gurih hangat 5 butir.'
                : m.slug === 'besar'
                ? 'Porsi favorit 10 butir mantap kenyang.'
                : 'Porsi puas 15 butir melimpah rame-rame.',
            badge:
              m.badge ||
              (m.slug === 'besar'
                ? 'Paling Laris'
                : m.slug === 'kecil'
                ? 'Camilan'
                : 'Porsi Puas'),
            emoji: m.slug === 'kecil' ? '🍢' : m.slug === 'besar' ? '🐙' : '🔥',
          }));
          setCatalogMenus(formatted);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveMenu = (itemData, isEditing) => {
    if (isEditing) {
      setCart((prev) => prev.map((item) => (item.cartId === itemData.cartId ? itemData : item)));
      setEditingItem(null);
    } else {
      setCart((prev) => [...prev, itemData]);
      setSelectedProduct(null);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsMobileCartOpen(false);
  };

  const updateQty = (cartId, delta) =>
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  const removeFromCart = (cartId) => setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  const totalAkhir = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const initPayment = (mode) => {
    if (cart.length === 0) return alert('Keranjang belanja masih kosong!');
    
    let resolvedName = customerName.trim();
    if (!resolvedName) {
      resolvedName = `Pelanggan ${queueDisplay}`;
      setCustomerName(resolvedName);
    }

    setPaymentMode(mode);
    if (mode === 'qris') setPaymentAmount(totalAkhir);
    else setPaymentAmount('');
  };

  const processPayment = async () => {
    if (paymentMode === 'cash' && Number(paymentAmount) < totalAkhir) {
      return alert('Nominal uang tunai kurang!');
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    // Dapatkan Order ID unik dan nomor antrean hari ini
    let currentQueueStr = queueDisplay;
    let orderId = `SB-${Date.now().toString().slice(-4)}`;

    try {
      const qRes = await fetch('/api/orders?action=next_queue');
      const qJson = await qRes.json();
      if (qJson.success) {
        currentQueueStr = qJson.formattedQ;
        orderId = qJson.generatedOrderId;
      }
    } catch (e) {}

    const resolvedName = customerName.trim() || `Pelanggan ${currentQueueStr}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const formattedDbItems = cart.map((item) => {
      const topStr = item.customs.toppings.join(', ');
      const sausStr =
        item.customs.sauce.join(', ') +
        (item.customs.spicyLevel ? ` (${item.customs.spicyLevel})` : '');
      const vegStr = item.customs.veg;
      const racikanDesc = `(${topStr} | ${vegStr} | ${sausStr})`;

      return {
        name: `${item.name} ${racikanDesc}`,
        quantity: item.qty,
        price: item.price,
      };
    });

    const combinedNotes = cart.map((item) => item.customs.note).filter(Boolean).join('; ');
    const finalNotes = `[${currentQueueStr}] ${combinedNotes ? combinedNotes + ' | ' : ''}Metode: ${paymentMode === 'cash' ? 'TUNAI' : 'QRIS'}`;

    // 1. Simpan ke Supabase dengan status 'pending'
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          customerName: `${resolvedName} (${orderType})`,
          totalPrice: totalAkhir,
          status: 'pending',
          notes: finalNotes,
          items: formattedDbItems,
        }),
      });
    } catch (e) {
      console.error('Error saat menyimpan ke Supabase:', e);
    }

    // 2. Sinkronkan ke memory localStorage untuk fallback
    const newKitchenOrder = {
      id: orderId,
      qNo: currentQueueStr,
      time: formattedTime,
      timer: 'Baru Masuk',
      status: 'pending',
      name: resolvedName,
      customerName: resolvedName,
      type: cart.map((item) => `${item.qty}x ${item.name}`).join(' + '),
      toppings: cart.flatMap((item) => item.customs.toppings).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      veg: cart[0]?.customs.veg || 'Pakai Sayur',
      spicy: cart[0]?.customs.spicyLevel ? `Pedas (${cart[0].customs.spicyLevel})` : 'Normal',
      note: finalNotes,
      total: `Rp ${totalAkhir.toLocaleString('id-ID')}`,
      pay: paymentMode === 'cash' ? 'CASH' : 'QRIS',
      items: cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
    };

    try {
      const existingKitchen = JSON.parse(localStorage.getItem('siboy_kitchen_orders') || '[]');
      localStorage.setItem('siboy_kitchen_orders', JSON.stringify([...existingKitchen, newKitchenOrder]));
    } catch (e) {}

    setLastOrderId(orderId);
    setQueueDisplay(currentQueueStr);
    setPaymentMode(null);
    setIsMobileCartOpen(false);
    setShowSuccessModal(true);
    setIsSubmitting(false);
  };

  const resetOrder = () => {
    setCart([]); 
    setCustomerName(''); 
    setPaymentAmount(''); 
    setShowSuccessModal(false);
    syncTodayQueue(); // Ambil nomor antrean berikutnya dari server
  };

  const formatSaus = (sauceArr, level) => {
    const labels = sauceArr.map((s) =>
      s === 'pedas' ? 'Saus Pedas' : s === 'tomat' ? 'Saus Tomat' : s === 'mayones' ? 'Mayones' : 'Tanpa Saus'
    );
    let text = labels.join(' + ');
    if (level) text += ` (${level})`;
    return text;
  };

  const filteredMenus = catalogMenus.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayCustomer = customerName.trim() || `Pelanggan ${queueDisplay}`;

  const CartInnerContent = ({ isMobile = false }) => (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shadow-xs shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-none">Rincian Menu</h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded truncate max-w-[140px]">
                {queueDisplay} • {displayCustomer}
              </span>
            </div>
            <p className="text-[9.5px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
              {orderType} • {cart.length} Menu Terpilih
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cart.length > 0 && (
            <button 
              type="button" 
              onClick={() => setCart([])}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Hapus
            </button>
          )}
          {isMobile && (
            <button 
              type="button" 
              onClick={() => setIsMobileCartOpen(false)} 
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {cart.length === 0 ? (
          <div className="h-full py-16 flex flex-col items-center justify-center text-slate-300 gap-2">
            <ShoppingCart className="w-12 h-12 stroke-[1]" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Keranjang Kosong</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.cartId} className="bg-white border-2 border-slate-100 rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                  <span className="text-xs font-black text-red-600">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                    title="Edit Topping & Saus"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => removeFromCart(item.cartId)} 
                    className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                <span className="inline-flex text-[8px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                  ✨ {item.customs.toppings.join(', ')}
                </span>
                <span className="inline-flex text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                  🥬 {item.customs.veg}
                </span>
                {item.customs.sauce[0] !== 'Tanpa Saus' && (
                  <span className="inline-flex text-[8px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                    🔥 {formatSaus(item.customs.sauce, item.customs.spicyLevel)}
                  </span>
                )}
              </div>

              {item.customs.note && (
                <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                  "{item.customs.note}"
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[9px] font-black uppercase text-slate-400">Porsi:</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button type="button" onClick={() => updateQty(item.cartId, -1)} className="w-6 h-6 bg-white rounded flex items-center justify-center text-slate-600 shadow-xs cursor-pointer"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.cartId, 1)} className="w-6 h-6 bg-red-600 text-white rounded flex items-center justify-center shadow-xs cursor-pointer"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-xs">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Tagihan:</span>
          <span className="text-2xl font-black text-red-600 tracking-tight leading-none">Rp {totalAkhir.toLocaleString('id-ID')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button" 
            onClick={() => initPayment('cash')} 
            className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200 text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
          >
            <Banknote className="w-4 h-4" /> Bayar Tunai
          </button>
          <button 
            type="button" 
            onClick={() => initPayment('qris')} 
            className="flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white border-2 border-sky-500 shadow-xs text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
          >
            <ScanLine className="w-4 h-4" /> Via QRIS
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 flex flex-col lg:flex-row relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundSize: '32px 32px', backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)' }} />

      {/* AREA KIRI: KATALOG MENU */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 lg:pr-[410px] w-full">
        
        <div className="px-3.5 sm:px-8 py-3 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-10 h-10 bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-100 rounded-xl transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xs shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight leading-none text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  SIBOY<span className="text-amber-500">POS</span>
                </h2>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                  Terminal Kasir • Antrean Hari Ini: <span className="text-amber-600 font-black">{queueDisplay}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-32 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-full pl-8 pr-2.5 py-1.5 outline-none focus:border-slate-800" 
              />
            </div>

            <button
              type="button"
              onClick={() => setIsMobileCartOpen(true)}
              className="lg:hidden relative w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center shadow-sm active:scale-95 cursor-pointer shrink-0"
              title="Buka Keranjang"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* BAR DATA PELANGGAN */}
        <div className="px-3.5 sm:px-8 py-2.5 bg-white border-b border-slate-200/80 shadow-xs shrink-0 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              type="button" 
              onClick={() => setOrderType('Take Away')} 
              className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer border-2 ${
                orderType === 'Take Away' 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              Take Away
            </button>
            <button 
              type="button" 
              onClick={() => setOrderType('Dine In')} 
              className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer border-2 ${
                orderType === 'Dine In' 
                  ? 'bg-red-600 border-red-600 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              Dine In
            </button>
          </div>

          <div className="relative flex-1">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Nama Pelanggan (Default: Pelanggan ${queueDisplay})...`} 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)} 
              className="w-full bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800 rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-slate-800" 
            />
          </div>
        </div>

        {/* KATALOG MENU */}
        <div className="flex-1 p-3.5 sm:p-8 pb-32 lg:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl">
            {filteredMenus.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedProduct(item)} 
                className="bg-white rounded-2xl p-4 border-2 border-slate-100 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between active:scale-[0.98] shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-2xl flex items-center justify-center shrink-0 border border-amber-100">
                    {item.emoji}
                  </div>
                  <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md tracking-wider">
                    {item.pcs}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-slate-900 leading-tight">{item.name}</h3>
                    {item.badge === 'Paling Laris' && (
                      <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">Laris</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mt-1">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 block uppercase">Harga</span>
                    <span className="text-base font-black text-red-600">Rp {item.price.toLocaleString('id-ID')}</span>
                  </div>
                  <button 
                    type="button" 
                    className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 flex items-center justify-center text-slate-700 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FLOATING BAR MOBILE */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-3 inset-x-3 z-[130] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-950 text-white rounded-2xl p-3 shadow-2xl border-2 border-slate-800 space-y-2.5">
              <div 
                onClick={() => setIsMobileCartOpen(true)} 
                className="flex items-center justify-between px-1 cursor-pointer active:opacity-80"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                      {queueDisplay} • {displayCustomer} <ChevronUp className="w-3 h-3" />
                    </span>
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase">
                      {orderType} • Ketuk untuk Cek Menu
                    </span>
                  </div>
                </div>
                <span className="text-base font-black text-white">Rp {totalAkhir.toLocaleString('id-ID')}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => initPayment('cash')} 
                  className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase py-2.5 rounded-xl shadow-xs active:scale-95 cursor-pointer"
                >
                  <Banknote className="w-4 h-4" /> Bayar Tunai
                </button>

                <button 
                  type="button" 
                  onClick={() => initPayment('qris')} 
                  className="flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase py-2.5 rounded-xl shadow-xs active:scale-95 cursor-pointer"
                >
                  <ScanLine className="w-4 h-4" /> Via QRIS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PANEL CART DESKTOP */}
      <div className="hidden lg:block fixed inset-y-0 right-0 w-[410px] p-4 z-40">
        <div className="w-full h-full rounded-[2rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
          <CartInnerContent isMobile={false} />
        </div>
      </div>

      {/* DRAWER CART MOBILE */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-[150] flex flex-col justify-end">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileCartOpen(false)} 
          />
          <div className="relative z-10 w-full h-[85vh] bg-white rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <CartInnerContent isMobile={true} />
          </div>
        </div>
      )}

      {/* MODAL RACIKAN */}
      <MenuModal 
        product={selectedProduct} 
        editingItem={editingItem} 
        toppingsStock={toppingsStock} 
        onClose={() => {
          setSelectedProduct(null);
          setEditingItem(null);
        }} 
        onSave={handleSaveMenu} 
      />

      {/* MODAL BAYAR TUNAI */}
      {paymentMode === 'cash' && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden relative shadow-2xl p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-black uppercase text-slate-800 tracking-tight leading-none">Kalkulator Tunai</h2>
                <p className="text-[9.5px] font-bold text-slate-400 mt-1 uppercase">
                  {queueDisplay} • {displayCustomer}
                </p>
              </div>
              <button type="button" onClick={() => setPaymentMode(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Tagihan</p>
              <p className="text-xl font-black text-red-600">Rp {totalAkhir.toLocaleString('id-ID')}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rp</span>
                <input 
                  type="number" 
                  autoFocus 
                  placeholder="Ketik uang tunai..." 
                  value={paymentAmount || ''} 
                  onChange={(e) => setPaymentAmount(Number(e.target.value))} 
                  className="w-full bg-white border-2 border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => setPaymentAmount(totalAkhir)} className="py-2 text-xs font-black uppercase rounded-lg border-2 border-slate-100 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer">Uang Pas</button>
                <button type="button" onClick={() => setPaymentAmount(20000)} className="py-2 text-xs font-black uppercase rounded-lg border-2 border-slate-100 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer">Rp 20.000</button>
                <button type="button" onClick={() => setPaymentAmount(50000)} className="py-2 text-xs font-black uppercase rounded-lg border-2 border-slate-100 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer">Rp 50.000</button>
                <button type="button" onClick={() => setPaymentAmount(100000)} className="py-2 text-xs font-black uppercase rounded-lg border-2 border-slate-100 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer">Rp 100.000</button>
              </div>
            </div>

            {paymentAmount >= totalAkhir && totalAkhir > 0 && (
              <div className="flex items-center justify-between mb-4 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Kembalian:</span>
                <span className="text-base font-black text-emerald-600">Rp {(paymentAmount - totalAkhir).toLocaleString('id-ID')}</span>
              </div>
            )}

            <button 
              type="button" 
              onClick={processPayment} 
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Selesaikan Transaksi'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL BAYAR QRIS */}
      {paymentMode === 'qris' && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden relative shadow-2xl p-6 animate-in zoom-in-95 flex flex-col items-center text-center">
            <button type="button" onClick={() => setPaymentMode(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
            
            <div className="bg-sky-100 text-sky-700 rounded-xl px-3 py-1 mb-2.5 flex items-center gap-1.5">
              <ScanLine className="w-3.5 h-3.5" /> <span className="text-[9px] font-black uppercase tracking-widest">QRIS DANA ASLI</span>
            </div>

            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</p>
            <p className="text-2xl font-black text-sky-600 mb-1">Rp {totalAkhir.toLocaleString('id-ID')}</p>
            <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase">
              {queueDisplay} • {displayCustomer}
            </p>

            <div className="bg-white p-2 border-2 border-dashed border-slate-200 rounded-2xl mb-3 shadow-inner relative w-48 h-48 overflow-hidden">
              <img src="/qrasli.jpg" alt="QRIS DANA" className="w-full h-full object-contain" />
            </div>

            <p className="text-[10px] font-bold text-slate-500 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
              Pastikan pelanggan mentransfer sesuai nominal sebelum klik verifikasi lunas.
            </p>

            <button 
              type="button" 
              onClick={processPayment} 
              disabled={isSubmitting}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Memverifikasi...' : 'Verifikasi Lunas'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES & CETAK STRUK */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden relative shadow-2xl p-5 sm:p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 my-auto">
            
            <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            
            <span className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tighter leading-none mb-1">
              {queueDisplay}
            </span>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-800 mb-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>Transaksi Berhasil!</h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mb-3">A/N: <span className="text-slate-800 uppercase font-black">{displayCustomer}</span> ({orderType})</p>

            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-3 mb-3 flex flex-col items-center w-full">
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Scan Karcis Pelanggan (Live Tracker)</p>
              <div className="bg-white p-1.5 rounded-lg shadow-xs border border-slate-200 mb-1.5">
                <QRCodeSVG value={`${baseUrl}/ticket?id=${lastOrderId}`} size={96} level={"H"} />
              </div>
              <button 
                type="button" 
                onClick={() => window.open(`/ticket?id=${lastOrderId}`, '_blank')} 
                className="text-[9px] sm:text-[10px] font-black uppercase text-indigo-600 hover:underline cursor-pointer"
              >
                🔗 Buka Karcis Pesanan ({lastOrderId})
              </button>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 text-left text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-500 text-[11px]">
                <span>Total</span><span className="font-black text-slate-800">Rp {totalAkhir.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500 text-[11px]">
                <span>Bayar ({paymentMode === 'cash' ? 'Tunai' : 'QRIS'})</span><span className="font-black text-slate-800">Rp {Number(paymentAmount).toLocaleString('id-ID')}</span>
              </div>
              {paymentMode === 'cash' && (
                <div className="flex justify-between font-black text-emerald-600 pt-1 border-t border-slate-200 text-[11px]">
                  <span>Kembalian</span><span>Rp {(paymentAmount - totalAkhir).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-1.5">
              <button type="button" onClick={() => window.print()} className="w-full flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase py-2.5 rounded-xl cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Cetak Struk
              </button>
              <button type="button" onClick={resetOrder} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase py-3 rounded-xl shadow-xs cursor-pointer">
                Order Baru
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Sidebar Admin */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </div>
  );
}