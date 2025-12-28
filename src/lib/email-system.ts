import { analyticsSystem } from './analytics-system';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  campaignType: CampaignType;
  targetSegment: UserSegment;
  triggerType: TriggerType;
  delayMinutes?: number;
}

export enum CampaignType {
  WELCOME = 'welcome',
  COMPETITOR_ANALYSIS = 'competitor_analysis',
  PRODUCT_CATEGORY = 'product_category',
  LOYALTY_RETENTION = 'loyalty_retention',
  RE_ENGAGEMENT = 're_engagement',
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional'
}

export enum UserSegment {
  NEW_USERS = 'new_users',
  OLX_USERS = 'olx_users',
  EMAG_USERS = 'emag_users',
  ELECTRONICS_INTERESTED = 'electronics_interested',
  FASHION_INTERESTED = 'fashion_interested',
  HOME_GARDEN_INTERESTED = 'home_garden_interested',
  INACTIVE_USERS = 'inactive_users',
  LOYAL_CUSTOMERS = 'loyal_customers',
  HIGH_VALUE_USERS = 'high_value_users'
}

export enum TriggerType {
  SIGNUP = 'signup',
  FIRST_PURCHASE = 'first_purchase',
  CART_ABANDONMENT = 'cart_abandonment',
  INACTIVITY = 'inactivity',
  PURCHASE_COMPLETION = 'purchase_completion',
  SCHEDULED = 'scheduled',
  BIRTHDAY = 'birthday'
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateIds: string[];
  targetSegment: UserSegment;
  triggerType: TriggerType;
  scheduling?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  segment: UserSegment;
  interests: string[];
  totalSpent: number;
  lastActivity: Date;
  signupDate: Date;
  isActive: boolean;
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    communicationFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

export interface EmailAnalytics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  sentAt: Date;
}

