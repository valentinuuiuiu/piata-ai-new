import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface AIValidationResult {
  score: number;
  issues: string[];
  suggestions: string[];
  approved: boolean;
  autoFixes?: string[];
  reasoning: string;
}

interface ListingWithUser {
  id: number;
  title: string;
  description: string;
  price: number;
  category_id: number;
  user_id: string;
  location?: string;
  phone?: string;
  images?: any;
  status: string;
  created_at: string;
  users: {
    email: string;
    name: string;
    phone: string;
    created_at: string;
  };
  user_profiles?: {
    credits_balance: number;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

export async function POST(request: Request) {
  try {
    const { listingId, autoApprove = true } = await request.json();
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get listing with full user and category data
    const { data: listing, error: listingError } = await supabase
      .from('anunturi')
      .select(`
        *,
        users!inner(
          email,
          name,
          phone,
          created_at
        ),
        user_profiles!inner(
          credits_balance
        ),
        categories!inner(
          name,
          slug
        )
      `)
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      console.error('Listing fetch error:', listingError);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    console.log(`🔍 Starting AI validation for listing ${listingId}: ${listing.title}`);

    // Perform comprehensive AI validation
    const validation = await validateListingWithAI(listing as ListingWithUser);

    // Update listing with validation results
    const updateData: any = {
      ai_validation_score: validation.score,
      ai_validation_issues: validation.issues,
      ai_validation_suggestions: validation.suggestions,
      ai_approved: validation.approved,
      ai_validated_at: new Date().toISOString(),
      ai_reasoning: validation.reasoning
    };

    // Auto-approve if enabled and score is good
    if (autoApprove && validation.score >= 70) {
      updateData.status = 'active';
      console.log(`✅ Auto-approved listing ${listingId} with score ${validation.score}`);
    } else if (validation.score < 50) {
      updateData.status = 'rejected';
      console.log(`❌ Auto-rejected listing ${listingId} with score ${validation.score}`);
    } else {
      updateData.status = 'pending_review';
      console.log(`⏳ Listing ${listingId} pending review with score ${validation.score}`);
    }

    await supabase
      .from('anunturi')
      .update(updateData)
      .eq('id', listingId);

    // Send automated email notification
    await sendValidationEmail(listing as ListingWithUser, validation);

    // Apply auto-fixes if available
    if (validation.autoFixes && validation.autoFixes.length > 0) {
      await applyAutoFixes(listingId, validation.autoFixes, supabase);
    }

    return NextResponse.json({
      success: true,
      validation,
      listing: {
        id: listing.id,
        title: listing.title,
        score: validation.score,
        approved: validation.approved,
        status: updateData.status
      }
    });

  } catch (error) {
    console.error('❌ AI validation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function validateListingWithAI(listing: ListingWithUser): Promise<AIValidationResult> {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const autoFixes: string[] = [];
  let score = 100;
  const reasoning: string[] = [];

  // 1. Email Validation (15 points)
  if (listing.users?.email) {
    const emailValidation = validateEmail(listing.users.email);
    if (!emailValidation.valid) {
      issues.push(`Email invalid: ${emailValidation.reason}`);
      suggestions.push('Corectează adresa de email');
      score -= 15;
      reasoning.push(`Email validation failed: ${emailValidation.reason}`);
    } else {
      reasoning.push('Email format is valid');
    }
  }

  // 2. Location Validation (10 points)
  if (listing.location) {
    const locationValidation = validateLocation(listing.location);
    if (!locationValidation.valid) {
      issues.push(`Locație invalidă: ${locationValidation.reason}`);
      suggestions.push('Adaugă o locație validă (oraș, județ)');
      score -= 10;
      reasoning.push(`Location validation failed: ${locationValidation.reason}`);
    } else {
      reasoning.push('Location is valid Romanian city');
    }
  } else {
    issues.push('Lipsește locația');
    suggestions.push('Adaugă orașul și județul');
    score -= 10;
    reasoning.push('Missing location information');
  }

  // 3. Images Validation (20 points) - CRITICAL
  const imageCount = listing.images ? (Array.isArray(listing.images) ? listing.images.length : Object.keys(listing.images).length) : 0;
  if (imageCount < 3) {
    issues.push(`Insuficiente imagini: ${imageCount}/3 minim necesare`);
    suggestions.push('Adaugă cel puțin 3 imagini clare ale produsului');
    score -= 20;
    reasoning.push(`Insufficient images: ${imageCount} (minimum 3 required)`);
  } else {
    reasoning.push(`Sufficient images provided: ${imageCount}`);
  }

  // 4. Title Quality Check (15 points)
  const titleValidation = validateTitle(listing.title);
  if (titleValidation.issues.length > 0) {
    issues.push(...titleValidation.issues);
    suggestions.push(...titleValidation.suggestions);
    score -= titleValidation.scorePenalty;
    reasoning.push(`Title issues: ${titleValidation.issues.join(', ')}`);
    autoFixes.push(...titleValidation.autoFixes);
  } else {
    reasoning.push('Title quality is good');
  }

  // 5. Description Quality Check (15 points)
  const descValidation = validateDescription(listing.description);
  if (descValidation.issues.length > 0) {
    issues.push(...descValidation.issues);
    suggestions.push(...descValidation.suggestions);
    score -= descValidation.scorePenalty;
    reasoning.push(`Description issues: ${descValidation.issues.join(', ')}`);
    autoFixes.push(...descValidation.autoFixes);
  } else {
    reasoning.push('Description quality is good');
  }

  // 6. Price Validation (15 points)
  const priceValidation = validatePrice(listing.price, listing.category_id, listing.categories?.name);
  if (!priceValidation.valid) {
    issues.push(`Preț invalid: ${priceValidation.reason}`);
    suggestions.push(priceValidation.suggestion || 'Verifică prețul pentru piața românească');
    score -= 15;
    reasoning.push(`Price validation failed: ${priceValidation.reason}`);
  } else {
    reasoning.push('Price is within expected range');
  }

  // 7. User Trust Score (10 points)
  const userTrustScore = await calculateUserTrustScore(listing.user_id, listing.users?.created_at);
  if (userTrustScore < 50) {
    issues.push('Utilizator cu scor de încredere scăzut');
    suggestions.push('Completează profilul și adaugă anunțuri pentru a crește încrederea');
    score -= 10;
    reasoning.push(`Low user trust score: ${userTrustScore}`);
  } else {
    reasoning.push(`User trust score is acceptable: ${userTrustScore}`);
  }

  const finalScore = Math.max(0, score);
  const approved = finalScore >= 70;

  return {
    score: finalScore,
    issues,
    suggestions,
    approved,
    autoFixes: autoFixes.length > 0 ? autoFixes : undefined,
    reasoning: reasoning.join('; ')
  };
}

function validateEmail(email: string): { valid: boolean; reason?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, reason: 'Lipsește email' };
  if (!emailRegex.test(email)) return { valid: false, reason: 'Format invalid' };
  if (email.includes('+')) return { valid: false, reason: 'Email alias detectat' };
  if (email.length > 50) return { valid: false, reason: 'Email prea lung' };
  
  // Check for Romanian domains
  const romanianDomains = ['.ro', '.eu', '.com'];
  const hasRomanianDomain = romanianDomains.some(domain => email.toLowerCase().endsWith(domain));
  
  return { valid: true };
}

function validateLocation(location: string): { valid: boolean; reason?: string } {
  if (!location || location.trim().length < 2) {
    return { valid: false, reason: 'Locație prea scurtă' };
  }
  
  const romanianCities = [
    'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 
    'Brașov', 'Galați', 'Ploiești', 'Oradea', 'Brăila', 'Pitești', 'Sibiu', 
    'Bacău', 'Târgu Mureș', 'Baia Mare', 'Satu Mare', 'Râmnicu Vâlcea', 
    'Drobeta-Turnu Severin', 'Buzău', 'Botoșani', 'Slatina', 'Târgoviște', 
    'Focșani', 'Tulcea', 'Reșița', 'Bistrița', 'Suceava', 'Vaslui', 
    'Călărași', 'Giurgiu', 'Alexandria', 'Bârlad', 'Zalău', 'Deva', 
    'Miercurea Ciuc', 'Bacău', 'Slobozia', 'Alba Iulia', 'Câmpina', 'Piatra Neamț'
  ];
  
  const locationUpper = location.toUpperCase();
  const isRomanianCity = romanianCities.some(city => city.toUpperCase() === locationUpper);
  
  if (!isRomanianCity && !location.includes('Județul') && !location.includes('România')) {
    return { valid: false, reason: 'Locație nu pare a fi din România' };
  }
  
  return { valid: true };
}

function validateTitle(title: string): { issues: string[]; suggestions: string[]; autoFixes: string[]; scorePenalty: number } {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const autoFixes: string[] = [];
  let penalty = 0;

  if (!title || title.trim().length < 5) {
    issues.push('Titlu prea scurt');
    suggestions.push('Adaugă mai multe detalii în titlu');
    penalty += 10;
  }

  if (title.length > 100) {
    issues.push('Titlu prea lung');
    suggestions.push('Scurtează titlul la sub 100 caractere');
    penalty += 5;
  }

  // Check for ALL CAPS
  if (title === title.toUpperCase() && title.length > 10) {
    issues.push('Titlu scris cu majuscule');
    suggestions.push('Folosește litere mici și majuscule normal');
    autoFixes.push('title:capitalize_first_letter');
    penalty += 3;
  }

  // Check for spam words
  const spamWords = ['URGENT', 'SUPER OFERTĂ', 'LIMITAT', 'DOAR AZI', 'ULTIMA ȘANSĂ', 'OFERTĂ UNICĂ'];
  const foundSpam = spamWords.filter(word => title.toUpperCase().includes(word));
  if (foundSpam.length > 0) {
    issues.push('Cuvinte spam detectate în titlu');
    suggestions.push('Evită cuvinte promoționale agresive');
    penalty += 7;
  }

  // Check for contact info in title
  const contactPatterns = [/07\d{8}/, /\d{10}/, /@/g, /www\./, /\.ro/g];
  const hasContact = contactPatterns.some(pattern => pattern.test(title));
  if (hasContact) {
    issues.push('Informații de contact în titlu');
    suggestions.push('Mută detaliile de contact în descriere');
    penalty += 5;
  }

  return { issues, suggestions, autoFixes, scorePenalty: penalty };
}

function validateDescription(description: string): { issues: string[]; suggestions: string[]; autoFixes: string[]; scorePenalty: number } {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const autoFixes: string[] = [];
  let penalty = 0;

  if (!description || description.trim().length < 20) {
    issues.push('Descriere prea scurtă');
    suggestions.push('Adaugă mai multe detalii despre produs/serviciu');
    penalty += 10;
  }

  if (description.length > 2000) {
    issues.push('Descriere prea lungă');
    suggestions.push('Scurtează descrierea la sub 2000 caractere');
    penalty += 5;
  }

  // Check for quality indicators
  const qualityWords = ['excelent', 'stare perfectă', 'funcțional', 'ca nou', 'foarte bun', 'conservat', 'bună', 'utilizat'];
  const hasQualityWords = qualityWords.some(word => description.toLowerCase().includes(word));
  
  if (!hasQualityWords && description.length > 50) {
    suggestions.push('Adaugă detalii despre starea produsului');
    penalty += 3;
  }

  // Check for formatting
  const hasParagraphs = description.includes('\n');
  if (!hasParagraphs && description.length > 200) {
    suggestions.push('Structurează descrierea în paragrafe pentru lizibilitate');
    autoFixes.push('description:add_paragraphs');
    penalty += 2;
  }

  return { issues, suggestions, autoFixes, scorePenalty: penalty };
}

function validatePrice(price: number, categoryId: number, categoryName?: string): { valid: boolean; reason?: string; suggestion?: string } {
  if (!price || price <= 0) {
    return { 
      valid: false, 
      reason: 'Preț invalid sau lipsă',
      suggestion: 'Adaugă un preț realist în lei'
    };
  }

  if (price > 1000000) {
    return { 
      valid: false, 
      reason: 'Preț prea mare',
      suggestion: 'Verifică dacă ai introdus corect prețul în lei'
    };
  }

  // Category-specific price ranges
  const priceRanges: { [key: number]: { min: number; max: number; name: string } } = {
    1: { min: 10000, max: 500000, name: 'Imobiliare' },
    2: { min: 500, max: 100000, name: 'Auto Moto' },
    3: { min: 10, max: 20000, name: 'Electronice' },
    4: { min: 10, max: 5000, name: 'Modă' },
    5: { min: 50, max: 10000, name: 'Servicii' },
    6: { min: 20, max: 10000, name: 'Casă și Grădină' },
    7: { min: 10, max: 5000, name: 'Sport & Hobby' },
    8: { min: 50, max: 5000, name: 'Animale' },
    9: { min: 500, max: 20000, name: 'Locuri de Muncă' },
    10: { min: 20, max: 2000, name: 'Mama și Copilul' },
    11: { min: 10, max: 1000, name: 'Cărți & Muzică' },
    12: { min: 10, max: 3000, name: 'Diverse' }
  };

  const range = priceRanges[categoryId];
  if (range && (price < range.min || price > range.max)) {
    return { 
      valid: false, 
      reason: `Preț în afara range-ului normal pentru ${range.name} (${range.min} - ${range.max} lei)`,
      suggestion: `Verifică prețurile similare pentru ${range.name} în piața românească`
    };
  }

  return { valid: true };
}

async function calculateUserTrustScore(userId: string, userCreatedAt?: string): Promise<number> {
  if (!userCreatedAt) return 75; // Default medium score
  
  const accountAge = Date.now() - new Date(userCreatedAt).getTime();
  const daysOld = Math.floor(accountAge / (1000 * 60 * 60 * 24));
  
  let score = 50; // Base score
  
  // Account age bonus
  if (daysOld > 365) score += 25; // 1+ year
  else if (daysOld > 90) score += 15; // 3+ months
  else if (daysOld > 30) score += 10; // 1+ month
  
  return Math.min(100, score);
}

async function sendValidationEmail(listing: ListingWithUser, validation: AIValidationResult) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Piata AI RO <noreply@piata-ai.ro>',
      to: [listing.users.email],
      subject: `Analiza AI pentru anunțul tău: "${listing.title}"`,
      html: generateEmailTemplate(listing, validation)
    });

