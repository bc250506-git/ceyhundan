"use client";

import React, { useEffect, useState, useRef } from "react";
import { Phone, ChevronDown } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";

interface FloatingContactProps {
  defaultPhone?: string;
  stickyPanelOpen?: boolean;
}

interface ContactOption {
  number: string;
  name: string;
}

export default function FloatingContact({ defaultPhone, stickyPanelOpen = false }: FloatingContactProps) {
  const pathname = usePathname();
  const [showPhoneOptions, setShowPhoneOptions] = useState(false);
  const [showWhatsAppOptions, setShowWhatsAppOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const whatsappDropdownRef = useRef<HTMLDivElement>(null);

  const phoneOptions: ContactOption[] = [
    { number: "5323850420", name: "Ceyhun Çiftçi" },
    { number: "3562280444", name: "Ceyhun Emlak" }
  ];

  const whatsappOptions: ContactOption[] = [
    { number: "5323850420", name: "Ceyhun Çiftçi" },
    { number: "5366067071", name: "Berk Çiftçi" }
  ];

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Listen for sticky panel toggle events
    const handlePanelToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      setPanelOpen(customEvent.detail?.isOpen || false);
    };

    window.addEventListener("stickyPanelToggle", handlePanelToggle);
    return () => window.removeEventListener("stickyPanelToggle", handlePanelToggle);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        phoneDropdownRef.current &&
        !phoneDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPhoneOptions(false);
      }

      if (
        whatsappDropdownRef.current &&
        !whatsappDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWhatsAppOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePhoneClick = (number: string) => {
    try {
      const path = window.location.pathname;
      const slugOrId = path.startsWith('/ilan/') ? path.replace('/ilan/', '').split('/')[0] : null;
      fetch('/api/listings/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: slugOrId, slug: slugOrId, action: 'contact' })
      }).catch(() => { });
    } catch (e) { }

    window.location.href = `tel:+90${number}`;
    setShowPhoneOptions(false);
  };

  const handleWhatsAppClick = (number: string) => {
    try {
      const path = window.location.pathname;
      const slugOrId = path.startsWith('/ilan/') ? path.replace('/ilan/', '').split('/')[0] : null;
      fetch('/api/listings/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: slugOrId, slug: slugOrId, action: 'contact' })
      }).catch(() => { });
    } catch (e) { }

    window.location.href = `https://wa.me/90${number}`;
    setShowWhatsAppOptions(false);
  };

  const isIlanDetail = pathname?.startsWith('/ilan/') && pathname !== '/ilan';

  if (isIlanDetail) {
    return null;
  }

  return (
    <>
      {/* Sol alt köşe - Telefon ve WhatsApp */}
      <div className={`fixed bottom-4 md:bottom-6 left-4 md:left-6 flex flex-row gap-2 z-50 transition-opacity duration-300 ${panelOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}>
        <div className="relative" ref={phoneDropdownRef}>
          <button
            onClick={() => setShowPhoneOptions(!showPhoneOptions)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center"
            title="Ara"
            aria-label="Telefon ile ara"
          >
            <Phone size={18} strokeWidth={2} />
            <ChevronDown size={14} className={`ml-1 transition-transform ${showPhoneOptions ? 'rotate-180' : ''}`} />
          </button>

          {showPhoneOptions && (
            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
              <div className="font-medium text-gray-700 mb-1 px-2">Telefon</div>
              {phoneOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handlePhoneClick(option.number)}
                  className="flex items-center w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded-md"
                >
                  <Phone size={14} className="mr-2 text-blue-600" />
                  <div>
                    <div className="text-sm">
                      {option.number.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "0 ($1) $2 $3 $4")}
                    </div>
                    <div className="text-xs text-gray-500">{option.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={whatsappDropdownRef}>
          <button
            onClick={() => setShowWhatsAppOptions(!showWhatsAppOptions)}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center"
            title="WhatsApp"
            aria-label="WhatsApp ile mesaj gönder"
          >
            <FaWhatsapp size={18} />
            <ChevronDown size={14} className={`ml-1 transition-transform ${showWhatsAppOptions ? 'rotate-180' : ''}`} />
          </button>

          {showWhatsAppOptions && (
            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
              <div className="font-medium text-gray-700 mb-1 px-2">WhatsApp</div>
              {whatsappOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleWhatsAppClick(option.number)}
                  className="flex items-center w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded-md"
                >
                  <FaWhatsapp size={14} className="mr-2 text-green-500" />
                  <div>
                    <div className="text-sm">
                      {option.number.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "0 ($1) $2 $3 $4")}
                    </div>
                    <div className="text-xs text-gray-500">{option.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}