'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu'; 
import AboutUs from '@/components/AboutUs';
import Footer from '@/components/Footer';
import RacikModal from '@/components/RacikModal';
import Cart from '@/components/Cart';
import Qris from '@/components/Qris'; 

export default function Home() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isQrisOpen, setIsQrisOpen] = useState(false);
  const [pendingOrderInfo, setPendingOrderInfo] = useState(null);

  // SINKRONISASI STATUS GERAI DARI SUPABASE (REAL-TIME POLLING)
  const fetchStoreStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/store-status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.isOpen === 'boolean') {
          setIsOpen(data.isOpen);
          try {
            localStorage.setItem('siboy_store_status', JSON.stringify(data.isOpen));
          } catch (e) {}
        }
      }
    } catch (err) {
      // Fallback lokal jika ada gangguan koneksi sesaat
      try {
        const saved = localStorage.getItem('siboy_store_status');
        if (saved !== null) setIsOpen(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Ambil status pertama kali saat halaman dibuka
    fetchStoreStatus();

    // Cek berkala tiap 10 detik dan saat tab browser aktif kembali
    const interval = setInterval(fetchStoreStatus, 4000);
    window.addEventListener('focus', fetchStoreStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchStoreStatus);
    };
  }, [fetchStoreStatus]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

  const handleSelectPackage = (selectedItem) => {
    setEditingIndex(null);
    setSelectedProduct(selectedItem);
    setIsModalOpen(true);
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
    setSelectedProduct(cartItems[index]);
    setIsCartOpen(false);
    setIsModalOpen(true);
  };

  const handleAddToCart = (orderData) => {
    if (!isOpen) return;

    if (editingIndex !== null) {
      setCartItems((prev) => {
        const updated = [...prev];
        updated[editingIndex] = orderData;
        return updated;
      });
      setEditingIndex(null);
    } else {
      setCartItems((prev) => [...prev, orderData]);
    }
    setIsCartOpen(true);
    setIsModalOpen(false);
  };

  const handleUpdateQuantity = (index, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      updated[index].totalPrice = updated[index].unitPrice * newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // CHECKOUT: Simpan langsung ke Supabase dengan status 'waiting_verification'
  const processCheckout = async (orderMeta) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Ambil nomor antrean harian dan Order ID berbasis tanggal
      let qNo = '#01';
      let orderId = `SB-${Date.now().toString().slice(-4)}`;

      try {
        const qRes = await fetch('/api/orders?action=next_queue');
        const qJson = await qRes.json();
        if (qJson.success) {
          qNo = qJson.formattedQ;
          orderId = qJson.generatedOrderId;
        }
      } catch (e) {}

      // Format detail racikan item untuk database
      const formattedDbItems = cartItems.map((item) => {
        const topStr = Array.isArray(item.toppings) ? item.toppings.join(', ') : (item.toppings || 'Polos');
        const sausStr = Array.isArray(item.saus) ? item.saus.join(' + ') : (item.saus || 'Tanpa Saus');
        const vegStr = item.sayur || 'Pakai Sayur';
        const racikanDesc = `(${topStr} | ${vegStr} | ${sausStr})`;

        return {
          name: `${item.name} ${racikanDesc}`,
          quantity: item.quantity,
          price: item.unitPrice,
        };
      });

      const customerNotes = orderMeta.notes ? `Catatan: ${orderMeta.notes} | ` : '';
      const finalNotes = `[${qNo}] ${customerNotes}Self-Order Web | Metode: ${orderMeta.paymentMethod}`;

      // 2. Simpan ke Supabase via POST /api/orders
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          customerName: `${orderMeta.customerName} (Self-Order)`,
          customerPhone: '-',
          totalPrice: cartTotal,
          status: 'waiting_verification',
          notes: finalNotes,
          items: formattedDbItems,
        }),
      });

      if (!orderRes.ok) {
        const errJson = await orderRes.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal mengirim pesanan ke server, silakan coba lagi');
      }

      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        throw new Error(orderJson.message || 'Gagal mengirim pesanan ke server, silakan coba lagi');
      }

      // 3. Cadangan sinkronisasi lokal
      const now = new Date();
      const formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      const localOrder = {
        id: orderId,
        qNo,
        name: orderMeta.customerName,
        customerName: `${orderMeta.customerName} (Self-Order)`,
        date: formattedDate,
        time: timeStr,
        timestamp: now.getTime(),
        rawTotal: cartTotal,
        total: `Rp ${cartTotal.toLocaleString('id-ID')}`,
        pay: orderMeta.paymentMethod,
        status: 'waiting_verification',
        stat: 'Menunggu',
        notes: finalNotes,
        items: formattedDbItems.map(it => ({
          name: it.name,
          qty: it.quantity,
          price: it.price,
          toppings: it.name.includes('(') ? it.name.split('(')[1]?.replace(')', '') : 'Polos',
          veg: '',
          spicy: ''
        }))
      };

      try {
        const history = JSON.parse(localStorage.getItem('siboy_order_history') || '[]');
        const kitchen = JSON.parse(localStorage.getItem('siboy_kitchen_orders') || '[]');
        localStorage.setItem('siboy_order_history', JSON.stringify([localOrder, ...history]));
        localStorage.setItem('siboy_kitchen_orders', JSON.stringify([...kitchen, localOrder]));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}

      handleClearCart();
      setIsCartOpen(false);
      setIsQrisOpen(false);
      setIsSubmitting(false);

      // 4. Arahkan pembeli ke karcis live tracker
      router.push(`/ticket?id=${orderId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message || 'Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070a11] text-slate-100 overflow-x-hidden relative flex flex-col">
      <Navbar 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)} 
      />

      <Hero 
        isOpen={isOpen}
        onOrderClick={() => {
          const el = document.getElementById('menu');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      {/* Menu Section */}
      <Menu 
        isOpen={isOpen}
        onSelectPackage={handleSelectPackage} 
      />

      {/* Section About Us */}
      <AboutUs />

      {/* Footer */}
      <Footer />

      {/* Modal Racik Menu */}
      {isModalOpen && selectedProduct && (
        <RacikModal 
          key={editingIndex !== null ? `edit-${editingIndex}` : `new-${selectedProduct.id || 'product'}`}
          product={selectedProduct} 
          isEditMode={editingIndex !== null}
          isOpenStore={isOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIndex(null);
          }} 
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Modal QRIS */}
      <Qris 
        isOpen={isQrisOpen}
        onClose={() => setIsQrisOpen(false)}
        totalPrice={cartTotal}
        onConfirmPayment={() => {
          if (pendingOrderInfo) processCheckout(pendingOrderInfo);
        }} 
      />

      {/* Drawer Keranjang Pesanan */}
      <Cart 
        isOpen={isCartOpen}
        isOpenStore={isOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onEditItem={handleEditItem}
        onClearCart={handleClearCart}
        onCheckoutCash={(info) => processCheckout(info)}
        onCheckoutQris={(info) => {
          setPendingOrderInfo(info);
          setIsQrisOpen(true);
        }}
      />
    </main>
  );
}