'use client';

import React from 'react';
import { Store, Quote } from 'lucide-react';

/* =========================================================================
   CUSTOM VECTOR ICONS (Clean, Bold Line Art, Seimbang & Tajam)
   ========================================================================= */

// Visual 1: Kobaran Api & Lentera (Bara Merah & Bayang Hitam)
const FireFlamesIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M12 2c1 3.5 3.5 5 5 7.5 1.5 2.5 1.5 5.5 0 8a7 7 0 1 1-10-8c.5 2 2 3 3 3 0-3.5 1-7 2-10.5z"
      fill="#ef4444"
      fillOpacity="0.25"
    />
    <path
      d="M12 13c1 1.5 2 2 2 3.5a2.5 2.5 0 0 1-5 0c0-1.5 1-2.5 3-3.5z"
      fill="#0f172a"
      stroke="#0f172a"
      strokeWidth="1.8"
    />
  </svg>
);

// Visual 3: Wajan Cetakan Besi Takoyaki Asli & Tusukan Pembalik
const RealTakoyakiPanIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="15"
      rx="3.5"
      fill="#10b981"
      fillOpacity="0.15"
    />
    <circle cx="7.5" cy="9.5" r="1.8" fill="currentColor" fillOpacity="0.35" />
    <circle cx="12" cy="9.5" r="1.8" fill="currentColor" fillOpacity="0.35" />
    <circle cx="16.5" cy="9.5" r="1.8" fill="currentColor" fillOpacity="0.35" />
    <circle cx="7.5" cy="15.5" r="1.8" fill="currentColor" fillOpacity="0.35" />
    <circle cx="12" cy="15.5" r="1.8" fill="currentColor" fillOpacity="0.35" />
    <circle cx="16.5" cy="15.5" r="1.8" fill="currentColor" fillOpacity="0.35" />
    <line x1="18" y1="2" x2="13.5" y2="6.5" strokeWidth="2.2" stroke="#059669" />
  </svg>
);

