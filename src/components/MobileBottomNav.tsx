"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, Phone } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin panel routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isHomeActive = pathname === "/";
  const isSearchActive = pathname.startsWith("/ilanlar") || pathname.startsWith("/ilan");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-all">
      <div className="grid grid-cols-4 items-center justify-items-center max-w-md mx-auto">
        {/* 1. Ana Sayfa */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center space-y-1 py-1 px-2 rounded-xl transition-all duration-300 w-full ${
            isHomeActive ? "text-primary font-bold scale-105" : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
        >
          <Home size={22} className={isHomeActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
          <span className="text-[11px] leading-none tracking-tight">Ana Sayfa</span>
        </Link>

        {/* 2. Arama */}
        <Link
          href="/ilanlar"
          className={`flex flex-col items-center justify-center space-y-1 py-1 px-2 rounded-xl transition-all duration-300 w-full ${
            isSearchActive ? "text-primary font-bold scale-105" : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
        >
          <Search size={22} className={isSearchActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
          <span className="text-[11px] leading-none tracking-tight">Arama</span>
        </Link>

        {/* 3. WhatsApp */}
        <a
          href="https://wa.me/905323850420?text=Merhaba%20Ceyhun%20Gayrimenkul,%20bilgi%20almak%20istiyorum."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center space-y-1 py-1 px-2 rounded-xl text-emerald-600 hover:text-emerald-700 font-medium transition-all duration-300 w-full active:scale-95"
        >
          <div className="relative">
            <MessageCircle size={22} className="stroke-[2px] text-emerald-600 fill-emerald-50" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <span className="text-[11px] leading-none tracking-tight font-bold text-emerald-700">WhatsApp</span>
        </a>

        {/* 4. Ara */}
        <a
          href="tel:05323850420"
          className="flex flex-col items-center justify-center space-y-1 py-1 px-2 rounded-xl text-primary hover:text-primary/90 font-medium transition-all duration-300 w-full active:scale-95"
        >
          <div className="bg-primary text-white p-1.5 rounded-full shadow-sm">
            <Phone size={16} className="stroke-[2.5px]" />
          </div>
          <span className="text-[11px] leading-none tracking-tight font-bold text-primary">Hemen Ara</span>
        </a>
      </div>
    </div>
  );
}