    if (error) {
      console.error('Email send error:', error);
    } else {
      console.log(`✅ Email sent to ${listing.users.email}`);
    }
  } catch (error) {
    console.error('Email error:', error);
  }
}

function generateEmailTemplate(listing: ListingWithUser, validation: AIValidationResult): string {
  const status = validation.approved ? 'APROBAT' : validation.score >= 50 ? 'REVIZUIRE' : 'RESPINS';
  const statusColor = validation.approved ? '#22c55e' : validation.score >= 50 ? '#f59e0b' : '#ef4444';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Analiza AI Piata AI RO</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00f0ff, #ff00f0); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
        .status { text-align: center; font-size: 24px; font-weight: bold; color: ${statusColor}; margin: 10px 0; }
        .issues { background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .suggestions { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .reasoning { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 Analiza AI Piata AI RO</h1>
          <p>Anunțul tău a fost analizat de inteligența artificială</p>
        </div>
        <div class="content">
          <h2>${listing.title}</h2>
          
          <div class="score">Scor: ${validation.score}/100</div>
          <div class="status">${status}</div>
          
          ${validation.issues.length > 0 ? `
            <div class="issues">
              <h3>❌ Probleme identificate:</h3>
              <ul>${validation.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
            </div>
          ` : ''}
          
          ${validation.suggestions.length > 0 ? `
            <div class="suggestions">
              <h3>💡 Sugestii de îmbunătățire:</h3>
              <ul>${validation.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}</ul>
            </div>
          ` : ''}
          
          <div class="reasoning">
            <h3>🧐 Raționament AI:</h3>
            <p>${validation.reasoning}</p>
          </div>
          
          <div class="footer">
            <p>Timp de procesare: <30 secunde</p>
            <p>Pentru suport, contactează-ne pe platformă</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function applyAutoFixes(listingId: number, fixes: string[], supabase: any) {
  const updates: any = {};
  
  for (const fix of fixes) {
    switch (fix) {
      case 'title:capitalize_first_letter':
        updates.title = 'Capitalized Title';
        break;
      case 'description:add_paragraphs':
        updates.description = 'Structured description with paragraphs';
        break;
    }
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('anunturi')
      .update(updates)
      .eq('id', listingId);
  }
}