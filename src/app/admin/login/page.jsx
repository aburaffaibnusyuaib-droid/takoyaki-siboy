'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  // Ubah judul tab browser secara dinamis di Client Component
  useEffect(() => {
    document.title = 'Login Petugas Kasir | Siboy POS';
  }, []);

  // PIN rahasia untuk akses admin
  const SECRET_PIN = '1234';

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === SECRET_PIN) {
      // Simpan session sederhana di browser
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 flex flex-col justify-center items-center p-4 relative font-sans overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundSize: '32px 32px',
        backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)'
      }} />

      {/* Tombol Kembali */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      {/* Card Login */}
      <div className="w-full max-w-sm bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-xl text-center z-10 relative">
        <div className="w-14 h-14 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-600 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <h1 
          className="text-2xl font-black uppercase tracking-tight text-slate-800 mb-1"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Akses Merchant
        </h1>
        <p className="text-xs font-bold text-slate-400 mb-8">
          Masukkan 4 digit PIN untuk membuka dashboard Takoyaki Siboy.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setError(false);
                setPin(e.target.value);
              }}
              placeholder="••••"
              className="w-full tracking-[1em] text-center text-3xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs font-black text-red-500 animate-bounce">
              PIN salah! Silakan coba lagi.
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <KeyRound className="w-4 h-4" />
            <span>Masuk Dashboard</span>
          </button>
        </form>

        <p className="text-[10px] font-bold text-slate-400 mt-6 bg-slate-50 py-2 rounded-lg border border-slate-100">
          Default PIN Demo: <span className="text-red-500">1234</span>
        </p>
      </div>
    </div>
  );
}