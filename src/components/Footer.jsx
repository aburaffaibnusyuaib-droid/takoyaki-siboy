'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const router = useRouter();
  const holdTimerRef = useRef(null);

  // Navigasi ke login admin
  const goToAdmin = () => {
    router.push('/admin/login');
  };

  // Logika tahan 2 detik (mouse & layar sentuh HP)
  const handleHoldStart = () => {
    holdTimerRef.current = setTimeout(() => {
      goToAdmin();
    }, 2000);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
  };

  // Koordinat Lokasi Kedai Takoyaki Siboy
  const latitude = -6.2278553;
  const longitude = 106.8902775;
  
  // TAUTAN PENTING
  const mapsUrl = `https://www.google.com/maps/place/Takoyaki+Siboy/@${latitude},${longitude},17z/data=!4m6!3m5!1s0x2e69f30071bc92e5:0x124b61898b4d6013!8m2!3d${latitude}!4d${longitude}!16s%2Fg%2F11zxjnlr6z`;
  const waUrl = "https://wa.me/628567637987?text=Halo%20Takoyaki%20Siboy,%20saya%20mau%20pesan%20takoyaki%20untuk%20diambil%20di%20gerai!";
  const igUrl = "https://instagram.com/takoyaki_siboy";

  return (
    <footer 
      id="lokasi" 
      className="w-full bg-[#070a11] text-slate-100 pt-8 sm:pt-10 pb-7 relative z-30 shadow-[0_-25px_50px_rgba(7,10,17,1)] overflow-hidden border-t border-slate-800/60"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Ornamen Ombak Jepang (Seigaiha) */}
      <svg className="absolute bottom-0 right-0 w-96 h-96 opacity-[0.02] text-white pointer-events-none select-none translate-x-1/4 translate-y-1/4" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <path d="M0 50 A 25 25 0 0 1 50 50 A 25 25 0 0 1 100 50 M12.5 50 A 12.5 12.5 0 0 1 37.5 50 M62.5 50 A 12.5 12.5 0 0 1 87.5 50" strokeWidth="2" />
        <path d="M25 75 A 25 25 0 0 1 75 75 M37.5 75 A 12.5 12.5 0 0 1 62.5 75" strokeWidth="2" />
        <path d="M-25 75 A 25 25 0 0 1 25 75 M75 75 A 25 25 0 0 1 125 75" strokeWidth="2" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 pb-8 border-b border-slate-800/80">
          
          {/* ==================== KIRI: LOKASI OUTLET ==================== */}
          <div className="w-full lg:w-5/12 flex flex-col justify-between gap-3.5 shrink-0">
            <div>
              <div className="space-y-1.5 mb-3.5">
                <h4 
                  className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-white uppercase tracking-tight"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-red-500 shrink-0"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  LOKASI OUTLET KAMI
                </h4>
                
                <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                  Jl. Cipinang Muara I No.4, RT.15/RW.3, Jatinegara. <br className="hidden sm:block"/>
                  <strong className="text-amber-400 font-bold">(Patokan: Depan area SMKN 50 Jakarta)</strong>
                </p>
              </div>

              {/* MAPS INTERAKTIF */}
              <div className="w-full h-56 sm:h-64 lg:h-56 rounded-2xl overflow-hidden border border-slate-800 bg-[#0d121f] shadow-2xl relative group transition-all duration-300 hover:border-red-500/40">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 bg-[#070a11]/90 hover:bg-red-600 text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-slate-700/80 hover:border-red-500 shadow-xl transition-all duration-300 active:scale-95 backdrop-blur-md"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <span>BUKA DI MAPS</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-20 bg-transparent cursor-pointer"
                  title="Klik untuk membuka titik lokasi di Google Maps"
                ></a>

                <iframe
                  title="Lokasi Kedai Takoyaki Siboy"
                  src={`https://maps.google.com/maps?q=${latitude},${longitude}&hl=id&z=16&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full block pointer-events-none transition-transform duration-700 group-hover:scale-105"
                ></iframe>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-medium text-left">
              *Klik peta atau tombol untuk membuka rute langsung di aplikasi Google Maps.
            </p>
          </div>

          {/* ==================== KANAN: BRAND & INFO ==================== */}
          <div className="w-full lg:w-7/12 flex flex-col justify-between gap-5">
            
            <div className="space-y-3">
              {/* Header Brand */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-slate-200/90 shadow-md flex items-center justify-center p-2 shrink-0 overflow-hidden transition-transform duration-300 hover:scale-105">
                  <img 
                    src="/logosiboy.png" 
                    alt="Logo Takoyaki Siboy" 
                    className="w-full h-full object-contain select-none"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.jpg";
                    }}
                  />
                </div>

                <div className="space-y-0.5">
                  <h3 
                    className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    TAKOYAKI <span className="text-red-600">SIBOY</span>
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
                Jajanan takoyaki otentik khas street food. Luar garing, dalam lumer, diracik fresh langsung dari wajan pemanggang sesaat setelah dipesan.
              </p>
            </div>

            {/* NAVIGASI PINTAS */}
            <div className="space-y-1.5 pt-1">
              <h4 
                className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                NAVIGASI PINTAS
              </h4>
              <ul className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs font-bold text-slate-300">
                <li><a href="#hero" className="hover:text-red-500 transition-colors">Beranda</a></li>
                <li><a href="#menu" className="hover:text-red-500 transition-colors">Menu Takoyaki</a></li>
                <li><a href="#about-us" className="hover:text-red-500 transition-colors">Tentang Kami</a></li>
                <li><a href="#lokasi" className="hover:text-red-500 transition-colors">Titik Lokasi</a></li>
              </ul>
            </div>

            {/* ACTION BUTTONS (Jam Operasional, WhatsApp Bisnis, & Instagram) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {/* Jam Operasional */}
              <div 
                className="inline-flex items-center justify-center gap-1.5 bg-amber-400 border border-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase shadow-md transition-all duration-300 cursor-default"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>16.00 - 22.00 WIB</span>
              </div>

              {/* WhatsApp Bisnis */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 border border-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-300 shadow-md hover:-translate-y-0.5 active:scale-95"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <svg className="w-3.5 h-3.5 fill-slate-950 shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WHATSAPP BISNIS</span>
              </a>

              {/* Instagram */}
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-pink-600 hover:bg-pink-500 border border-pink-600 text-white px-4 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all duration-300 shadow-md hover:-translate-y-0.5 active:scale-95 group"
                aria-label="Instagram Takoyaki Siboy"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>takoyaki_siboy</span>
              </a>
            </div>

          </div>
        </div>

        {/* BOTTOM CREDIT */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-500">
          
          {/* PINTU RAHASIA ADMIN */}
          <p 
            onClick={(e) => {
              if (e.detail >= 3) {
                goToAdmin();
              }
            }}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className="cursor-default select-none transition-colors hover:text-slate-400"
            title="Takoyaki Siboy"
          >
            © {new Date().getFullYear()} Takoyaki Siboy. All rights reserved.
          </p>

          <a
            href="https://instagram.com/rwapaaa77"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
          >
            <span>Designed & Developed by</span>
            <span 
              className="font-black text-slate-300 group-hover:text-red-500 underline underline-offset-4 decoration-slate-700 group-hover:decoration-red-500 transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              @rwapaaa77
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}