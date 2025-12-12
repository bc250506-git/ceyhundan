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
 * Türkçe karakterleri normalize et
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

/**
 * Türkçe suffixleri kaldır (sobalı→soba, elektrikli→elektrik)
 * Bu fonksiyon kelimelerin root formunu bulmaya yardımcı olur
 */
function removeTurkishSuffixes(word: string): string {
  let w = word.toLowerCase();
  
  // Sırasıyla suffixleri kaldır (en uzunlardan başla)
  // Çoğul
  w = w.replace(/ler$|lar$/i, '');
  
  // Birlikte kullanılan: -lı, -li, -lu, -lü (adjectival)
  w = w.replace(/lı$|li$|lu$|lü$/i, '');
  
  // Sahiplik: -sı, -si, -su, -sü
  w = w.replace(/sı$|si$|su$|sü$/i, '');
  
  // Belirtme hali: -ı, -i, -u, -ü
  w = w.replace(/ı$|i$|u$|ü$/i, '');
  
  // İsim hali ekleri
  w = w.replace(/nın$|nin$|nun$|nün$/i, ''); // Genitif
  w = w.replace(/da$|de$|ta$|te$/i, ''); // Lokativ
  w = w.replace(/dan$|den$|tan$|ten$/i, ''); // Ablativ
  w = w.replace(/yle$|ile$/i, ''); // İnsitutif
  
  return w.trim();
}

/**
 * Text içinde kelime aransın (normalize edilmiş şekilde)
 */
function containsWord(text: string | undefined | null, word: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  const normalizedWord = normalizeText(word);
  
  // Tam kelime veya başında olsun
  const regex = new RegExp(`(^|\\W)${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\W|$)`, 'i');
  return regex.test(normalized);
}

/**
 * Text içinde substring aransın (normalize edilmiş şekilde)
 */
function containsSubstring(text: string | undefined | null, substring: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  const normalizedSubstring = normalizeText(substring);
  return normalized.includes(normalizedSubstring);
}

/**
 * Smart kelime parsing - "3dönüm" -> "3 dönüm" vb (SADECE sayı+kelime için)
 * "3+1" gibi kombinasyonları OLDUĞU GİBİ TUTAR
 */
function parseSmartQuery(query: string): string {
  let parsed = query.toLowerCase();
  
  // SADECE sayı+kelime kombinasyonlarını ayır (3+1 değil!)
  // "3dönüm" -> "3 dönüm"
  parsed = parsed.replace(/(\d+)(dönüm|donüm|dönüm|donüm)/gi, '$1 $2');
  
  // "3000m2" -> "3000 m2"
  parsed = parsed.replace(/(\d+)\s*(m2|m²|metrekare)/gi, '$1 $2');
  
  // "12km" -> "12 km" (kilometre)
  parsed = parsed.replace(/(\d+)\s*(km|kilometre)/gi, '$1 $2');
  
  // Kiralık, satılık vb normalize et
  parsed = parsed.replace(/kiralik/g, 'kiralık');
  parsed = parsed.replace(/satilik/g, 'satılık');
  
  return parsed;
}

/**
 * Yazılan sorgudan satılık/kiralık status'unu çıkar
 */
