// Listing interface
export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  property_type: string;
  listing_status: string;
  thumbnail_url?: string | null;
  created_at: string;
  location?: string;
  area?: number;
  rooms?: string;
  konut_type?: string;
  ticari_type?: string;
  arsa_type?: string;
  brand?: string;
  model?: string;
  year?: number;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  km?: number;
  kilometer?: number;
  district?: string;
  province?: string;
  neighborhood?: string;
  is_featured?: boolean;
  subcategory?: string;
  has_video?: boolean;
  addresses?: Array<{province: string; district: string; neighborhood?: string}>;
  images?: Array<{id: string; url: string; order_index?: number; is_cover?: boolean}>;
}

/**
 * Typo düzeltme fonksiyonu - Türkçe karakterler için
 */
function fixTurkishTypos(text: string): string {
  const typoMap: Record<string, string> = {
    'kiralik': 'kiralık',
    'kıralık': 'kiralık',
    'kıralik': 'kiralık',
    'satilik': 'satılık',
    'satılik': 'satılık',
    'satalik': 'satılık',
    'tokad': 'tokat',
    'toket': 'tokat',
  };
  
  let fixed = text.toLowerCase();
  Object.entries(typoMap).forEach(([typo, correct]) => {
    fixed = fixed.replace(new RegExp(typo, 'g'), correct);
  });
  
  return fixed;
}

/**
 * Query'den listing status'u çıkar (kiralık/satılık)
 */
function extractListingStatus(query: string): { status: string | null; remainingQuery: string } {
  const trimmed = query.trim().toLowerCase();
  const fixed = fixTurkishTypos(trimmed);
  
  // Kiralık veya satılık kelimelerini bul
  if (fixed.includes('kiralık') || fixed.includes('kiralik')) {
    const remaining = fixed
      .replace(/\bkiralık\b/g, '')
      .replace(/\bkiralik\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return { status: 'kiralik', remainingQuery: remaining };
  }
  
  if (fixed.includes('satılık') || fixed.includes('satilik')) {
    const remaining = fixed
      .replace(/\bsatılık\b/g, '')
      .replace(/\bsatilik\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return { status: 'satilik', remainingQuery: remaining };
  }
  
  return { status: null, remainingQuery: fixed };
}

/**
 * Client-side search using Supabase API
 * Supabase backend'de arama yapar, typo-tolerant, multi-word search
 */
export async function searchListings(listings: Listing[], query: string): Promise<Listing[]> {
  if (!query || query.trim() === '') {
    return listings;
  }

  const trimmedQuery = query.trim();
  
  // Typo düzeltme
  const fixedQuery = fixTurkishTypos(trimmedQuery);
  
  // Listing status'u query'den ayır (kiralık/satılık)
  const { status, remainingQuery } = extractListingStatus(fixedQuery);
  
  // Supabase API'ye istek at
  try {
    const searchQuery = remainingQuery || fixedQuery;
    const searchUrl = `/api/listings/search?q=${encodeURIComponent(searchQuery)}${status ? `&status=${status}` : ''}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error('Search API error:', response.statusText);
      // Fallback: Client-side basit arama
      return performClientSideSearch(listings, fixedQuery, status);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error calling search API:', error);
    // Fallback: Client-side basit arama
    return performClientSideSearch(listings, fixedQuery, status);
  }
}

/**
 * Fallback: Client-side basit arama (API çalışmazsa)
 */
function performClientSideSearch(listings: Listing[], query: string, status: string | null): Listing[] {
  // Önce listing status'a göre filtrele
  let filtered = listings;
  if (status) {
    filtered = listings.filter(listing => listing.listing_status === status);
  }
  
  if (!query || query.trim() === '') {
    return filtered;
  }
  
  // Kelimelere ayır
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
  
  if (words.length === 0) {
    return filtered;
  }
  
  // Her kelime için arama yap (AND mantığı)
  let results = filtered;
  
  for (const word of words) {
    const wordRegex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    results = results.filter(listing => {
      // Title'da ara
      if (listing.title && wordRegex.test(listing.title)) return true;
      
      // Description'da ara
      if (listing.description && wordRegex.test(listing.description)) return true;
      
      // Province'de ara
      if (listing.province && wordRegex.test(listing.province)) return true;
      
      // District'te ara
      if (listing.district && wordRegex.test(listing.district)) return true;
      
      // Neighborhood'da ara
      if (listing.neighborhood && wordRegex.test(listing.neighborhood)) return true;
      
      // Location'da ara
      if (listing.location && wordRegex.test(listing.location)) return true;
      
      // Konut type'da ara (villa, daire vs)
      if (listing.konut_type && wordRegex.test(listing.konut_type)) return true;
      
      // Ticari type'da ara
      if (listing.ticari_type && wordRegex.test(listing.ticari_type)) return true;
      
      // Arsa type'da ara
      if (listing.arsa_type && wordRegex.test(listing.arsa_type)) return true;
      
      // Rooms'da ara
      if (listing.rooms && wordRegex.test(listing.rooms.toString())) return true;
      
      // Brand'da ara
      if (listing.brand && wordRegex.test(listing.brand)) return true;
      
      // Model'de ara
      if (listing.model && wordRegex.test(listing.model)) return true;
      
      return false;
    });
    
    // Eğer hiç sonuç yoksa, daha fazla arama yapmaya gerek yok
    if (results.length === 0) {
      break;
    }
  }
  
  return results;
}

/**
 * Belirli bir property type için arama
 */
export async function searchListingsByType(
  listings: Listing[], 
  query: string, 
  propertyType?: string
): Promise<Listing[]> {
  // Önce property type'a göre filtrele
  let filtered = listings;
  
  if (propertyType === 'emlak') {
    filtered = listings.filter(l => l.property_type !== 'vasita');
  } else if (propertyType === 'vasita') {
    filtered = listings.filter(l => l.property_type === 'vasita');
  } else if (propertyType) {
    filtered = listings.filter(l => l.property_type === propertyType);
  }
  
  // Sonra arama yap
  if (!query || query.trim() === '') {
    return filtered;
  }
  
  return searchListings(filtered, query);
}
