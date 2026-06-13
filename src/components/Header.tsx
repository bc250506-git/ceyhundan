"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X, ChevronDown, ChevronRight, Phone, MapPin, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Desktop dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [activeSubSubDropdown, setActiveSubSubDropdown] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Mobile dropdown states
  const [expandedEmlak, setExpandedEmlak] = useState(false);
  const [expandedVasita, setExpandedVasita] = useState(false);
  const [expandedKurumsal, setExpandedKurumsal] = useState(false);
  const [expandedKonut, setExpandedKonut] = useState(false);

  // Handle scroll event to change header style when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Redirect to the all listings page with search query
      router.push(`/ilanlar?search=${encodeURIComponent(searchQuery)}`);
      
      // Close mobile menu if open
      if (isMenuOpen) {
        closeMenu();
      }
    }
  };

  // Close menu and reset all dropdowns
  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setActiveSubDropdown(null);
    setActiveSubSubDropdown(null);
    setExpandedEmlak(false);
    setExpandedVasita(false);
    setExpandedKurumsal(false);
    setExpandedKonut(false);

    // Clear hover timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  // Handle mouse enter/leave for desktop dropdowns with delays
  
  const handleMouseEnter = (dropdown: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveDropdown(dropdown);
    setActiveSubDropdown(null);
    setActiveSubSubDropdown(null);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
      setActiveSubDropdown(null);
      setActiveSubSubDropdown(null);
    }, 400); // delay before closing the whole menu tree once the cursor leaves it entirely
    setHoverTimeout(timeout);
  };

  const handleSubMouseEnter = (subDropdown: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveSubDropdown(subDropdown);
    setActiveSubSubDropdown(null);
  };

  const handleSubSubMouseEnter = (subSubDropdown: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveSubSubDropdown(subSubDropdown);
  };

  return (
    <>
    <header 
      className={`fixed w-full z-50 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      {/* Üst Bilgi Şeridi */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm">
          {/* Telefon Numaraları */}
          <a 
            href="tel:+905323850420" 
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
          >
            <Phone size={16} className="flex-shrink-0 sm:size-[18px]" />
            <span className="whitespace-nowrap">0 (532) 385 04 20</span>
          </a>
          
          <a 
            href="tel:+903562280444" 
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
          >
            <Building2 size={16} className="flex-shrink-0 sm:size-[18px]" />
            <span className="whitespace-nowrap">0 (356) 228 0 444</span>
          </a>
          
          {/* Adres */}
          <a 
            href="https://www.google.com/maps/place/Ceyhun+Gayrimenkul/@40.3135985,36.5464112,17z/data=!3m1!4b1!4m6!3m5!1s0x407db7127e757205:0x3c13ae469d9644fb!8m2!3d40.3135944!4d36.5489861!16s%2Fg%2F11c57mxzdy?entry=ttu&g_ep=EgoyMDI1MTExMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
          >
            <MapPin size={16} className="flex-shrink-0 sm:size-[18px]" />
            <span className="whitespace-nowrap">Tokat Belediye Hizmet Binası Arkası Ceyhun Suit</span>
          </a>
        </div>
      </div>

      {/* Ana Header */}
      <div className="py-2 sm:py-5">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Desktop Navigation - Left Side */}
        <nav className="hidden md:flex items-center space-x-8 relative">
          {/* Ana Sayfa */}
          <Link href="/" className="font-headings text-lg font-medium transition-colors hover:text-primary">
            Ana Sayfa
          </Link>
          
          {/* İlanlar Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('ilanlar')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="font-headings text-lg font-medium transition-colors hover:text-primary flex items-center gap-1">
              İlanlar
              <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'ilanlar' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* İlanlar Dropdown Menu */}
            {activeDropdown === 'ilanlar' && (
              <div
                className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                {/* Emlak */}
                <div
                  className="relative group/sub"
                  onMouseEnter={() => handleSubMouseEnter('emlak')}
                >
                  <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <span className="text-gray-700 hover:text-primary transition-colors">Emlak</span>
                    <ChevronRight size={14} />
                  </div>

                  {/* Emlak Sub-dropdown */}
                  {activeSubDropdown === 'emlak' && (
                    <div
                      className="absolute top-0 left-full ml-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* Konut */}
                      <div
                        className="relative"
                        onMouseEnter={() => handleSubSubMouseEnter('konut')}
                      >
                        <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                          <span className="text-gray-600 hover:text-primary transition-colors">Konut</span>
                          <ChevronRight size={12} />
                        </div>

                        {/* Konut Sub-sub-dropdown */}
                        {activeSubSubDropdown === 'konut' && (
                          <div
                            className="absolute top-0 left-full ml-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                          >
                            <Link href="/ilanlar/konut?listingStatus=satilik" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                              Satılık
                            </Link>
                            <Link href="/ilanlar/konut?listingStatus=kiralik" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                              Kiralık
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Arsa */}
                      <Link href="/ilanlar/arsa" className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                        Arsa
                      </Link>

                      {/* İş Yeri */}
                      <Link href="/ilanlar/ticari" className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                        İş Yeri
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link href="/ilanlar/emlak" className="block px-4 py-2 text-primary hover:bg-gray-50 transition-colors font-medium">
                          Tüm Emlak İlanları
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Vasıta */}
                <Link href="/ilanlar/vasita" className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                  Vasıta
                </Link>
              </div>
            )}
          </div>
          
          {/* Kurumsal Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('kurumsal')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="font-headings text-lg font-medium transition-colors hover:text-primary flex items-center gap-1">
              Kurumsal
              <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'kurumsal' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Kurumsal Dropdown Menu */}
            {activeDropdown === 'kurumsal' && (
              <div 
                className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <Link href="/hakkimizda" className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                  Hakkımızda
                </Link>
                <Link href="/iletisim" className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                  İletişim
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Logo - Center */}
        <div className="flex justify-center">
          <Link href="/" className="hover-scale">
            <Image
              src="/images/logo_black.png"
              alt="Ceyhun Emlak Logo"
              width={160}
              height={50}
              className="transition-all duration-300 w-[150px] sm:w-[200px] h-auto"
              priority
            />
          </Link>
        </div>
        
        {/* Search button - Right Side */}
        <div className="hidden md:flex items-center">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="İlan Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white text-base"
            />
            <button 
              type="submit" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Ara"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent/50 transition-colors"
          onClick={() => isMenuOpen ? closeMenu() : setIsMenuOpen(true)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>
      
      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 pb-6 px-6 overflow-y-auto fade-in">
          {/* Kapatma butonu - mobil menü içinde sabit pozisyonda */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-50"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col space-y-4">
            {/* Arama çubuğu - en üstte */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="İlan Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white text-base"
              />
              <button 
                type="submit" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Ara"
              >
                <Search size={18} />
              </button>
            </form>
            
            <Link 
              href="/" 
              className="font-headings text-lg font-medium transition-colors hover:text-primary py-3 border-b border-gray-100"
              onClick={closeMenu}
            >
              Ana Sayfa
            </Link>
            
            {/* İlanlar Dropdown */}
            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between font-headings text-lg font-medium transition-colors hover:text-primary py-3"
                onClick={() => setExpandedEmlak(!expandedEmlak)}
              >
                İlanlar
                <ChevronDown className={`transition-transform duration-200 ${expandedEmlak ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              {expandedEmlak && (
                <div className="pl-4 pb-3 space-y-2">
                  {/* Emlak Alt Kategorisi */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between font-medium text-gray-700 hover:text-primary py-2"
                      onClick={() => setExpandedVasita(!expandedVasita)}
                    >
                      Emlak
                      <ChevronRight className={`transition-transform duration-200 ${expandedVasita ? 'rotate-90' : ''}`} size={16} />
                    </button>
                    {expandedVasita && (
                      <div className="pl-4 space-y-2">
                        {/* Konut */}
                        <div>
                          <button
                            className="w-full flex items-center justify-between font-medium text-gray-600 hover:text-primary py-2 text-sm"
                            onClick={() => setExpandedKonut(!expandedKonut)}
                          >
                            Konut
                            <ChevronRight className={`transition-transform duration-200 ${expandedKonut ? 'rotate-90' : ''}`} size={14} />
                          </button>
                          {expandedKonut && (
                            <div className="pl-4 space-y-1">
                              <Link
                                href="/ilanlar/konut?listingStatus=satilik"
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Satılık
                              </Link>
                              <Link
                                href="/ilanlar/konut?listingStatus=kiralik"
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Kiralık
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Arsa */}
                        <Link
                          href="/ilanlar/arsa"
                          className="block font-medium text-gray-600 hover:text-primary py-2 text-sm"
                          onClick={closeMenu}
                        >
                          Arsa
                        </Link>

                        {/* İş Yeri */}
                        <Link
                          href="/ilanlar/ticari"
                          className="block font-medium text-gray-600 hover:text-primary py-2 text-sm"
                          onClick={closeMenu}
                        >
                          İş Yeri
                        </Link>

                        {/* Tüm Emlak İlanları */}
                        <Link 
                          href="/ilanlar/emlak" 
                          className="block font-medium text-primary hover:text-primary/80 py-2 text-sm"
                          onClick={closeMenu}
                        >
                          Tüm Emlak İlanları
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Vasıta */}
                  <Link 
                    href="/ilanlar/vasita" 
                    className="block font-medium text-gray-700 hover:text-primary py-2"
                    onClick={closeMenu}
                  >
                    Vasıta
                  </Link>
                </div>
              )}
            </div>
            
            {/* Kurumsal Dropdown */}
            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between font-headings text-lg font-medium transition-colors hover:text-primary py-3"
                onClick={() => setExpandedKurumsal(!expandedKurumsal)}
              >
                Kurumsal
                <ChevronDown className={`transition-transform duration-200 ${expandedKurumsal ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              {expandedKurumsal && (
                <div className="pl-4 pb-3 space-y-2">
                  <Link 
                    href="/hakkimizda" 
                    className="block font-medium text-gray-700 hover:text-primary py-2"
                    onClick={closeMenu}
                  >
                    Hakkımızda
                  </Link>
                  <Link 
                    href="/iletisim" 
                    className="block font-medium text-gray-700 hover:text-primary py-2"
                    onClick={closeMenu}
                  >
                    İletişim
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </header>
    </>
  );
};

export default Header; 