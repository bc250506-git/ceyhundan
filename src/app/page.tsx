"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ListingsGrid from "@/components/ListingsGrid";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Home as HomeIcon, Building2, Map, Car, Search, ArrowRight, MapPin, Trees, Compass, Landmark, Navigation, GraduationCap, CheckCircle2, Send, PhoneCall, Sparkles } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryCountData, setCategoryCountData] = useState({
    konut: 0,
    ticari: 0,
    arsa: 0,
    vasita: 0,
    total: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Property Submission Form State
  const [propertyFormData, setPropertyFormData] = useState({
    fullName: "",
    phone: "",
    propertyType: "konut",
    actionType: "satilik",
    location: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handlePropertyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyFormData.fullName.trim() || !propertyFormData.phone.trim()) return;

    const typeText = propertyFormData.propertyType === 'konut' ? 'Konut' :
                     propertyFormData.propertyType === 'ticari' ? 'İş Yeri' :
                     propertyFormData.propertyType === 'arsa' ? 'Arsa' : 'Otomotiv';
    const actionText = propertyFormData.actionType === 'satilik' ? 'Satmak İstiyorum' : 'Kiralamak İstiyorum';

    const messageText = `Merhaba Ceyhun Gayrimenkul, Mülk Satış/Kiralama Talebi:%0A- Ad Soyad: ${encodeURIComponent(propertyFormData.fullName)}%0A- Telefon: ${encodeURIComponent(propertyFormData.phone)}%0A- Mülk Tipi: ${encodeURIComponent(typeText)}%0A- İşlem: ${encodeURIComponent(actionText)}%0A- Konum: ${encodeURIComponent(propertyFormData.location || 'Tokat')}`;

    window.open(`https://wa.me/905323850420?text=${messageText}`, '_blank');
    setFormSubmitted(true);
  };

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      router.push(`/ilanlar?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Fetch listing counts from API
  useEffect(() => {
    const fetchListingCounts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        
        // Count listings by category
        const counts = {
          konut: data.filter((listing: any) => listing.property_type === 'konut').length,
          ticari: data.filter((listing: any) => listing.property_type === 'ticari').length,
          arsa: data.filter((listing: any) => listing.property_type === 'arsa').length,
          vasita: data.filter((listing: any) => listing.property_type === 'vasita').length,
          total: data.length
        };
        
        setCategoryCountData(counts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching listing counts:', error);
        setIsLoading(false);
      }
    };
    
    fetchListingCounts();
  }, []);

// Category data with counts
  const categories = [
    {
      id: "konut",
      title: "Konut",
      description: "Daire, villa, müstakil ev, bina ve daha fazlası",
      icon: <HomeIcon className="transition-transform group-hover:scale-110" size={32} />,
      watermarkIcon: <HomeIcon size={120} strokeWidth={1} />,
      iconBg: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
      gradientBar: "from-amber-500 via-orange-500 to-amber-600",
      badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/70",
      count: categoryCountData.konut
    },
    {
      id: "ticari",
      title: "İş Yeri",
      description: "Ofis, mağaza, depo, fabrika ve daha fazlası",
      icon: <Building2 className="transition-transform group-hover:scale-110" size={32} />,
      watermarkIcon: <Building2 size={120} strokeWidth={1} />,
      iconBg: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      gradientBar: "from-blue-500 via-indigo-500 to-blue-600",
      badgeStyle: "bg-blue-50 text-blue-700 border-blue-200/70",
      count: categoryCountData.ticari
    },
    {
      id: "arsa",
      title: "Arsa",
      description: "Arsa, arazi, tarla, bahçe ve daha fazlası",
      icon: <Map className="transition-transform group-hover:scale-110" size={32} />,
      watermarkIcon: <Map size={120} strokeWidth={1} />,
      iconBg: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      gradientBar: "from-emerald-500 via-teal-500 to-emerald-600",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      count: categoryCountData.arsa
    },
    {
      id: "vasita",
      title: "Otomotiv",
      description: "Otomobil, motosiklet, ticari araç ve daha fazlası",
      icon: <Car className="transition-transform group-hover:scale-110" size={32} />,
      watermarkIcon: <Car size={120} strokeWidth={1} />,
      iconBg: "bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
      gradientBar: "from-purple-500 via-pink-500 to-purple-600",
      badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/70",
      count: categoryCountData.vasita
    }
  ];

  // Popular Locations Data focused on Tokat Merkez Zones & Neighborhoods
  const popularLocations = [
    {
      id: "merkez-carsi",
      name: "Tokat Merkez (Çarşı / Tarihi Merkez)",
      query: "Alipaşa",
      description: "Niksar Yolu kavşağından Şehir Merkezine uzanan aks; Ali Paşa, Yarıahmet, Mahmutpaşa, Devegörmez, Behzat ve Meydan mahalleleri",
      icon: <Landmark className="transition-transform group-hover:scale-110" size={30} />,
      watermarkIcon: <Landmark size={120} strokeWidth={1} />,
      gradientBar: "from-amber-500 via-orange-500 to-amber-600",
      iconBg: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
      subTags: ["Ali Paşa", "Devegörmez", "Mahmutpaşa", "Yarıahmet", "Behzat", "Meydan"]
    },
    {
      id: "merkez-karsiyaka",
      name: "Tokat Merkez (Karşıyaka & 600 Evler)",
      query: "Karşıyaka",
      description: "Niksar Yolu kavşağından Güneşli aksına uzanan modern konut bölgesi; Altıyüzevler, Yeşilırmak Mahallesi, Karşıyaka ve Gülbahar Hatun",
      icon: <Building2 className="transition-transform group-hover:scale-110" size={30} />,
      watermarkIcon: <Building2 size={120} strokeWidth={1} />,
      gradientBar: "from-blue-500 via-indigo-500 to-blue-600",
      iconBg: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      subTags: ["Karşıyaka", "Yeşilırmak", "600 Evler", "Gülbahar Hatun", "Bahçelievler"]
    },
    {
      id: "merkez-gunesli",
      name: "Tokat Merkez (Güneşli - Bedesten)",
      query: "Güneşli",
      description: "Güneşli Mahallesi, Bedestenlioğlu, Çeçenistan Caddesi, Yeni Sanayi çevresi ve gelişen yeni site projeleri bölgesi",
      icon: <HomeIcon className="transition-transform group-hover:scale-110" size={30} />,
      watermarkIcon: <HomeIcon size={120} strokeWidth={1} />,
      gradientBar: "from-purple-500 via-pink-500 to-purple-600",
      iconBg: "bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
      subTags: ["Güneşli", "Bedestenlioğlu", "Çeçenistan Cad.", "Doğancıbağları"]
    },
    {
      id: "merkez-cay",
      name: "Tokat Merkez (Çay Mah. & Üniversite)",
      query: "Çay",
      description: "Taşlıçiftlik Kampüsü çevresi, Çay Mahallesi, Erenler, Topçam ve üniversite yakınındaki yatırımlık site daireleri",
      icon: <GraduationCap className="transition-transform group-hover:scale-110" size={30} />,
      watermarkIcon: <GraduationCap size={120} strokeWidth={1} />,
      gradientBar: "from-emerald-500 via-teal-500 to-emerald-600",
      iconBg: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      subTags: ["Çay Mah.", "Erenler", "Topçam", "Taşlıçiftlik", "Büyük Beybağı"]
    },
    {
      id: "merkez-arsa",
      name: "Tokat Merkez (Arsa & Hobi Bahçeleri)",
      query: "Arsa",
      description: "Bedirkale, Kervansaray, Gökdere, Akbelen, Büyükbağlar ve çevre köylerdeki hobi bahçesi, tarla ve arsa fırsatları",
      icon: <Trees className="transition-transform group-hover:scale-110" size={30} />,
      watermarkIcon: <Trees size={120} strokeWidth={1} />,
      gradientBar: "from-rose-500 via-red-500 to-rose-600",
      iconBg: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
      subTags: ["Bedirkale", "Kervansaray", "Gökdere", "Akbelen", "Büyükbağlar"]
    },
    {
      id: "tokat-ilceler",
      name: "Tokat (Tüm İlçeler)",
      query: "Erbaa",
      description: "Erbaa, Turhal, Niksar, Almus, Zile, Pazar, Reşadiye ve tüm Tokat çevre ilçelerindeki özel gayrimenkul fırsatları",
      icon: <MapPin className="transition-transform group-hover:scale-110" size={30} />,
      watermarkIcon: <MapPin size={120} strokeWidth={1} />,
      gradientBar: "from-cyan-500 via-teal-500 to-cyan-600",
      iconBg: "bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
      subTags: ["Erbaa", "Turhal", "Niksar", "Almus", "Zile", "Pazar", "Reşadiye"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Parallax Effect (disable fixed on small screens) */}
      <div 
        className="w-full h-auto min-h-[100vh] pt-32 sm:pt-36 pb-16 sm:pb-20 bg-cover bg-center md:bg-fixed relative overflow-hidden flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/ce.png')`
        }}
      >
        <div className="w-full flex flex-col justify-center items-center px-3 sm:px-6 md:px-8 lg:px-12 py-20">
          <div className="w-full max-w-7xl mx-auto text-center">
          
            {/* Big Search Bar */}
            <div className="w-full max-w-5xl mx-auto mb-12 sm:mb-16 animate-slide-up">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="İlan ara... (örn: merkez kiralık daire, satılık villa)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-20 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl rounded-full focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all bg-white/95 backdrop-blur-sm shadow-2xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full transition-all duration-300 font-medium text-sm sm:text-base md:text-lg flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                  aria-label="Ara"
                >
                  <Search size={20} className="sm:size-[22px] md:size-[24px]" />
                  <span className="hidden sm:inline">Ara</span>
                </button>
              </form>
            </div>

            {/* Quick Category Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto animate-fade-in">
              {categories.map((category, index) => {
                const hasStatusFilters = category.id === "konut" || category.id === "ticari";
                return (
                  <div
                    key={category.id}
                    className="group relative flex flex-col h-full bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg sm:rounded-xl p-2.5 sm:p-6 transition-all duration-300 border border-white/20 hover:border-primary/50 hover:shadow-xl hover:scale-105 hover:z-10 will-change-transform"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link href={`/ilanlar/${category.id}`} className="flex flex-grow flex-col items-center justify-center text-center space-y-1 sm:space-y-3">
                      <div className="text-primary group-hover:scale-110 transition-transform duration-300 will-change-transform">
                        {category.icon}
                      </div>
                      <h3 className="font-headings text-white font-bold text-sm sm:text-base md:text-lg tracking-wide">
                        {category.title}
                      </h3>
                      {!isLoading && (
                        <span className="text-xs sm:text-sm text-white font-bold drop-shadow-xs">
                          {category.count} ilan
                        </span>
                      )}
                    </Link>

                    {/* Satılık / Kiralık quick filters */}
                    {hasStatusFilters && (
                      <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                        <Link
                          href={`/ilanlar/${category.id}?listingStatus=satilik`}
                          className="flex-1 text-center rounded-md sm:rounded-lg py-1 sm:py-1.5 text-[9px] sm:text-xs md:text-sm font-bold text-white bg-white/20 hover:bg-primary border border-white/30 hover:border-primary transition-colors"
                        >
                          Satılık
                        </Link>
                        <Link
                          href={`/ilanlar/${category.id}?listingStatus=kiralik`}
                          className="flex-1 text-center rounded-md sm:rounded-lg py-1 sm:py-1.5 text-[9px] sm:text-xs md:text-sm font-bold text-white bg-white/20 hover:bg-primary border border-white/30 hover:border-primary transition-colors"
                        >
                          Kiralık
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Categories Section */}
        <div className="py-10 sm:py-16 bg-gradient-to-b from-gray-900/10 to-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12">
              <div className="relative">
                <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 text-gray-900">Kategoriler</h2>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl font-medium">
                  İhtiyacınıza uygun kategoride arama yapın
                </p>
                <div className="absolute -left-3 sm:-left-4 top-0 w-1.5 sm:w-2 h-8 sm:h-12 bg-primary rounded-full"></div>
              </div>
              
              {!isLoading && (
                <div className="text-sm sm:text-base text-gray-700 font-semibold">
                  Toplam: <span className="font-bold text-primary">{categoryCountData.total}</span> ilan
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {categories.map((category) => {
                const hasStatusFilters = category.id === "konut" || category.id === "ticari";
                return (
                  <div
                    key={category.id}
                    className="group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top gradient highlight on hover */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${category.gradientBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                    {/* Background vector watermark icon */}
                    <div className="absolute -bottom-8 -right-8 text-gray-100 group-hover:text-primary/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none select-none">
                      {category.watermarkIcon}
                    </div>

                    <div>
                      {/* Top Row: Icon badge & count badge */}
                      <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${category.iconBg} shadow-sm transition-all duration-300`}>
                          {category.icon}
                        </div>
                        
                        <div className="bg-gray-100 text-gray-900 text-xs sm:text-sm font-bold px-3 py-1 rounded-full border border-gray-200">
                          {isLoading ? (
                            <Loading size="small" className="flex-row gap-1" text="Yükleniyor..." />
                          ) : (
                            `${category.count} ilan`
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <Link href={`/ilanlar/${category.id}`} className="block group/title">
                        <h3 className="font-headings text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-1 sm:mb-2">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                          {category.description}
                        </p>
                      </Link>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between relative z-10">
                      <Link 
                        href={`/ilanlar/${category.id}`} 
                        className="text-primary font-bold text-sm sm:text-base flex items-center gap-1 transition-all group-hover:translate-x-1"
                      >
                        <span>Tümünü Gör</span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </Link>

                      {/* Quick Filters */}
                      {hasStatusFilters && (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/ilanlar/${category.id}?listingStatus=satilik`}
                            className="px-2 py-1 text-xs font-bold text-gray-700 hover:text-primary bg-gray-100 hover:bg-primary/10 rounded-md transition-colors"
                          >
                            Satılık
                          </Link>
                          <Link
                            href={`/ilanlar/${category.id}?listingStatus=kiralik`}
                            className="px-2 py-1 text-xs font-bold text-gray-700 hover:text-primary bg-gray-100 hover:bg-primary/10 rounded-md transition-colors"
                          >
                            Kiralık
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Popular Locations Section */}
        <div className="py-12 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-gray-100/60 border-t border-b border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                    <Navigation size={12} /> Popüler Bölgeler
                  </span>
                </div>
                <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                  Lokasyonlara Göre İlan Keşfedin
                </h2>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl font-medium">
                  Tokat ve çevresinde en çok tercih edilen öne çıkan bölgelerdeki satılık ve kiralık fırsatları inceleyin
                </p>
                <div className="absolute -left-3 sm:-left-4 top-0 w-1.5 sm:w-2 h-10 sm:h-14 bg-primary rounded-full"></div>
              </div>

              <Link
                href="/ilanlar"
                className="inline-flex items-center gap-2 mt-4 md:mt-0 text-sm sm:text-base font-bold text-primary hover:text-primary/80 bg-white px-5 py-2.5 rounded-xl shadow-xs border border-gray-200 hover:border-primary/40 transition-all hover:shadow-md"
              >
                <span>Tüm İlanlar</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {popularLocations.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/ilanlar?search=${encodeURIComponent(loc.query)}`}
                  className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col justify-between"
                >
                  {/* Top gradient highlight on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${loc.gradientBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Background vector watermark icon */}
                  <div className="absolute -bottom-8 -right-8 text-gray-100 group-hover:text-primary/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none select-none">
                    {loc.watermarkIcon}
                  </div>

                  <div>
                    {/* Top Row: Icon box & Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center ${loc.iconBg} shadow-sm transition-all duration-300`}>
                        {loc.icon}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <MapPin size={13} />
                        <span>İlanları İncele</span>
                      </div>
                    </div>

                    {/* Location Title & Description */}
                    <h3 className="font-headings text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                      {loc.name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed mb-5">
                      {loc.description}
                    </p>

                    {/* Sub Tags / Popular Neighborhoods */}
                    <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
                      {loc.subTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200/60 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
                    <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      Fırsat İlanlarını Göster
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-gray-700 transition-all duration-300">
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid (Öne Çıkarılan İlanlar) */}
        <div className="py-10 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <ListingsGrid />
        </div>

        {/* Trust Banner */}
        <div className="bg-gradient-to-r from-gray-100 to-white py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-headings font-bold mb-4 sm:mb-6">
                Neden <span className="text-primary text-2xl sm:text-3xl md:text-4xl">Bizi</span> Tercih Etmelisiniz?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
                Ceyhun Gayrimenkul Emlak olarak müşteri memnuniyetini en üst seviyede tutarak, 
                profesyonel hizmet anlayışımızla sektörde fark yaratıyoruz.
              </p>
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="m3 11 18-5-5 18-4-4-3 3-3-10 10-3-4-4Z" />
                    </svg>
                  </div>
                <h3 className="font-headings font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-center">Hızlı Çözüm</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">Zamanınızın değerli olduğunu biliyoruz. En kısa sürede çözüm sunuyoruz.</p>
                </div>
                
              <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                <h3 className="font-headings font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-center">Güvenilir Hizmet</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">Şeffaf ve dürüst çalışma prensibimizle güven inşa ediyoruz.</p>
                </div>
                
              <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                <h3 className="font-headings font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-center">Uzman Ekip</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">Deneyimli ve uzman kadromuzla profesyonel destek sunuyoruz.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sell / Rent Your Property Quick Submission Banner */}
        <div 
          className="py-12 sm:py-20 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(to right, #18181b, #27272a)"
          }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-zinc-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & Value Proposition */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                  <Sparkles size={16} />
                  <span>Ücretsiz Değerleme & Hızlı Satış</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-headings font-extrabold text-white leading-tight">
                  Mülkünüzü Değerinde ve <span className="text-primary">Hızlıca</span> Satalım veya Kiralayalım
                </h2>

                <p className="text-gray-300 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                  Tokat ve çevresinde eviniz, arsanız, iş yeriniz veya aracınız mı var? Bilgilerinizi bırakın; uzman kadromuz piyasa analizini ücretsiz yapıp gayrimenkulünüzü en doğru fiyata alıcılarla buluştursun.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-gray-200 text-xs sm:text-sm font-medium">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                    <span>Ücretsiz Pazar & Bölge Ekspertiz Analizi</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-200 text-xs sm:text-sm font-medium">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                    <span>15+ Yıllık Tokat Sektör Deneyimi ve Geniş Müşteri Portföyü</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-200 text-xs sm:text-sm font-medium">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                    <span>Profesyonel İlan Çekimi ve Vitrin İlan Desteği</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4 text-xs sm:text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2">
                    <PhoneCall size={16} className="text-primary" />
                    <span>Doğrudan İletişim: <strong className="text-white">0532 385 04 20</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Submission Form */}
              <div className="lg:col-span-6">
                <div className="bg-white text-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
                  <h3 className="text-xl sm:text-2xl font-headings font-bold text-gray-900 mb-1">
                    Mülk Bilgilerinizi Gönderin
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-6">
                    Formu doldurun, gayrimenkul danışmanımız sizi hemen arasın.
                  </p>

                  {formSubmitted ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="font-bold text-base sm:text-lg">Başvurunuz Alındı!</h4>
                      <p className="text-xs sm:text-sm text-emerald-700">
                        Talebiniz ekibimize iletilmiştir. Uzman danışmanımız en kısa sürede telefon numaranızdan sizinle iletişime geçecektir.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="text-xs font-bold text-emerald-700 underline mt-2"
                      >
                        Yeni Başvuru Yap
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePropertyFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                          Adınız Soyadınız *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Ahmet Yılmaz"
                          value={propertyFormData.fullName}
                          onChange={(e) => setPropertyFormData({ ...propertyFormData, fullName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                            Telefon Numarası *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Örn: 0532 000 00 00"
                            value={propertyFormData.phone}
                            onChange={(e) => setPropertyFormData({ ...propertyFormData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                            Mülk Tipi
                          </label>
                          <select
                            value={propertyFormData.propertyType}
                            onChange={(e) => setPropertyFormData({ ...propertyFormData, propertyType: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                          >
                            <option value="konut">Konut (Daire / Müstakil / Villa)</option>
                            <option value="arsa">Arsa / Arazi / Tarla</option>
                            <option value="ticari">İş Yeri / Dükkan / Depo</option>
                            <option value="vasita">Otomotiv / Vasıta</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                            İşlem Türü
                          </label>
                          <select
                            value={propertyFormData.actionType}
                            onChange={(e) => setPropertyFormData({ ...propertyFormData, actionType: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                          >
                            <option value="satilik">Satmak İstiyorum</option>
                            <option value="kiralik">Kiralamak İstiyorum</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                            Konum / Mahalle
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Karşıyaka / Tokat"
                            value={propertyFormData.location}
                            onChange={(e) => setPropertyFormData({ ...propertyFormData, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
                      >
                        <Send size={18} />
                        <span>Hızlı Değerleme Talebi Gönder</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className="relative py-12 sm:py-20 overflow-hidden"
          style={{
            background: "linear-gradient(to right, #18181b, #27272a)"
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <Image 
              src="/images/logo_white.png" 
              alt="Background Pattern" 
              fill 
              className="object-cover opacity-20"
            />
          </div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headings font-bold text-white mb-4 sm:mb-6">
              Gayrimenkul Yolculuğunuza <span className="text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Bugün</span> Başlayın
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10">
              Hayalinizdeki evi veya aracı bulmak için bizimle iletişime geçin. Size özel çözümler sunalım.
            </p>
            <Link 
              href="/ilanlar" 
              className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Tüm İlanları Görüntüle
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