export class EmailMarketingSystem {
  private templates: Map<string, EmailTemplate> = new Map();
  private campaigns: Map<string, EmailCampaign> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private analytics: EmailAnalytics[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Welcome Series Templates
    this.templates.set('welcome_1', {
      id: 'welcome_1',
      name: 'Welcome Email #1 - Introduction',
      subject: 'Bun venit pe platforma noastră! 🚀 Descoperă avantajele pe care le ai aici',
      campaignType: CampaignType.WELCOME,
      targetSegment: UserSegment.NEW_USERS,
      triggerType: TriggerType.SIGNUP,
      delayMinutes: 0,
      htmlContent: this.getWelcomeEmail1HTML(),
      textContent: this.getWelcomeEmail1Text()
    });

    this.templates.set('welcome_2', {
      id: 'welcome_2', 
      name: 'Welcome Email #2 - OLX Comparison',
      subject: 'De ce să alegi platforma noastră în loc de OLX? 🤔',
      campaignType: CampaignType.WELCOME,
      targetSegment: UserSegment.NEW_USERS,
      triggerType: TriggerType.SIGNUP,
      delayMinutes: 60 * 24, // 24 hours
      htmlContent: this.getWelcomeEmail2HTML(),
      textContent: this.getWelcomeEmail2Text()
    });

    this.templates.set('welcome_3', {
      id: 'welcome_3',
      name: 'Welcome Email #3 - First Purchase Incentive',
      subject: 'Oferta specială pentru prima ta comandă! 💰 Economisește 20% astăzi',
      campaignType: CampaignType.WELCOME,
      targetSegment: UserSegment.NEW_USERS,
      triggerType: TriggerType.SIGNUP,
      delayMinutes: 60 * 24 * 3, // 3 days
      htmlContent: this.getWelcomeEmail3HTML(),
      textContent: this.getWelcomeEmail3Text()
    });

    // Competitor Analysis Campaign
    this.templates.set('olx_competitor', {
      id: 'olx_competitor',
      name: 'OLX Competitor Campaign',
      subject: 'Say goodbye to OLX limitations! ✨ Better features await here',
      campaignType: CampaignType.COMPETITOR_ANALYSIS,
      targetSegment: UserSegment.OLX_USERS,
      triggerType: TriggerType.SCHEDULED,
      htmlContent: this.getOLXCompetitorEmailHTML(),
      textContent: this.getOLXCompetitorEmailText()
    });

    this.templates.set('emag_alternative', {
      id: 'emag_alternative',
      name: 'eMAG Alternative Campaign', 
      subject: 'Escape high eMAG prices! 🛒 Discover better deals here',
      campaignType: CampaignType.COMPETITOR_ANALYSIS,
      targetSegment: UserSegment.EMAG_USERS,
      triggerType: TriggerType.SCHEDULED,
      htmlContent: this.getEMAGAlternativeEmailHTML(),
      textContent: this.getEMAGAlternativeEmailText()
    });

    // Product Category Campaigns
    this.templates.set('electronics_campaign', {
      id: 'electronics_campaign',
      name: 'Electronics Category Campaign',
      subject: 'Latest Electronics Deals! 📱 Save up to 40% on tech you love',
      campaignType: CampaignType.PRODUCT_CATEGORY,
      targetSegment: UserSegment.ELECTRONICS_INTERESTED,
      triggerType: TriggerType.SCHEDULED,
      htmlContent: this.getElectronicsCampaignEmailHTML(),
      textContent: this.getElectronicsCampaignEmailText()
    });

    this.templates.set('fashion_campaign', {
      id: 'fashion_campaign',
      name: 'Fashion Category Campaign',
      subject: 'Trendy Fashion at unbeatable prices! 👗 New arrivals 50% off',
      campaignType: CampaignType.PRODUCT_CATEGORY,
      targetSegment: UserSegment.FASHION_INTERESTED,
      triggerType: TriggerType.SCHEDULED,
      htmlContent: this.getFashionCampaignEmailHTML(),
      textContent: this.getFashionCampaignEmailText()
    });

    this.templates.set('home_garden_campaign', {
      id: 'home_garden_campaign',
      name: 'Home & Garden Campaign',
      subject: 'Transform your home! 🏡 DIY essentials and garden tools 30% off',
      campaignType: CampaignType.PRODUCT_CATEGORY,
      targetSegment: UserSegment.HOME_GARDEN_INTERESTED,
      triggerType: TriggerType.SCHEDULED,
      htmlContent: this.getHomeGardenCampaignEmailHTML(),
      textContent: this.getHomeGardenCampaignEmailText()
    });

    // Loyalty/Retention Campaign
    this.templates.set('loyalty_tier', {
      id: 'loyalty_tier',
      name: 'Loyalty Program Promotion',
      subject: 'Upgrade to Premium & unlock exclusive benefits! ⭐ VIP treatment awaits',
      campaignType: CampaignType.LOYALTY_RETENTION,
      targetSegment: UserSegment.LOYAL_CUSTOMERS,
      triggerType: TriggerType.SCHEDULED,
      htmlContent: this.getLoyaltyTierEmailHTML(),
      textContent: this.getLoyaltyTierEmailText()
    });

    // Re-engagement Campaign
    this.templates.set('reengagement', {
      id: 'reengagement',
      name: 'Re-engagement Campaign',
      subject: 'We miss you! 😢 Exclusive offer to bring you back - 50% discount',
      campaignType: CampaignType.RE_ENGAGEMENT,
      targetSegment: UserSegment.INACTIVE_USERS,
      triggerType: TriggerType.INACTIVITY,
      htmlContent: this.getReengagementEmailHTML(),
      textContent: this.getReengagementEmailText()
    });
  }