function extractStatusFromQuery(query: string): { status: string | null; cleanQuery: string } {
  const normalized = normalizeText(query);
  
  // "kiralık" veya "kiralik" bulunur mu?
  if (normalized.includes('kiralik')) {
    const clean = normalizeText(query)
      .replace(/kiralik/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return { status: 'kiralik', cleanQuery: clean };
  }
  
  // "satılık" veya "satilik" bulunur mu?
  if (normalized.includes('satilik')) {
    const clean = normalizeText(query)
      .replace(/satilik/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return { status: 'satilik', cleanQuery: clean };
  }
  
  return { status: null, cleanQuery: normalizeText(query) };
}

/**
 * Client-side search - AND mantığı (TÜM kelimelerin olması gerekir)
 */
export function searchListings(listings: Listing[], query: string): Listing[] {
  if (!query || query.trim() === '') {
    return listings;
  }

  // Smart query parsing (3+1 -> 3 1 vb)
  const smartParsed = parseSmartQuery(query);
  
  // Status bilgisini çıkar
  const { status, cleanQuery } = extractStatusFromQuery(smartParsed);
  
  // Kelimeler
  const words = cleanQuery
    .split(/\s+/)
    .filter(w => w.length >= 1)
    .map(w => normalizeText(w));

  if (words.length === 0) {
    // Status varsa en azından ona göre filtrele
    if (status) {
      return listings.filter(l => l.listing_status === status);
    }
    return listings;
  }

  // Filtrele: Status varsa önce onu uygula
  let results = listings;
  if (status) {
    results = results.filter(l => l.listing_status === status);
  }

  // Debug log
  console.log('🔍 Search Debug:', {
    originalQuery: query,
    smartParsed,
    extractedStatus: status,
    cleanQuery,
    words,
    totalListings: listings.length,
    afterStatusFilter: results.length
  });

  // Sonra her kelime için AND mantığı uygula
  for (const word of words) {
    const beforeCount = results.length;
    
    // Kelime ve suffix'siz halini hazırla
    const wordWithoutSuffix = removeTurkishSuffixes(word);
    
    results = results.filter(listing => {
      // Helper fonksiyon: kelime veya suffix'siz halini ara
      const searchField = (fieldValue: string | undefined | null): boolean => {
        if (!fieldValue) return false;
        const normalized = normalizeText(fieldValue);
        const normalizedWithoutSuffix = removeTurkishSuffixes(normalized);
        
        // Exact word match
        if (normalized.includes(word)) return true;
        
        // Root word match (sobalı yazılınca soba'yı da bul)
        if (word !== wordWithoutSuffix && normalizedWithoutSuffix.includes(wordWithoutSuffix)) return true;
        
        // Field'ın suffix'siz halinde word'ü ara (soba yazılınca sobalı'yı da bul)
        if (normalizedWithoutSuffix.includes(word)) return true;
        
        return false;
      };
      
      // Title'da ara
      if (searchField(listing.title)) return true;
      
      // Description'da ara
      if (searchField(listing.description)) return true;
      
      // Province'de ara
      if (searchField(listing.province)) return true;
      
      // District'te ara
      if (searchField(listing.district)) return true;
      
      // Neighborhood'da ara
      if (searchField(listing.neighborhood)) return true;
      
      // Location'da ara
      if (searchField(listing.location)) return true;
      
      // Konut type'da ara
      if (searchField(listing.konut_type)) return true;
      
      // Ticari type'da ara
      if (searchField(listing.ticari_type)) return true;
      
      // Arsa type'da ara
      if (searchField(listing.arsa_type)) return true;
      
      // Rooms'da ara - "3+1" normalize edilmeden kontrol et
      if (listing.rooms) {
        const roomsStr = listing.rooms.toString().toLowerCase();
        if (normalizeText(roomsStr).includes(word)) return true;
        if (roomsStr.includes(word)) return true;
      }
      
      // Brand'da ara (otomotiv)
      if (searchField(listing.brand)) return true;
      
      // Model'de ara (otomotiv)
      if (searchField(listing.model)) return true;
      
      // Color'da ara (otomotiv)
      if (searchField(listing.color)) return true;
      
      // Area'da ara - sayısal
      if (word.match(/^\d+$/)) {
        if (listing.area && listing.area.toString().includes(word)) return true;
      }
      
      // Fuel type'da ara
      if (searchField(listing.fuel_type)) return true;
      
      // Transmission'da ara
      if (searchField(listing.transmission)) return true;
      
      return false;
    });

    // Debug: Her kelime sonrası kaç iş kaldı
    console.log(`  Word "${word}"${wordWithoutSuffix !== word ? ` (root: "${wordWithoutSuffix}")` : ''}: ${beforeCount} → ${results.length} results`);

    // Eğer hiç sonuç kalmadıysa, daha fazla arama yapmaya gerek yok
    if (results.length === 0) {
      console.log(`  No results for word "${word}", stopping search`);
      break;
    }
  }

  console.log(`✅ Final Results: ${results.length} listings found`);
  return results;
}

/**
 * Özellik filtrelemesi
 */
export function filterByProperty(
  listings: Listing[],
  propertyType: string
): Listing[] {
  if (propertyType === 'all') return listings;
  if (propertyType === 'emlak') {
    return listings.filter(l => l.property_type !== 'vasita');
  }
  return listings.filter(l => l.property_type === propertyType);
}

/**
 * Search listings by type and query
 * Combines searchListings and filterByProperty
 */
export function searchListingsByType(
  listings: Listing[],
  query: string,
  propertyType: string
): Listing[] {
  // First filter by property type
  const filtered = filterByProperty(listings, propertyType);
  
  // Then search within filtered results
  return searchListings(filtered, query);
}