export default function AboutUs() {
  return (
    <section
      id="about-us"
      className="w-full bg-[#faf9f6] text-slate-900 relative z-20 overflow-hidden select-none scroll-mt-16 sm:scroll-mt-20"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* 1. TRANSISI KURVA ORGANIK ATAS: Mengalir Halus dari Menu Merah */}
      <div className="w-full overflow-hidden leading-none -mt-10 sm:-mt-14 relative z-10 select-none pointer-events-none">
        <svg
          className="relative block w-full h-14 sm:h-20 text-[#faf9f6] drop-shadow-[0_-6px_14px_rgba(0,0,0,0.05)]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C180,95 380,110 600,95 C820,80 1020,35 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* 2. TEKSTUR LATAR BELAKANG: Grid Tekstur Kertas Washi + Ambient Glow Lembut */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-45"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />
      <div className="absolute top-1/4 -left-16 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 -right-16 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-1 sm:pt-3 pb-8 sm:pb-10 relative z-10">
        
        {/* HEADER SECTION: Clean, Tegas, & Mengakar */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-6 h-[2px] bg-red-600 rounded-full"></span>
            <span
              className="text-[11px] font-black uppercase tracking-[0.25em] text-red-600"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Cerita & Filosofi
            </span>
            <span className="w-6 h-[2px] bg-red-600 rounded-full"></span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            DARI TITIK BALIK, LAHIR{' '}
            <span className="relative inline-block text-red-600">
              TAKOYAKI SIBOY
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-red-600/25 rounded-full"></span>
            </span>
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
            Ikhtiar keluarga yang dibangun bersama di atas wajan panas, tekad bangkit dari nol, dan rasa yang dijaga dengan jujur.
          </p>
        </div>

        {/* AREA ATAS: LOGO MANDIRI & PROFIL FOUNDER SEJAJAR */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center mb-8 sm:mb-9">
          
          {/* SISI KIRI: DISPLAY LOGO OTENTIK */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600/15 rounded-full blur-xl scale-95 pointer-events-none" />

              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white border-2 border-slate-200/90 shadow-sm flex items-center justify-center p-2.5 overflow-hidden">
                <img
                  src="/logosiboy.png"
                  alt="Takoyaki Siboy Logo"
                  className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-center p-2">
                  <Store className="w-8 h-8 text-red-600 mb-1" />
                  <span className="text-[10px] font-black uppercase text-slate-800">
                    Takoyaki Siboy
                  </span>
                </div>
              </div>

              {/* Tag Tahun & Kota */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs border border-slate-700 whitespace-nowrap">
                Est. 2022 • Jakarta
              </div>
            </div>
          </div>

          {/* SISI KANAN: KARTU PROFIL PENDIRI & KELUARGA */}
          <div className="sm:col-span-8 bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Pendiri & Pasangan Hidup
                </span>
                <h3
                  className="text-base font-black uppercase tracking-tight text-slate-900"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Mas Imam & Mba Fira
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200/60 px-2.5 py-0.5 rounded-md">
                Lapak Netap Jakarta
              </span>
            </div>

            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Beliau berdua adalah sepasang suami istri yang merintis Takoyaki Siboy dari titik nol. Berawal dari dorongan gerobak kaki lima di tepi jalan hingga kini menempati lapak tetap, keduanya menjaga komitmen adonan padat lembut dan racikan bumbu otentik.
            </p>

            {/* WADAH KUTIPAN FLEKSIBEL (Bisa diedit bebas kapan saja) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-left">
              <Quote className="w-3.5 h-3.5 text-red-500 mb-1 opacity-70" />
              <p className="text-[11px] font-semibold text-slate-700 italic leading-snug">
                &quot;Jualan makanan buat kami sederhana: rasa harus konsisten, takaran jujur, dan pembeli nggak boleh ngerasa rugi.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* AREA BAWAH: 3 PILAR DENGAN NARASI HUMAN-CENTERED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch pt-2">
          
          {/* PILAR 1: MERAH & HITAM LAMPION */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between relative pt-8 border-t-[3.5px] border-t-red-600 hover:shadow-xs transition-shadow">
            <div className="absolute -top-5 left-5 w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-xs ring-4 ring-[#faf9f6]">
              1
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-12">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                  Lentera Merah & Hitam
                </span>

                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-center shadow-2xs shrink-0">
                  <FireFlamesIcon className="w-5 h-5" />
                </div>
              </div>

              <h4
                className="text-sm font-black text-slate-900 tracking-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Bara Semangat & Masa Sulit
              </h4>

              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Warna merah menyala melambangkan kobaran tekad Mas Imam saat terkena dampak PHK di gudang Tambun demi menafkahi keluarga. Aksen hitamnya menjadi saksi masa-masa kelam yang kini perlahan berhasil dilewati bersama.
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 text-[10px] font-bold text-red-600">
              Bara yang menolak padam setelah badai PHK
            </div>
          </div>

          {/* PILAR 2: KOKI CILIK (SI BOY) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between relative pt-8 border-t-[3.5px] border-t-amber-500 hover:shadow-xs transition-shadow">
            <div className="absolute -top-5 left-5 w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs ring-4 ring-[#faf9f6]">
              2
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-12">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Panggilan &quot;Si Boy&quot;
                </span>

                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-center p-1 shadow-2xs shrink-0 overflow-hidden">
                  <img
                    src="/boy.png"
                    alt="Si Boy"
                    className="w-full h-full object-contain select-none"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <h4
                className="text-sm font-black text-slate-900 tracking-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Sumber Energi & Doa Anak
              </h4>

              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Nama &quot;Siboy&quot; diambil dari panggilan hangat kepada putra pertama mereka saat masih tinggal di Tambun. Tawa si kecil menjadi penguat di kala letih, sekaligus tumpuan doa agar usaha ini terus membawa berkah masa depan.
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 text-[10px] font-bold text-amber-700">
              Alasan utama untuk tak pernah menyerah
            </div>
          </div>

          {/* PILAR 3: WAJAN PEMANGGANG */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between relative pt-8 border-t-[3.5px] border-t-emerald-600 hover:shadow-xs transition-shadow">
            <div className="absolute -top-5 left-5 w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs ring-4 ring-[#faf9f6]">
              3
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-12">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Wajan Pemanggang
                </span>

                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shadow-2xs shrink-0">
                  <RealTakoyakiPanIcon className="w-5 h-5 text-emerald-700" />
                </div>
              </div>

              <h4
                className="text-sm font-black text-slate-900 tracking-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Kejujuran di Balik Wajan Panas
              </h4>

              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Pernah merasakan hidup susah membuat mereka pantang mengecewakan pembeli. Di atas wajan inilah janji dijaga: porsi takaran adonan harus padat, isian melimpah, dan selalu dipanggang dadakan panas saat dipesan.
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 text-[10px] font-bold text-emerald-700">
              Takaran jujur, rasa yang tak pernah ingkar
            </div>
          </div>

        </div>

      </div>

      {/* 4. SOLID SHAPE DIVIDER BAWAH: Menyambung Krem secara mulus ke Footer Hitam #070a11 */}
      <div className="w-full overflow-hidden leading-none bg-transparent select-none pointer-events-none mt-3 sm:mt-4">
        <svg
          className="relative block w-full h-7 sm:h-11 text-[#070a11]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C300,85 900,85 1200,0 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}