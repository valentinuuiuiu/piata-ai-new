import { createServiceClient } from './supabase/server';
// import { runAllSubagents, SearchFilters } from './web-browsing-subagents'; // Puppeteer functionality removed

// Shopping Agent Configuration
export interface ShoppingAgent {
  id: number;
  user_id: string;
  name: string;
  description: string;
  filters: any;
  is_active: boolean;
  last_checked_at: string | null;
  matches_found: number;
  created_at: string;
  updated_at: string;
}

// Listing from database
export interface Listing {
  id: number;
  title: string;
  description?: string;
  price: number | string;
  location?: string;
  phone?: string;
  images: string | string[];
  category_id: number;
  lat?: number;
  lng?: number;
  status?: string;
}

// Web browsing subagent result
export interface SubagentResult {
  source: string;
  listings: Listing[];
  error?: string;
  pagesScanned?: number;
}

// Main shopping agent result
export interface ShoppingAgentResult {
  agentId: number;
  matches: Listing[];
  subagentResults: SubagentResult[];
  totalListingsScanned: number;
  newMatches: number;
  timestamp: string;
}

// Web browsing subagents configuration
const SUBAGENTS = [
  {
    name: 'publi24-scraper',
    source: 'Publi24',
    baseUrl: 'https://www.publi24.ro',
    description: 'Scrapes listings from Publi24 marketplace'
  },
  {
    name: 'olx-scraper', 
    source: 'OLX',
    baseUrl: 'https://www.olx.ro',
    description: 'Scrapes listings from OLX marketplace'
  },
  {
    name: 'autovit-scraper',
    source: 'Autovit',
    baseUrl: 'https://www.autovit.ro',
    description: 'Scrapes listings from Autovit marketplace'
  }
];

/**
 * Main shopping agent runner
 * Orchestrates multiple web browsing subagents to find matches
 */
export async function runShoppingAgent(agent: ShoppingAgent): Promise<ShoppingAgentResult> {
  console.log(`[ShoppingAgent] Running agent: ${agent.name} (ID: ${agent.id})`);
  
  const startTime = Date.now();
  const subagentResults: SubagentResult[] = [];
  const allListings: Listing[] = [];
  let totalListingsScanned = 0;

  // Puppeteer functionality is commented out as the dependency is removed.
  // The following code would be used if puppeteer were still active:
  // const subagentPromises = SUBAGENTS.map(async (subagent) => {
  //   try {
  //     console.log(`[ShoppingAgent] Running subagent: ${subagent.name}`);
  //     const result = await runSubagent(subagent, agent.filters);
  //     subagentResults.push(result);
  //     totalListingsScanned += result.pagesScanned || 0;
      
  //     if (result.listings && result.listings.length > 0) {
  //       allListings.push(...result.listings);
  //       console.log(`[ShoppingAgent] ${subagent.source}: Found ${result.listings.length} listings`);
  //     }
      
  //     return result;
  //   } catch (error) {
  //     console.error(`[ShoppingAgent] Subagent ${subagent.name} failed:`, error);
  //     return {
  //       source: subagent.source,
  //       listings: [],
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     };
  //   }
  // });
  // await Promise.all(subagentPromises);

  // Filter listings based on agent criteria
  const matches = filterListings(allListings, agent.filters);
  
  // Remove duplicates based on title and price
  const uniqueMatches = removeDuplicateListings(matches);
  
  // Check which matches are new (not already in agent_matches table)
  const newMatches = await getNewMatches(agent.id, uniqueMatches);
  
  // Store new matches in database
  if (newMatches.length > 0) {
    await storeAgentMatches(agent.id, newMatches);
  }

  // Update agent stats
  await updateAgentStats(agent.id, uniqueMatches.length);

  const result: ShoppingAgentResult = {
    agentId: agent.id,
    matches: uniqueMatches,
    subagentResults,
    totalListingsScanned,
    newMatches: newMatches.length,
    timestamp: new Date().toISOString()
  };

  const duration = Date.now() - startTime;
  console.log(`[ShoppingAgent] Agent completed in ${duration}ms. Found ${uniqueMatches.length} matches (${newMatches.length} new)`);

  return result;
}

