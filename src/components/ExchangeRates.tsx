"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  previousRate?: number;
}

export default function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Using exchangerate-api.com (free tier available)
        // For production, you might want to use a more reliable source
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD",
          { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
          throw new Error("Kur bilgileri alınamadı");
        }

        const data = await response.json();
        
        // Select main currencies and get their TRY value
        const mainCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF"];
        const exchangeRates = mainCurrencies
          .map((code) => ({
            code,
            name: getCurrencyName(code),
            rate: data.rates["TRY"] / data.rates[code] || 0, // Convert to TRY per unit of currency
          }))
          .filter((rate) => rate.rate > 0);

        setRates(exchangeRates);
        setLastUpdated(new Date().toLocaleTimeString("tr-TR"));
      } catch (err) {
        console.error("Error fetching exchange rates:", err);
        setError("Kur bilgileri yüklenemedi");
        // Set dummy data for display
        setRates([
          { code: "USD", name: "Amerikan Doları", rate: 34.50 },
          { code: "EUR", name: "Euro", rate: 36.20 },
          { code: "GBP", name: "İngiliz Sterlini", rate: 43.10 },
          { code: "JPY", name: "Japon Yeni", rate: 0.23 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every 30 minutes
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrencyName = (code: string): string => {
    const names: Record<string, string> = {
      USD: "Amerikan Doları",
      EUR: "Euro",
      GBP: "İngiliz Sterlini",
      JPY: "Japon Yeni",
      CHF: "İsviçre Frangı",
    };
    return names[code] || code;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={14} />;
    if (change < 0) return <TrendingDown size={14} />;
    return null;
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Güncel Döviz Kurları</h2>
        <span className="text-xs sm:text-sm text-gray-500">
          {lastUpdated && `Son güncelleme: ${lastUpdated}`}
        </span>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <span className="ml-3 text-gray-600">Yükleniyor...</span>
        </div>
      ) : rates.length > 0 ? (
        <div className="space-y-4">
          {rates.map((rate) => (
            <div
              key={rate.code}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-base text-gray-900">
                    1 {rate.code}
                  </span>
                  <span className="text-sm text-gray-500">{rate.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    ₺{rate.rate.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">Türk Lirası</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">
          Kur bilgileri kullanılamıyor
        </p>
      )}
    </Card>
  );
}
