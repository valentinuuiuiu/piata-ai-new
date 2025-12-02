/**
 * Content Marketing Automation System
 * Generates blog posts, social media content, and marketing materials
 * Uses AI to create engaging, SEO-optimized content for Romanian market
 */

const { GoogleGenerativeAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

class ContentMarketingAutomation {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        this.contentTypes = {
            blog_posts: [],
            social_media: [],
            email_campaigns: [],
            seo_content: []
        };

        this.marketInsights = {
            high_demand_categories: [
                'Electronics', 'Vehicles', 'Real Estate', 'Jobs', 'Services',
                'Fashion', 'Home & Garden', 'Sports', 'Business', 'Education'
            ],
            target_keywords: [
                'anunturi gratuite romania', 'vanzari online', 'cumparaturi online',
                'piata romania', 'oferte speciale', 'service auto', 'imobiliare romania'
            ],
            content_themes: [
                'buying_tips', 'selling_guide', 'market_trends', 'safety_tips',
                'price_guides', 'local_news', 'success_stories', 'tutorials'
            ]
        };
    }

    async generateBlogPost(topic, category) {
        try {
            console.log(`📝 Generating blog post: ${topic}`);
            
            const prompt = `
Create a comprehensive, SEO-optimized blog post in Romanian about "${topic}" for a marketplace platform. 

Requirements:
- 800-1200 words
- Include actionable tips and insights
- Target Romanian audience
- Include relevant keywords naturally
- Add subheadings and bullet points
- Include call-to-action at the end
- Make it engaging and informative

Focus on category: ${category}

Write in Romanian language and make it valuable for both buyers and sellers.
            `;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return {
                title: topic,
                content: text,
                category: category,
                keywords: this.extractKeywords(text),
                word_count: text.split(' ').length,
                created_at: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Error generating blog post: ${error.message}`);
            return null;
        }
    }

    async generateSocialMediaContent() {
        try {
            console.log('📱 Generating social media content...');
            
            const platforms = ['facebook', 'instagram', 'linkedin'];
            const socialContent = [];

            for (const platform of platforms) {
                const prompt = `
Create engaging social media posts for ${platform} in Romanian for a marketplace platform. 
Create 5 different posts targeting these themes:
1. How to sell successfully online
2. Tips for buying safely
3. Marketplace features highlight
4. User success story
5. Market trend insights

Each post should:
- Be platform-appropriate in length
- Include relevant hashtags
- Have a clear call-to-action
- Be engaging and shareable

Format: Return as JSON array with platform, content, hashtags, and post_type fields.
                `;

                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                try {
                    const parsedContent = JSON.parse(text);
                    socialContent.push(...parsedContent);
                } catch (parseError) {
                    console.log(`⚠️ Could not parse ${platform} content, creating manual version`);
                    // Fallback content
                    socialContent.push({
                        platform: platform,
                        content: `🚀 Discover amazing deals on our marketplace! Buy and sell with confidence in Romania's most trusted platform. #PiataRomana #OnlineMarketplace`,
                        hashtags: ['#PiataRomana', '#OnlineMarketplace', '#VanzariOnline', '#Romania'],
                        post_type: 'promotional'
                    });
                }
            }

            return socialContent;

        } catch (error) {
            console.error(`❌ Error generating social media content: ${error.message}`);
            return [];
        }
    }

    async generateEmailCampaigns() {
        try {
            console.log('📧 Generating email campaigns...');
            
            const campaigns = [
                {
                    name: 'Welcome Series',
                    type: 'onboarding',
                    subject: 'Bun venit pe PiataRomană - Începe să vinzi astăzi!',
                    template: 'welcome_series.html'
                },
                {
                    name: 'Featured Categories',
                    type: 'promotional',
                    subject: '🔥 Cele mai populare categorii pe marketplace-ul nostru',
                    template: 'featured_categories.html'
                },
                {
                    name: 'Weekly Newsletter',
                    type: 'retention',
                    subject: '📊 Noutăți săptămânale de pe PiataRomană',
                    template: 'weekly_newsletter.html'
                },
                {
                    name: 'Buyer Incentive',
                    type: 'conversion',
                    subject: '💰 Bonus pentru primul tău cumpărător!',
                    template: 'buyer_incentive.html'
                },
                {
                    name: 'Seller Success Tips',
                    type: 'education',
                    subject: '📈 Cum să vinzi mai rapid pe marketplace',
                    template: 'seller_tips.html'
                }
            ];

            const emailCampaigns = [];

            for (const campaign of campaigns) {
                const prompt = `
Create an email campaign for Romanian marketplace users.

Campaign: ${campaign.name}
Type: ${campaign.type}
Subject: ${campaign.subject}

Create:
1. HTML email template with Romanian content
2. Plain text version
3. Personalization fields
4. Clear call-to-action buttons
5. Professional design elements

Make it engaging, mobile-friendly, and conversion-focused.
Use Romanian language throughout.
                `;

                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const content = response.text();

                emailCampaigns.push({
                    ...campaign,
                    content: content,
                    generated_at: new Date().toISOString()
                });
            }

            return emailCampaigns;

        } catch (error) {
            console.error(`❌ Error generating email campaigns: ${error.message}`);
            return [];
        }
    }

    async generateSEOContent() {
        try {
            console.log('🔍 Generating SEO-optimized content...');
            
            const seoPages = [
                {
                    page: 'homepage',
                    title: 'PiataRomană - Marketplace #1 din România | Anunțuri Gratuite',
                    meta_description: 'Cumpără și vinde în siguranță pe cel mai mare marketplace din România. Anunțuri gratuite în toate categoriile: electronice, imobiliare, mașini și multe altele.',
                    keywords: ['marketplace romania', 'anunturi gratuite', 'vanzari online', 'cumparaturi online']
                },
                {
                    page: 'about',
                    title: 'Despre PiataRomană - Echipa și Misiunea Noastră',
                    meta_description: 'Aflați povestea din spatele celui mai de încredere marketplace din România. Echipa noastră se dedică să faciliteze comerțul online sigur și eficient.',
                    keywords: ['despre noi', 'marketplace romania', 'echipa', 'misiune']
                },
                {
                    page: 'categories',
                    title: 'Categorii Populare - PiataRomană | Toate Categoriile Disponibile',
                    meta_description: 'Explorează toate categoriile disponibile pe PiataRomană: electronice, imobiliare, vehicule, servicii, locuri de muncă și multe altele.',
                    keywords: ['categorii marketplace', 'anunturi pe categorii', 'vanzari pe categorii']
                }
            ];

            const seoContent = [];

            for (const page of seoPages) {
                const prompt = `
Create SEO-optimized content for a Romanian marketplace page.

Page: ${page.page}
Title: ${page.title}
Meta Description: ${page.meta_description}
Keywords: ${page.keywords.join(', ')}

Create:
1. Rich meta descriptions
2. Structured data markup (JSON-LD)
3. Related keywords and phrases
4. Internal linking suggestions
5. Content optimization recommendations

Focus on Romanian market and local SEO.
                `;

                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const content = response.text();

                seoContent.push({
                    ...page,
                    seo_content: content,
                    created_at: new Date().toISOString()
                });
            }

            return seoContent;

        } catch (error) {
            console.error(`❌ Error generating SEO content: ${error.message}`);
            return [];
        }
    }

    extractKeywords(text) {
        // Simple keyword extraction - in production, use more sophisticated NLP
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const stopWords = new Set(['și', 'în', 'cu', 'de', 'la', 'pe', 'pentru', 'din', 'că', 'este', 'sunt', 'avea', 'fi']);
        const keywords = words.filter(word => word.length > 3 && !stopWords.has(word));
        
        // Count frequency and return top keywords
        const frequency = {};
        keywords.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
    }

    async saveContent() {
        try {
            const outputDir = path.join(__dirname, '../data/content');
            await fs.mkdir(outputDir, { recursive: true });

            // Save blog posts
            if (this.contentTypes.blog_posts.length > 0) {
                await fs.writeFile(
                    path.join(outputDir, 'blog_posts.json'),
                    JSON.stringify(this.contentTypes.blog_posts, null, 2)
                );
                console.log(`📝 Saved ${this.contentTypes.blog_posts.length} blog posts`);
            }

            // Save social media content
            if (this.contentTypes.social_media.length > 0) {
                await fs.writeFile(
                    path.join(outputDir, 'social_media.json'),
                    JSON.stringify(this.contentTypes.social_media, null, 2)
                );
                console.log(`📱 Saved ${this.contentTypes.social_media.length} social media posts`);
            }

            // Save email campaigns
            if (this.contentTypes.email_campaigns.length > 0) {
                await fs.writeFile(
                    path.join(outputDir, 'email_campaigns.json'),
                    JSON.stringify(this.contentTypes.email_campaigns, null, 2)
                );
                console.log(`📧 Saved ${this.contentTypes.email_campaigns.length} email campaigns`);
            }

            // Save SEO content
            if (this.contentTypes.seo_content.length > 0) {
                await fs.writeFile(
                    path.join(outputDir, 'seo_content.json'),
                    JSON.stringify(this.contentTypes.seo_content, null, 2)
                );
                console.log(`🔍 Saved ${this.contentTypes.seo_content.length} SEO pages`);
            }

        } catch (error) {
            console.error(`❌ Error saving content: ${error.message}`);
        }
    }

    async run() {
        try {
            console.log('🚀 Starting Content Marketing Automation...');

            // Generate different content types
            console.log('\n📝 Generating Blog Posts...');
            const blogTopics = [
                'Cum să vinzi mai rapid pe marketplace',
                'Ghidul complet pentru cumpărături online sigure',
                'Top 10 categorii cu cele mai multe vânzări în România',
                'Cum să eviți escrocheriile în marketplace-uri',
                'Tendințele pieței online românești în 2024'
            ];

            for (const topic of blogTopics) {
                const category = this.marketInsights.high_demand_categories[
                    Math.floor(Math.random() * this.marketInsights.high_demand_categories.length)
                ];
                const blogPost = await this.generateBlogPost(topic, category);
                if (blogPost) {
                    this.contentTypes.blog_posts.push(blogPost);
                }
                await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
            }

            console.log('\n📱 Generating Social Media Content...');
            this.contentTypes.social_media = await this.generateSocialMediaContent();

            console.log('\n📧 Generating Email Campaigns...');
            this.contentTypes.email_campaigns = await this.generateEmailCampaigns();

            console.log('\n🔍 Generating SEO Content...');
            this.contentTypes.seo_content = await this.generateSEOContent();

            // Save all content
            await this.saveContent();

            console.log('\n✅ Content Marketing Automation completed!');
            console.log(`📊 Generated:`);
            console.log(`   - ${this.contentTypes.blog_posts.length} Blog Posts`);
            console.log(`   - ${this.contentTypes.social_media.length} Social Media Posts`);
            console.log(`   - ${this.contentTypes.email_campaigns.length} Email Campaigns`);
            console.log(`   - ${this.contentTypes.seo_content.length} SEO Pages`);

            return this.contentTypes;

        } catch (error) {
            console.error('❌ Content Marketing Automation failed:', error);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const automation = new ContentMarketingAutomation();
    automation.run().then(() => {
        console.log('Content marketing automation completed');
        process.exit(0);
    });
}

module.exports = ContentMarketingAutomation;