'use client';

import { useState, useEffect } from 'react';

export default function KrediHesaplayici() {
  const [krediTutari, setKrediTutari] = useState(1000000);
  const [vade, setVade] = useState(120);
  const [faizOrani, setFaizOrani] = useState(3.5);
  const [sonuclar, setSonuclar] = useState<{ aylikTaksit: string; toplamOdeme: string; toplamFaiz: string } | null>(null);

  const hesapla = () => {
    const aylikFaiz = faizOrani / 100 / 12;
    const bsmv = 0.10; // %10 BSMV
    const kkdf = 0.15; // %15 KKDF
    
    // Temel aylık taksit (vergisiz)
    const aylikTaksitTemel = krediTutari * 
      (aylikFaiz * Math.pow(1 + aylikFaiz, vade)) / 
      (Math.pow(1 + aylikFaiz, vade) - 1);
    
    // Sadece faizin üzerine vergi ekle
    const aylikFaizTutar = aylikTaksitTemel * vade - krediTutari;
    const toplamFaizVergisi = aylikFaizTutar * (bsmv + kkdf);
    
    // Sonuç: Taksit + Faiz Üzerine Vergi
    const aylikTaksit = aylikTaksitTemel + (toplamFaizVergisi / vade);
    const toplamOdeme = aylikTaksit * vade;
    const toplamFaiz = toplamOdeme - krediTutari;

    setSonuclar({
      aylikTaksit: aylikTaksit.toFixed(2),
      toplamOdeme: toplamOdeme.toFixed(2),
      toplamFaiz: toplamFaiz.toFixed(2),
    });
  };

  useEffect(() => {
    hesapla();
  }, [krediTutari, vade, faizOrani]);

  const formatNumber = (num: string | number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(num));
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <span className="inline-block w-1 h-5 bg-primary rounded-full mr-2"></span>
        Konut Kredisi Hesaplayıcı
      </h3>

      <div className="space-y-6">
        {/* Kredi Tutarı */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Kredi Tutarı
            </label>
            <span className="text-sm font-semibold text-primary">
              {formatNumber(krediTutari)} ₺
            </span>
          </div>
          <input
            type="range"
            value={krediTutari}
            onChange={(e) => setKrediTutari(Number(e.target.value))}
            min="100000"
            max="5000000"
            step="50000"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>100.000 ₺</span>
            <span>5.000.000 ₺</span>
          </div>
        </div>

        {/* Vade */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Vade
            </label>
            <span className="text-sm font-semibold text-primary">
              {vade} Ay ({(vade / 12).toFixed(1)} Yıl)
            </span>
          </div>
          <input
            type="range"
            value={vade}
            onChange={(e) => setVade(Number(e.target.value))}
            min="12"
            max="240"
            step="12"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 Yıl</span>
            <span>20 Yıl</span>
          </div>
        </div>

        {/* Faiz Oranı */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Faiz Oranı (%)
          </label>
          <input
            type="number"
            value={faizOrani}
            onChange={(e) => setFaizOrani(Number(e.target.value))}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Faiz oranı %"
          />
        </div>

        {/* Sonuçlar */}
        {sonuclar && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-primary/20">
              <span className="text-sm text-gray-700">Aylık Taksit</span>
              <span className="text-xl font-bold text-primary">
                {formatNumber(sonuclar.aylikTaksit)} ₺
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Toplam Ödeme:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatNumber(sonuclar.toplamOdeme)} ₺
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Toplam Faiz:</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatNumber(sonuclar.toplamFaiz)} ₺
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Uyarı */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Not:</strong> Bu hesaplama BSMV (%10) ve KKDF (%15) vergilerini içermektedir. 
            Gerçek taksit tutarları bankaya göre değişiklik gösterebilir.
          </p>
        </div>
      </div>
    </div>
  );
}