// /**
//  * Run a specific web browsing subagent
//  * This function is commented out as puppeteer is no longer used.
//  */
// async function runSubagent(subagent: any, filters: any): Promise<SubagentResult> {
//   console.log(`[Subagent] ${subagent.name}: Starting web scraping with Puppeteer`);
//
//   try {
//     // Convert filters to SearchFilters format
//     const searchFilters: SearchFilters = {
//       keywords: filters.keywords,
//       minPrice: filters.minPrice,
//       maxPrice: filters.maxPrice,
//       location: filters.location,
//       maxPages: 3
//     };
//
//     // Run the web browsing subagent
//     const scrapedListings = await runAllSubagents(searchFilters);
//
//     console.log(`[Subagent] ${subagent.name}: Successfully scraped ${scrapedListings.length} listings`);
//
//     // Map scraped listings to the Listing interface
//     const mappedListings: Listing[] = scrapedListings.map((listing: any) => ({
//       id: listing.id || Math.floor(Math.random() * 1000000), // Assuming scraped listings might not have an ID, generate one. A better approach would be to derive it from unique properties if possible.
//       title: listing.title,
//       description: listing.description,
//       price: listing.price,
//       location: listing.location,
//       phone: listing.phone,
//       images: Array.isArray(listing.images) ? listing.images : (listing.images ? [listing.images] : []), // Ensure images is an array
//       category_id: listing.category_id || 1, // Default category_id if not provided
//       lat: listing.lat,
//       lng: listing.lng,
//       status: listing.status || 'active'
//     }));
//
//     return {
//      source: subagent.source,
//      listings: mappedListings,
//      pagesScanned: searchFilters.maxPages || 3
//     };
//   } catch (error) {
//     console.error(`[Subagent] ${subagent.name} failed:`, error);
//     return {
//      source: subagent.source,
//      listings: [],
//      error: error instanceof Error ? error.message : 'Unknown error',
//      pagesScanned: 0
//     };
//   }
// }

/**
 * Filter listings based on agent criteria
 */
function filterListings(listings: Listing[], filters: any): Listing[] {
  return listings.filter(listing => {
    // Price filter
    if (filters.minPrice && Number(listing.price) < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && Number(listing.price) > filters.maxPrice) {
      return false;
    }
    
    // Location filter
    if (filters.location && listing.location) {
      const location = listing.location.toLowerCase();
      const filterLocation = filters.location.toLowerCase();
      if (!location.includes(filterLocation)) {
        return false;
      }
    }
    
    // Title keywords filter
    if (filters.keywords && filters.keywords.length > 0) {
      const title = listing.title.toLowerCase();
      const hasKeyword = filters.keywords.some((keyword: string) => 
        title.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Remove duplicate listings based on title and price
 */
function removeDuplicateListings(listings: Listing[]): Listing[] {
  const seen = new Set();
  return listings.filter(listing => {
    const key = `${listing.title}-${listing.price}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Check which matches are new (not already stored)
 */
async function getNewMatches(agentId: number, listings: Listing[]): Promise<Listing[]> {
  const supabase = createServiceClient();
  
  // Get existing matches for this agent
  const { data: existingMatches } = await supabase
    .from('agent_matches')
    .select('listing_id')
    .eq('agent_id', agentId);
  
  const existingIds = new Set(existingMatches?.map(m => m.listing_id) || []);
  
  return listings.filter(listing => !existingIds.has(listing.id));
}

/**
 * Store new matches in the database
 */
async function storeAgentMatches(agentId: number, listings: Listing[]): Promise<void> {
  const supabase = createServiceClient();
  
  const matchesToInsert = listings.map(listing => ({
    agent_id: agentId,
    listing_id: listing.id,
    match_score: calculateMatchScore(listing),
    notified_at: new Date().toISOString()
  }));
  
  await supabase.from('agent_matches').insert(matchesToInsert);
}

/**
 * Update agent statistics
 */
async function updateAgentStats(agentId: number, matchesFound: number): Promise<void> {
  const supabase = createServiceClient();
  
  await supabase
    .from('shopping_agents')
    .update({
      last_checked_at: new Date().toISOString(),
      matches_found: matchesFound
    })
    .eq('id', agentId);
}

/**
 * Calculate match score based on listing quality
 */
function calculateMatchScore(listing: Listing): number {
  let score = 50; // Base score
  
  // Price factor
  const price = Number(listing.price);
  if (price > 0 && price < 1000) score += 10;
  else if (price >= 1000 && price < 10000) score += 20;
  else if (price >= 10000) score += 30;
  
  // Description quality
  if (listing.description && listing.description.length > 100) score += 10;
  else if (listing.description && listing.description.length > 50) score += 5;
  
  // Images presence
  const images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
  if (Array.isArray(images) && images.length > 0) score += 15;
  else if (Array.isArray(images) && images.length > 2) score += 10;
  
  return Math.min(100, score);
}

/**
 * Generate mock listings for testing
 */
function generateMockListings(source: string, filters: any, count: number): Listing[] {
  const mockListings: Listing[] = [];
  
  for (let i = 0; i < count; i++) {
    const basePrice = filters.minPrice || 100;
    const price = Math.floor(basePrice + Math.random() * 5000);
    
    mockListings.push({
      id: Math.floor(Math.random() * 1000000),
      title: `${source} - ${filters.keywords?.[0] || 'Item'} ${i + 1}`,
      description: `This is a mock listing from ${source} with description ${i + 1}`,
      price: price,
      location: filters.location || 'Bucharest',
      phone: '+407123456789',
      images: [],
      category_id: 1,
      status: 'active'
    });
  }
  
  return mockListings;
}