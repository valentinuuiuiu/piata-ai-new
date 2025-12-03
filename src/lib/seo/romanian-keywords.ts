// Romanian SEO Keywords Database - Generated from Market Intelligence Analysis
export interface RomanianKeyword {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: 'transactional' | 'informational' | 'navigational';
  category: string;
  city?: string;
  competitor?: 'olx' | 'emag' | 'general';
  priority: 'high' | 'medium' | 'low';
}

export const ROMANIAN_KEYWORDS: RomanianKeyword[] = [
  // Primary Marketplace Keywords
  {
    keyword: "anunțuri românia",
    searchVolume: 22000,
    difficulty: 85,
    intent: "transactional",
    category: "primary",
    priority: "high"
  },
  {
    keyword: "marketplace romania",
    searchVolume: 18500,
    difficulty: 78,
    intent: "transactional",
    category: "primary",
    priority: "high"
  },
  {
    keyword: "vanzari online",
    searchVolume: 31200,
    difficulty: 82,
    intent: "transactional",
    category: "primary",
    priority: "high"
  },
  {
    keyword: "cumparaturi online romania",
    searchVolume: 27800,
    difficulty: 79,
    intent: "transactional",
    category: "primary",
    priority: "high"
  },

  // Competitor Targeting Keywords
  {
    keyword: "alternativa la olx",
    searchVolume: 8900,
    difficulty: 72,
    intent: "transactional",
    category: "competitor",
    competitor: "olx",
    priority: "high"
  },
  {
    keyword: "vs olx",
    searchVolume: 5600,
    difficulty: 68,
    intent: "navigational",
    category: "competitor",
    competitor: "olx",
    priority: "high"
  },
  {
    keyword: "alternativa la emag",
    searchVolume: 12400,
    difficulty: 75,
    intent: "transactional",
    category: "competitor",
    competitor: "emag",
    priority: "high"
  },
  {
    keyword: "vs emag",
    searchVolume: 4200,
    difficulty: 65,
    intent: "navigational",
    category: "competitor",
    competitor: "emag",
    priority: "medium"
  },

  // Local City Keywords
  {
    keyword: "piata online bucuresti",
    searchVolume: 15600,
    difficulty: 70,
    intent: "transactional",
    category: "local",
    city: "Bucuresti",
    priority: "high"
  },
  {
    keyword: "vanzari cluj napoca",
    searchVolume: 9800,
    difficulty: 65,
    intent: "transactional",
    category: "local",
    city: "Cluj-Napoca",
    priority: "high"
  },
  {
    keyword: "anunturi gratuite timisoara",
    searchVolume: 7400,
    difficulty: 62,
    intent: "transactional",
    category: "local",
    city: "Timisoara",
    priority: "medium"
  },
  {
    keyword: "marketplace iasi",
    searchVolume: 6800,
    difficulty: 60,
    intent: "transactional",
    category: "local",
    city: "Iasi",
    priority: "medium"
  },
  {
    keyword: "vanzari constanta",
    searchVolume: 5200,
    difficulty: 58,
    intent: "transactional",
    category: "local",
    city: "Constanta",
    priority: "medium"
  },

  // Product Category Keywords
  {
    keyword: "electronice romania",
    searchVolume: 35000,
    difficulty: 88,
    intent: "transactional",
    category: "products",
    priority: "high"
  },
  {
    keyword: "haine online romania",
    searchVolume: 29500,
    difficulty: 85,
    intent: "transactional",
    category: "products",
    priority: "high"
  },
  {
    keyword: "mobila online",
    searchVolume: 22100,
    difficulty: 80,
    intent: "transactional",
    category: "products",
    priority: "high"
  },
  {
    keyword: "auto second hand",
    searchVolume: 18900,
    difficulty: 82,
    intent: "transactional",
    category: "products",
    priority: "high"
  },
  {
    keyword: "imobiliare vanzari",
    searchVolume: 16800,
    difficulty: 85,
    intent: "transactional",
    category: "products",
    priority: "high"
  },

  // Long-tail Keywords
  {
    keyword: "unde vind cel mai ieftin online",
    searchVolume: 8400,
    difficulty: 55,
    intent: "informational",
    category: "long-tail",
    priority: "medium"
  },
  {
    keyword: "cel mai sigur marketplace romanesc",
    searchVolume: 3200,
    difficulty: 45,
    intent: "informational",
    category: "long-tail",
    priority: "medium"
  },
  {
    keyword: "plateste ramburs marketplace",
    searchVolume: 5600,
    difficulty: 50,
    intent: "transactional",
    category: "long-tail",
    priority: "medium"
  },
  {
    keyword: "fara comision vanzare online",
    searchVolume: 4800,
    difficulty: 48,
    intent: "transactional",
    category: "long-tail",
    priority: "medium"
  }
];

