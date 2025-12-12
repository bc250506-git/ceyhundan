"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Facebook, Instagram, X, Calculator } from "lucide-react";
import Image from "next/image";
import KrediHesaplayici from "./KrediHesaplayici";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
}

interface CachedRates {
  data: ExchangeRate[];
  timestamp: number;
}

export default function StickyPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);

        // Check if we have cached data from today
        const cached = localStorage.getItem("exchangeRates");
        const now = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000;

        if (cached) {
          const cachedData: CachedRates = JSON.parse(cached);
          const timeDiff = now - cachedData.timestamp;

          // If cache is less than 24 hours old, use it
          if (timeDiff < ONE_DAY) {
            setRates(cachedData.data);
            setIsLoading(false);
            return;
          }
        }

        // Cache expired or doesn't exist, fetch fresh data
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );

        if (!response.ok) {
          throw new Error("Kur bilgileri alınamadı");
        }

        const data = await response.json();

        // Select main currencies and get their TRY value
        const mainCurrencies = [
          { code: "USD", name: "Amerikan Doları" },
          { code: "EUR", name: "Euro" },
          { code: "GBP", name: "İngiliz Sterlini" },
        ];

        const exchangeRates = mainCurrencies
          .map((curr) => ({
            code: curr.code,
            name: curr.name,
            rate: Math.round((data.rates["TRY"] / data.rates[curr.code]) * 100) / 100,
          }))
          .filter((rate) => rate.rate > 0);

        // Save to localStorage
        const cacheData: CachedRates = {
          data: exchangeRates,
          timestamp: now,
        };
        localStorage.setItem("exchangeRates", JSON.stringify(cacheData));

        setRates(exchangeRates);
      } catch (err) {
        console.error("Error fetching exchange rates:", err);

        // Fallback: try to use old cached data if available
        const cached = localStorage.getItem("exchangeRates");
        if (cached) {
          const cachedData: CachedRates = JSON.parse(cached);
          setRates(cachedData.data);
        } else {
          setRates([
            { code: "USD", name: "Amerikan Doları", rate: 34.50 },
            { code: "EUR", name: "Euro", rate: 36.20 },
            { code: "GBP", name: "İngiliz Sterlini", rate: 43.10 },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Broadcast to other components
    if (typeof window !== "undefined") {
      const event = new CustomEvent("stickyPanelToggle", { detail: { isOpen: newState } });
      window.dispatchEvent(event);
    }
  };

  return (
    <>
      {/* Sticky Button */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={handleToggle}
          className="bg-primary hover:bg-primary/90 text-white p-3 rounded-r-lg shadow-lg transition-all duration-300 flex items-center justify-center"
          aria-label="Panel aç/kapat"
          title="Hızlı Linkler"
        >
          <ChevronRight
            size={20}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => handleToggle()}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed left-0 top-0 h-screen w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-32 pb-6 px-6">
          {/* Close Button */}
          <button
            onClick={handleToggle}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Kapat"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>

          {/* Header */}
          <h2 className="text-2xl font-headings font-bold text-gray-900 mb-8">
            Hızlı Linkler
          </h2>

          {/* Exchange Rates Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="inline-block w-1 h-5 bg-primary rounded-full mr-2"></span>
              Güncel Kurlar
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              </div>
            ) : rates.length > 0 ? (
              <div className="space-y-3">
                {rates.map((rate) => (
                  <div
                    key={rate.code}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm">
                        1 {rate.code}
                      </span>
                      <span className="font-bold text-primary text-sm">
                        ₺{rate.rate.toLocaleString("tr-TR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Kur bilgileri kullanılamıyor
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8" />

          {/* Platforms Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="inline-block w-1 h-5 bg-primary rounded-full mr-2"></span>
              İlan Siteleri
            </h3>

            <div className="space-y-3">
              <a
                href="https://ceyhun.sahibinden.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Image 
                    src="/images/logos/sahibinden.png" 
                    width={20} 
                    height={20} 
                    alt="Sahibinden" 
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800 text-sm">Sahibinden</p>
                  <p className="text-xs text-gray-500">İlanlarımızı gör</p>
                </div>
              </a>

              <a
                href="https://www.emlakjet.com/emlak-ofisleri-detay/ceyhun-emlak-tokat-366865/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Image 
                    src="/images/logos/emlakjet.png" 
                    width={20} 
                    height={20} 
                    alt="Emlakjet" 
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800 text-sm">Emlakjet</p>
                  <p className="text-xs text-gray-500">İlanlarımızı gör</p>
                </div>
              </a>

              <a
                href="https://www.hepsiemlak.com/emlak-ofisi/ceyhun-emlak-tokat-70414"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Image 
                    src="/images/logos/hepsiemlak.png" 
                    width={20} 
                    height={20} 
                    alt="Hepsiemlak" 
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800 text-sm">Hepsiemlak</p>
                  <p className="text-xs text-gray-500">İlanlarımızı gör</p>
                </div>
              </a>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="inline-block w-1 h-5 bg-primary rounded-full mr-2"></span>
              Bizi Takip Edin
            </h3>

            <div className="space-y-3">
              <a
                href="https://www.facebook.com/CeyhunGayrimenkulEmlak"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group"
              >
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Facebook size={20} className="text-blue-600" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800 text-sm">Facebook</p>
                  <p className="text-xs text-gray-500">Bizi takip edin</p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/ceyhungayrimenkul/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors group"
              >
                <div className="bg-pink-100 p-2 rounded-lg group-hover:bg-pink-200 transition-colors">
                  <Instagram size={20} className="text-pink-600" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-800 text-sm">Instagram</p>
                  <p className="text-xs text-gray-500">Bizi takip edin</p>
                </div>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8" />

          {/* Tokat Hızlı Linkler Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center">
              <span className="inline-block w-1 h-5 bg-primary rounded-full mr-2"></span>
              Tokat Hızlı Linkler
            </h3>
            <p className="text-xs text-gray-500 mb-4 ml-3">İşinize yarayabilecek linkler</p>

            {/* Resmi Kurumlar */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 ml-3">Resmi Kurumlar</h4>
              <div className="space-y-2">
                <a
                  href="https://www.tkgm.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">TKGM - Tapu Sorgulaması</p>
                  <p className="text-xs text-gray-500">tkgm.gov.tr</p>
                </a>

                <a
                  href="https://www.turkiye.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">E-Devlet</p>
                  <p className="text-xs text-gray-500">turkiye.gov.tr</p>
                </a>

                <a
                  href="https://www.tokat.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">Tokat Valiliği</p>
                  <p className="text-xs text-gray-500">tokat.gov.tr</p>
                </a>

                <a
                  href="https://www.tokat.bel.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">Tokat Belediyesi</p>
                  <p className="text-xs text-gray-500">tokat.bel.tr</p>
                </a>

                <a
                  href="https://tokat.csb.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">Çevre ve Şehircilik</p>
                  <p className="text-xs text-gray-500">tokat.csb.gov.tr</p>
                </a>
              </div>
            </div>

            {/* Emlak ve Vergi */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 ml-3">Emlak ve Vergi</h4>
              <div className="space-y-2">
                <a
                  href="https://www.gib.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">Gelir İdaresi Başkanlığı</p>
                  <p className="text-xs text-gray-500">gib.gov.tr</p>
                </a>

                <a
                  href="https://ebelediye.tokat.bel.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">E-Belediye (Tokat)</p>
                  <p className="text-xs text-gray-500">ebelediye.tokat.bel.tr</p>
                </a>

                <a
                  href="https://www.tapu.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors group"
                >
                  <p className="font-medium text-gray-800 text-xs group-hover:text-primary">Tapu Sorgulaması</p>
                  <p className="text-xs text-gray-500">tapu.gov.tr</p>
                </a>
              </div>
            </div>

            {/* Kredi Hesaplayıcı Butonu */}
            <div className="pt-6 border-t">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calculator size={20} />
                <span>Kredi Hesaplayıcı</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kredi Hesaplayıcı Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Kredi Hesaplayıcı</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <KrediHesaplayici />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
