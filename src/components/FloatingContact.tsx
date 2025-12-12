"use client";

import React, { useEffect, useState, useRef } from "react";
import { Phone, Car, ChevronDown } from "lucide-react";
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
  const [showTaxiModal, setShowTaxiModal] = useState(false);
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
  
  const taxiNumber = "05433850420";
  const taxiNumberFormatted = "0 (543) 385 04 20";

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
    window.location.href = `tel:+90${number}`;
    setShowPhoneOptions(false);
  };

  const handleWhatsAppClick = (number: string) => {
    window.location.href = `https://wa.me/90${number}`;
    setShowWhatsAppOptions(false);
  };

  const handleTaxiClick = () => {
    if (isMobile) {
      // Mobil cihazlarda doğrudan ara
      window.location.href = `tel:+90${taxiNumber}`;
    } else {
      // Desktopta modal göster
      setShowTaxiModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(taxiNumberFormatted);
    alert("Telefon numarası kopyalandı!");
  };

  return (
    <>
      {/* Sol alt köşe - Telefon, WhatsApp ve Taksi */}
      <div className={`fixed bottom-4 md:bottom-6 left-4 md:left-6 flex flex-row gap-2 z-50 transition-opacity duration-300 ${
        panelOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
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

        <button
          onClick={handleTaxiClick}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center gap-2"
          title="Taksi Çağır"
          aria-label="Taksi çağır"
        >
          <Car size={18} strokeWidth={2} />
          <span className="font-medium text-sm">Alo Taksi</span>
        </button>
      </div>

      {/* Taksi Modal - Desktopta gösterilir */}
      {showTaxiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full">
                <Car size={32} className="text-yellow-600" />
              </div>
            </div>
            
            <h2 className="text-3xl font-headings font-bold text-center mb-2 text-gray-900">Alo Taksi</h2>
            <p className="text-gray-600 text-center mb-8 text-sm">Taksi çağırmak için aşağıdaki numarayı arayınız:</p>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-6 mb-8 text-center">
              <p className="text-4xl font-bold text-yellow-600 font-headings">{taxiNumberFormatted}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Kopyala
              </button>
              <button
                onClick={() => setShowTaxiModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}