// Competitor Analysis Keywords for Tracking
export const COMPETITOR_KEYWORDS = {
  olx: [
    "olx romania",
    "anunturi olx",
    "olx.ro",
    "cumparaturi olx",
    "vinde pe olx"
  ],
  emag: [
    "emag romania",
    "emag.ro", 
    "cumparaturi emag",
    "electronice emag",
    "emag marketplace"
  ],
  general: [
    "piata online",
    "marketplace romanesc",
    "vanzari pe internet",
    "cumparaturi sigure"
  ]
};

// Seasonal Keywords
export const SEASONAL_KEYWORDS = {
  black_friday: [
    "black friday romania 2024",
    "reduceri black friday",
    "cele mai mari reduceri"
  ],
  christmas: [
    "cadouri de craciun",
    "idei cadouri",
    "preparate craciun"
  ],
  back_to_school: [
    "rentree 2024",
    "back to school romania",
    "materiale scolare"
  ],
  valentine: [
    "cadouri valentine's day",
    "idei pentru el",
    "idei pentru ea"
  ]
};

// Mobile-First Keywords (High Mobile Search Volume)
export const MOBILE_FIRST_KEYWORDS = [
  "aplicatie marketplace",
  "app vanzari",
  "cumpar cu telefonul",
  "vinde din mobil",
  "marketplace mobile"
];

// Generate SEO Content Calendar
export function generateContentCalendar(): Array<{
  date: string;
  keyword: string;
  contentType: 'blog' | 'landing' | 'product' | 'social';
  title: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const calendar: any[] = [];
  
  // Priority keywords for immediate content
  const highPriorityKeywords = ROMANIAN_KEYWORDS.filter(k => k.priority === 'high');
  
  highPriorityKeywords.forEach((keyword, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index * 2); // Every 2 days
    
    calendar.push({
      date: date.toISOString().split('T')[0],
      keyword: keyword.keyword,
      contentType: keyword.category === 'competitor' ? 'landing' : 'blog',
      title: generateBlogTitle(keyword.keyword, keyword.category),
      priority: keyword.priority
    });
  });
  
  return calendar.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function generateBlogTitle(keyword: string, category: string): string {
  const titles: Record<string, string[]> = {
    competitor: [
      `De ce să alegi ${keyword} în 2024`,
      `Ghid complet: ${keyword}`,
      `${keyword} vs concurența - Analiză detaliată`
    ],
    local: [
      `Cum să vinzi online în ${keyword}`,
      `Ghid pentru ${keyword}`,
      `Top sfaturi pentru ${keyword}`
    ],
    products: [
      `Cele mai bune oferte: ${keyword}`,
      `Ghidul complet pentru ${keyword}`,
      `Cum să alegi ${keyword} - sfaturi experte`
    ],
    primary: [
      `Totul despre ${keyword}`,
      `Cum să ${keyword} - ghidul complet`,
      `${keyword} - soluția modernă pentru cumpărături online`
    ]
  };
  
  const categoryTitles = titles[category] || titles.primary;
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

// Export helper functions
export const SEO_UTILS = {
  // Get keywords by priority
  getKeywordsByPriority(priority: 'high' | 'medium' | 'low'): RomanianKeyword[] {
    return ROMANIAN_KEYWORDS.filter(k => k.priority === priority);
  },
  
  // Get keywords by category
  getKeywordsByCategory(category: string): RomanianKeyword[] {
    return ROMANIAN_KEYWORDS.filter(k => k.category === category);
  },
  
  // Get city-specific keywords
  getKeywordsByCity(city: string): RomanianKeyword[] {
    return ROMANIAN_KEYWORDS.filter(k => k.city === city);
  },
  
  // Get competitor keywords
  getCompetitorKeywords(competitor: 'olx' | 'emag' | 'general'): RomanianKeyword[] {
    return ROMANIAN_KEYWORDS.filter(k => k.competitor === competitor);
  },
  
  // Get high-volume, low-difficulty opportunities
  getQuickWins(): RomanianKeyword[] {
    return ROMANIAN_KEYWORDS.filter(k => 
      k.searchVolume > 5000 && k.difficulty < 70
    );
  }
};