  // Email Template HTML Generators
  private getWelcomeEmail1HTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bun venit pe platforma noastră!</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .benefits { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .benefit { display: flex; align-items: center; margin: 10px 0; }
            .benefit-icon { width: 24px; height: 24px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-right: 15px; }
            .cta-button { background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { background: #343a40; color: white; padding: 20px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Bun venit pe platforma noastră!</h1>
                <p>Ai făcut alegerea perfectă pentru cumpărături online în România</p>
            </div>
            <div class="content">
                <h2>Salutare!</h2>
                <p>Suntem entuziasmați să te avem cu noi! Pe lângă faptul că ai acces la cea mai avansată platformă de marketplace din România, ai și avantaje pe care nu le vei găsi nicăieri altundeva.</p>
                
                <div class="benefits">
                    <h3>De ce să ne alegi pe noi și nu OLX sau eMAG?</h3>
                    <div class="benefit">
                        <div class="benefit-icon">✓</div>
                        <div><strong>Sistem de plăți escrow integrat</strong> - Siguranță maximă pentru fiecare tranzacție</div>
                    </div>
                    <div class="benefit">
                        <div class="benefit-icon">✓</div>
                        <div><strong>Recomandări AI personalizate</strong> - Găsești exact ce cauți, mai rapid ca niciodată</div>
                    </div>
                    <div class="benefit">
                        <div class="benefit-icon">✓</div>
                        <div><strong>Marketplace cross-border</strong> - Cumpără și vinde în toată Europa</div>
                    </div>
                    <div class="benefit">
                        <div class="benefit-icon">✓</div>
                        <div><strong>Mobile-first experience</strong> - Optimizat pentru telefonul tău (78% dintre utilizatori sunt pe mobil)</div>
                    </div>
                    <div class="benefit">
                        <div class="benefit-icon">✓</div>
                        <div><strong>Analitice avansate pentru vânzători</strong> - Crește-ți afacerea cu insights de top</div>
                    </div>
                </div>

                <p>Acum că ești parte din comunitatea noastră, îți vom trimite email-uri cu:</p>
                <ul>
                    <li>Oferte exclusive adaptate intereselor tale</li>
                    <li>Recomandări personalizate bazate pe comportamentul tău</li>
                    <li>Știri despre cele mai bune produse din categoriile preferate</li>
                    <li>Promoții speciale pentru sărbători românești</li>
                </ul>

                <a href="https://platforma-ta.ro/dashboard" class="cta-button">Explorează platforma acum</a>
            </div>
            <div class="footer">
                <p>Platforma ta de marketplace preferată | România</p>
                <p>Dacă nu mai vrei să primești aceste email-uri, <a href="#" style="color: #ccc;">dezabonează-te aici</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getWelcomeEmail1Text(): string {
    return `
Bun venit pe platforma noastră!

Salutare!

Suntem entuziasmați să te avem cu noi! Pe lângă faptul că ai acces la cea mai avansată platformă de marketplace din România, ai și avantaje pe care nu le vei găsi nicăieri altundeva.

De ce să ne alegi pe noi și nu OLX sau eMAG?

✓ Sistem de plăți escrow integrat - Siguranță maximă pentru fiecare tranzacție
✓ Recomandări AI personalizate - Găsești exact ce cauți, mai rapid ca niciodată  
✓ Marketplace cross-border - Cumpără și vinde în toată Europa
✓ Mobile-first experience - Optimizat pentru telefonul tău (78% dintre utilizatori sunt pe mobil)
✓ Analitice avansate pentru vânzători - Crește-ți afacerea cu insights de top

Acum că ești parte din comunitatea noastră, îți vom trimite email-uri cu:
- Oferte exclusive adaptate intereselor tale
- Recomandări personalizate bazate pe comportamentul tău
- Știri despre cele mai bune produse din categoriile preferate
- Promoții speciale pentru sărbători românești

Explorează platforma acum: https://platforma-ta.ro/dashboard

Platforma ta de marketplace preferată | România
Dacă nu mai vrei să primești aceste email-uri, dezabonează-te aici
    `;
  }

  private getWelcomeEmail2HTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>De ce să alegi platforma noastră în loc de OLX?</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .comparison-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .comparison-table th, .comparison-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .comparison-table th { background-color: #f8f9fa; }
            .feature-us { color: #28a745; font-weight: bold; }
            .feature-them { color: #dc3545; }
            .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🆚 OLX vs Platforma Noastră</h1>
                <p>Vezi diferența pe care o vei simți imediat</p>
            </div>
            <div class="content">
                <h2>De ce să migrezi de la OLX la noi?</h2>
                <p>OLX a fost bun în vremea lui, dar acum există ceva mult mai bun. Să vedem comparația directă:</p>

                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Funcționalitate</th>
                            <th>OLX</th>
                            <th>Noi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Plăți sigure</strong></td>
                            <td class="feature-them">❌ Nu au</td>
                            <td class="feature-us">✅ Sistem escrow integrat</td>
                        </tr>
                        <tr>
                            <td><strong>Plată la livrare</strong></td>
                            <td class="feature-them">⚠️ Limitat</td>
                            <td class="feature-us">✅ 25% dintre români preferă asta</td>
                        </tr>
                        <tr>
                            <td><strong>Recomandări AI</strong></td>
                            <td class="feature-them">❌ Basic search</td>
                            <td class="feature-us">✅ AI personalizat</td>
                        </tr>
                        <tr>
                            <td><strong>Mobile experience</strong></td>
                            <td class="feature-them">⚠️ Mediu</td>
                            <td class="feature-us">✅ Mobile-first (78% pe mobil)</td>
                        </tr>
                        <tr>
                            <td><strong>Cross-border</strong></td>
                            <td class="feature-them">❌ Nu există</td>
                            <td class="feature-us">✅ Europa întreagă</td>
                        </tr>
                        <tr>
                            <td><strong>Comisioane</strong></td>
                            <td class="feature-them">19-49 RON/lună</td>
                            <td class="feature-us">✅ Transparent, fără costuri ascunse</td>
                        </tr>
                    </tbody>
                </table>

                <div class="highlight">
                    <h3>🎯 Insight din piața românească:</h3>
                    <p>78% dintre utilizatorii români accesează marketplace-urile de pe telefon. Noi am optimizat întreaga experiență pentru mobile, în timp ce OLX încă se chinuie cu versiunea lor de telefon.</p>
                </div>

                <h3>Cazul tău specific:</h3>
                <ul>
                    <li>🏠 <strong>Cauti apartamente?</strong> - Avem AI care învață preferințele tale</li>
                    <li>💻 <strong>Cumperi electronice?</strong> - Recomandări bazate pe bugetul și nevoile tale</li>
                    <li>👕 <strong>Haine la modă?</strong> - Urmărim tendințele TikTok din România</li>
                    <li>🏡 <strong>Renovări?</strong> - Parteneriate cu cei mai buni furnizori din țară</li>
                </ul>

                <a href="https://platforma-ta.ro/compare" class="cta-button">Vezi comparația completă</a>
            </div>
            <div class="footer">
                <p>Platforma ta de marketplace preferată | România</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getWelcomeEmail2Text(): string {
    return `
🆚 OLX vs Platforma Noastră

De ce să migrezi de la OLX la noi?

OLX a fost bun în vremea lui, dar acum există ceva mult mai bun. Să vedem comparația directă:

Funcționalitate          | OLX              | Noi
Plăți sigure            | ❌ Nu au         | ✅ Sistem escrow integrat
Plată la livrare        | ⚠️ Limitat       | ✅ 25% dintre români preferă asta
Recomandări AI          | ❌ Basic search  | ✅ AI personalizat
Mobile experience       | ⚠️ Mediu         | ✅ Mobile-first (78% pe mobil)
Cross-border            | ❌ Nu există     | ✅ Europa întreagă
Comisioane              | 19-49 RON/lună   | ✅ Transparent, fără costuri ascunse

🎯 Insight din piața românească:
78% dintre utilizatorii români accesează marketplace-urile de pe telefon. Noi am optimizat întreaga experiență pentru mobile, în timp ce OLX încă se chinuie cu versiunea lor de telefon.

Cazul tău specific:
🏠 Cauti apartamente? - Avem AI care învață preferințele tale
💻 Cumperi electronice? - Recomandări bazate pe bugetul și nevoile tale
👕 Haine la modă? - Urmărim tendințele TikTok din România
🏡 Renovări? - Parteneriate cu cei mai buni furnizori din țară

Vezi comparația completă: https://platforma-ta.ro/compare

Platforma ta de marketplace preferată | România
    `;
  }

  private getWelcomeEmail3HTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Oferta specială pentru prima ta comandă!</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .offer-box { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; border: 3px solid #ffc107; }
            .discount { font-size: 48px; font-weight: bold; color: #dc3545; }
            .urgency { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 15px 0; }
            .cta-button { background: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-size: 18px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Oferta ta de bun venit!</h1>
                <p>Reducere specială de 20% pentru prima comandă</p>
            </div>
            <div class="content">
                <h2>Felicitări! Ești pe cale să faci prima ta comandă</h2>
                <p>Ca nou membru al comunității noastre, îți oferim o reducere exclusivă:</p>

                <div class="offer-box">
                    <div class="discount">20%</div>
                    <h3>Reducere la prima comandă</h3>
                    <p>Folosește codul: <strong>BUNVENIT20</strong></p>
                    <p><em>Valabil 7 zile de la primirea acestui email</em></p>
                </div>

                <div class="urgency">
                    <strong>⏰ Oferta expiră în 5 zile!</strong><br>
                    Primește produsele în 2-3 zile în toată România
                </div>

                <h3>Ce să cumperi cu reducerea:</h3>
                <ul>
                    <li>📱 <strong>Electronice</strong> - Telefoane, laptopuri, accesorii (cel mai popular - 32% din vânzări)</li>
                    <li>👗 <strong>Modă</strong> - Haine, încălțăminte, accesorii (24% din vânzări)</li>
                    <li>🏡 <strong>Casă & Grădină</strong> - Mobilier, unelte, decorațiuni (18% din vânzări)</li>
                </ul>

                <h3>De ce să cumperi acum?</h3>
                <ul>
                    <li>✓ Prețurile sunt competitive cu eMAG, dar cu beneficii în plus</li>
                    <li>✓ Transport gratuit pentru comenzi peste 99 RON</li>
                    <li>✓ Plată în rate fără dobândă</li>
                    <li>✓ Retur gratuit în 14 zile</li>
                </ul>

                <a href="https://platforma-ta.ro/first-purchase?code=BUNVENIT20" class="cta-button">
                    Cumpără acum cu 20% reducere
                </a>

                <p><small>Nu ai găsit ce cauți? Contactează-ne la support@platforma-ta.ro sau sună la 0800.123.456 (gratuit)</small></p>
            </div>
            <div class="footer">
                <p>Platforma ta de marketplace preferată | România</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getWelcomeEmail3Text(): string {
    return `
🎉 Oferta ta de bun venit!

Felicitări! Ești pe cale să faci prima ta comandă

Ca nou membru al comunității noastre, îți oferim o reducere exclusivă:

20% REDUCERE LA PRIMA COMANDĂ
Folosește codul: BUNVENIT20
Valabil 7 zile de la primirea acestui email

⏰ Oferta expiră în 5 zile!
Primește produsele în 2-3 zile în toată România

Ce să cumperi cu reducerea:
📱 Electronice - Telefoane, laptopuri, accesorii (cel mai popular - 32% din vânzări)
👗 Modă - Haine, încălțăminte, accesorii (24% din vânzări)
🏡 Casă & Grădină - Mobilier, unelte, decorațiuni (18% din vânzări)

De ce să cumperi acum?
✓ Prețurile sunt competitive cu eMAG, dar cu beneficii în plus
✓ Transport gratuit pentru comenzi peste 99 RON
✓ Plată în rate fără dobândă
✓ Retur gratuit în 14 zile

Cumpără acum cu 20% reducere: https://platforma-ta.ro/first-purchase?code=BUNVENIT20

Nu ai găsit ce cauți? Contactează-ne la support@platforma-ta.ro sau sună la 0800.123.456 (gratuit)

Platforma ta de marketplace preferată | România
    `;
  }

  // Additional email template methods - simplified versions for demo
  private getOLXCompetitorEmailHTML(): string { 
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>OLX vs Our Platform</title></head>
    <body>
        <h1>🆚 Say goodbye to OLX limitations!</h1>
        <p>OLX nu mai este suficient pentru nevoile moderne. Descoperă de ce utilizatorii migrează către platforma noastră:</p>
        <ul>
            <li>✅ Sistem escrow integrat - siguranță maximă</li>
            <li>✅ AI personalizat - găsești ce cauți mai rapid</li>
            <li>✅ Mobile-first - optimizat pentru telefon</li>
            <li>✅ Cross-border - Europa întreagă</li>
        </ul>
        <a href="https://platforma-ta.ro/migrate-from-olx">Migrează acum</a>
    </body>
    </html>
    `;
  }
  
  private getOLXCompetitorEmailText(): string { 
    return `Say goodbye to OLX limitations!

OLX nu mai este suficient pentru nevoile moderne. Descoperă de ce utilizatorii migrează către platforma noastră:

✅ Sistem escrow integrat - siguranță maximă
✅ AI personalizat - găsești ce cauți mai rapid
✅ Mobile-first - optimizat pentru telefon
✅ Cross-border - Europa întreagă

Migrează acum: https://platforma-ta.ro/migrate-from-olx
`; 
  }

  private getEMAGAlternativeEmailHTML(): string { 
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Escape eMAG high prices</title></head>
    <body>
        <h1>🛒 Escape high eMAG prices!</h1>
        <p>eMAG are prețuri mari și puține beneficii. Noi oferim:</p>
        <ul>
            <li>💰 Prețuri mai mici cu 15-30%</li>
            <li>🚀 Transport gratuit la 99 RON</li>
            <li>💳 Plată în rate fără dobândă</li>
            <li>🔄 Retur gratuit în 14 zile</li>
        </ul>
        <a href="https://platforma-ta.ro/emag-alternative">Descoperă diferența</a>
    </body>
    </html>
    `;
  }
  
  private getEMAGAlternativeEmailText(): string { 
    return `Escape high eMAG prices!

eMAG are prețuri mari și puține beneficii. Noi oferim:

💰 Prețuri mai mici cu 15-30%
🚀 Transport gratuit la 99 RON
💳 Plată în rate fără dobândă
🔄 Retur gratuit în 14 zile

Descoperă diferența: https://platforma-ta.ro/emag-alternative
`; 
  }

  private getElectronicsCampaignEmailHTML(): string { 
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Electronics Deals</title></head>
    <body>
        <h1>📱 Latest Electronics Deals!</h1>
        <p>Oferte exclusive pe electronice (32% din vânzările românești):</p>
        <ul>
            <li>iPhone 15 - Reducere 15%</li>
            <li>Laptop gaming - Reducere 20%</li>
            <li>AirPods Pro - Reducere 25%</li>
        </ul>
        <a href="https://platforma-ta.ro/electronics">Vezi toate ofertele</a>
    </body>
    </html>
    `;
  }
  
  private getElectronicsCampaignEmailText(): string { 
    return `Latest Electronics Deals!

Oferte exclusive pe electronice (32% din vânzările românești):

iPhone 15 - Reducere 15%
Laptop gaming - Reducere 20%
AirPods Pro - Reducere 25%

Vezi toate ofertele: https://platforma-ta.ro/electronics
`; 
  }

  private getFashionCampaignEmailHTML(): string { 
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Fashion Deals</title></head>
    <body>
        <h1>👗 Trendy Fashion at unbeatable prices!</h1>
        <p>Noutăți în modă (24% din vânzările românești):</p>
        <ul>
            <li>Rochii de vară - Reducere 50%</li>
            <li>Încălțăminte sport - Reducere 40%</li>
            <li>Accesorii de sezon - Reducere 30%</li>
        </ul>
        <a href="https://platforma-ta.ro/fashion">Explorează colecția</a>
    </body>
    </html>
    `;
  }
  
  private getFashionCampaignEmailText(): string { 
    return `Trendy Fashion at unbeatable prices!

Noutăți în modă (24% din vânzările românești):

Rochii de vară - Reducere 50%
Încălțăminte sport - Reducere 40%
Accesorii de sezon - Reducere 30%

Explorează colecția: https://platforma-ta.ro/fashion
`; 
  }

  private getHomeGardenCampaignEmailHTML(): string { 
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Home & Garden</title></head>
    <body>
        <h1>🏡 Transform your home!</h1>
        <p>Esențiale DIY și grădină (18% din vânzările românești):</p>
        <ul>
            <li>Unelte de grădină - Reducere 30%</li>
            <li>Mobilier de grădină - Reducere 25%</li>
            <li>Materiale de construcție - Reducere 20%</li>
        </ul>
        <a href="https://platforma-ta.ro/home-garden">Renovează acum</a>
    </body>
    </html>
    `;
  }
  
  private getHomeGardenCampaignEmailText(): string { 
    return `Transform your home!

Esențiale DIY și grădină (18% din vânzările românești):

Unelte de grădină - Reducere 30%
Mobilier de grădină - Reducere 25%
Materiale de construcție - Reducere 20%

Renovează acum: https://platforma-ta.ro/home-garden
`; 
  }

  private getLoyaltyTierEmailHTML(): string { 
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Loyalty Program</title></head>
    <body>
        <h1>⭐ Upgrade to Premium & unlock exclusive benefits!</h1>
        <p>Programul nostru de loialitate bazat pe modelul eMAG+:</p>
        <ul>
            <li>🚚 Transport gratuit pe toate comenzile</li>
            <li>🎯 Suport prioritar 24/7</li>
            <li>🎁 Reduceri exclusive de ziua ta</li>
            <li>💎 Puncte pentru fiecare comandă (1 RON = 1 punct)</li>
        </ul>
        <p><strong>Only 4.99 RON/lună</strong> - mult mai ieftin decât concurența</p>
        <a href="https://platforma-ta.ro/premium">Devino Premium</a>
    </body>
    </html>
    `;
  }
  
  private getLoyaltyTierEmailText(): string { 
    return `Upgrade to Premium & unlock exclusive benefits!

Programul nostru de loialitate bazat pe modelul eMAG+:

🚚 Transport gratuit pe toate comenzile
🎯 Suport prioritar 24/7
🎁 Reduceri exclusive de ziua ta
💎 Puncte pentru fiecare comandă (1 RON = 1 punct)

Only 4.99 RON/lună - mult mai ieftin decât concurența

Devino Premium: https://platforma-ta.ro/premium
`; 
  }

  private getReengagementEmailHTML(): string { 
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>We miss you</title></head>
    <body>
        <h1>😢 We miss you!</h1>
        <p>Te așteptăm înapoi cu o ofertă specială:</p>
        <div style="background: #ff6b6b; color: white; padding: 20px; text-align: center; margin: 20px 0;">
            <h2>50% REDUCERE</h2>
            <p>pentru prima comandă după întoarcere</p>
            <p><strong>Cod: ÎNAPOI50</strong></p>
        </div>
        <p>Am îmbunătățit platforma cu:</p>
        <ul>
            <li>🎨 Design nou și mai rapid</li>
            <li>🔍 AI mai precis pentru căutări</li>
            <li>💳 Plăți și mai sigure</li>
        </ul>
        <a href="https://platforma-ta.ro/welcome-back?code=ÎNAPOI50">Revino acum</a>
    </body>
    </html>
    `;
  }
  
  private getReengagementEmailText(): string { 
    return `We miss you!

Te așteptăm înapoi cu o ofertă specială:

50% REDUCERE
pentru prima comandă după întoarcere
Cod: ÎNAPOI50

Am îmbunătățit platforma cu:
🎨 Design nou și mai rapid
🔍 AI mai precis pentru căutări
💳 Plăți și mai sigure

Revino acum: https://platforma-ta.ro/welcome-back?code=ÎNAPOI50
`; 
  }

  // Public methods for campaign management
  public createCampaign(campaign: EmailCampaign): void {
    this.campaigns.set(campaign.id, campaign);
  }

  public getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  public getCampaigns(): EmailCampaign[] {
    return Array.from(this.campaigns.values());
  }

  public sendEmail(userId: string, templateId: string, personalizations?: Record<string, any>): Promise<boolean> {
    // Implementation for sending emails via Resend/SendGrid/etc.
    console.log(`Sending email to user ${userId} with template ${templateId}`);
    return Promise.resolve(true);
  }

  public segmentUsers(): Map<UserSegment, UserProfile[]> {
    const segments = new Map<UserSegment, UserProfile[]>();
    
    // Initialize all segments
    Object.values(UserSegment).forEach(segment => {
      segments.set(segment, []);
    });

    // Distribute users to segments
    this.userProfiles.forEach(user => {
      segments.get(user.segment)?.push(user);
    });

    return segments;
  }

  public trackEmailOpen(campaignId: string, emailId: string): void {
    // Track email open for analytics
    const analytics = this.analytics.find(a => a.campaignId === campaignId);
    if (analytics) {
      analytics.opened++;
    }
    
    // Track in comprehensive analytics system
    analyticsSystem.trackEvent({
      eventType: 'open',
      channel: 'email',
      campaignId: campaignId,
      metadata: { emailId }
    });
  }

  public trackEmailClick(campaignId: string, emailId: string): void {
    // Track email click for analytics
    const analytics = this.analytics.find(a => a.campaignId === campaignId);
    if (analytics) {
      analytics.clicked++;
    }

    // Track in comprehensive analytics system
    analyticsSystem.trackEvent({
      eventType: 'click',
      channel: 'email',
      campaignId: campaignId,
      metadata: { emailId }
    });
  }

  async broadcastEvent(event: any) {
      console.log(`Broadcasting event via email: ${event.title}`);
      // Logic to send bulk emails
      return { sent: 0 };
  }

  async sendWelcomeToCommunity() {
      console.log('Sending welcome emails to new community members...');
      // Logic to identify new members and send emails
      return { sent: 0 };
  }

  async sendTemplate(to: string, templateId: string, data: any) {
      console.log(`Sending template ${templateId} to ${to} with data:`, data);
      return true;
  }
}
export const emailSystem = new EmailMarketingSystem();
