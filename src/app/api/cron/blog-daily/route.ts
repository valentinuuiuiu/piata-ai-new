import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

// Blog categories for daily generation
const BLOG_CATEGORIES = [
  {
    name: 'news',
    title: 'Știri Tehnologie',
    description: 'Cele mai recente știri din lumea tehnologiei și AI'
  },
  {
    name: 'education',
    title: 'Educație AI',
    description: 'Ghiduri și tutoriale pentru învățarea inteligenței artificiale'
  },
  {
    name: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Articole avansate despre inteligența artificială și învățare automată'
  }
];

async function generateArticle(category: typeof BLOG_CATEGORIES[0]): Promise<{
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
}> {
  const systemPrompt = `Ești un jurnalist tech experimentat specializat în ${category.description.toLowerCase()}.

  SARCINA: Generează un articol complet în limba română despre un subiect relevant din categoria ${category.name}.

  CERINȚE:
  - Titlu atractiv și SEO-friendly (max 70 caractere)
  - Conținut detaliat (800-1200 cuvinte)
  - Excerpt scurt și atrăgător (max 160 caractere)
  - Folosește un ton profesional dar accesibil
  - Include statistici, exemple concrete și perspective de viitor
  - Structurează cu heading-uri H2 și H3
  - Adaugă tabele Markdown pentru date importante
  - Include întrebări frecvente la sfârșit

  FORMAT RĂSPUNS: JSON cu următoarele câmpuri:
  {
    "title": "Titlul articolului",
    "content": "Conținutul complet în Markdown",
    "excerpt": "Rezumat scurt",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  }

  ASIGURĂ-TE că articolul este original, bine documentat și aduce valoare reală cititorilor români interesați de tehnologie.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://piata.ro',
        'X-Title': 'Blog Generator - Daily Articles',
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4.1-fast:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generează un articol nou despre ${category.title} pentru data de azi: ${new Date().toLocaleDateString('ro-RO')}` }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // Parse JSON response
    const articleData = JSON.parse(generatedContent);

    return {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      tags: articleData.tags || []
    };

  } catch (error) {
    console.error(`Error generating article for ${category.name}:`, error);
    throw error;
  }
}

async function saveBlogPost(article: any, category: string): Promise<boolean> {
  try {
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if article with similar title exists today
    const today = new Date().toISOString().split('T')[0];
    const existing = await query(
      'SELECT id FROM blog_posts WHERE DATE(published_at) = ? AND title LIKE ?',
      [today, `%${article.title.substring(0, 20)}%`]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`Article "${article.title}" already exists for today`);
      return false;
    }

    await query(`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, category, tags,
        status, published_at, views, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, 'published', NOW(), 0, NULL)
    `, [
      article.title,
      slug,
      article.excerpt,
      article.content,
      category,
      JSON.stringify(article.tags)
    ]);

    console.log(`✅ Saved article: ${article.title}`);
    return true;

  } catch (error) {
    console.error('Error saving blog post:', error);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting Daily Blog Generation');

    const articlesGenerated = [];
    const errors = [];

    for (const category of BLOG_CATEGORIES) {
      try {
        console.log(`📝 Generating article for category: ${category.name}`);

        const article = await generateArticle(category);
        const saved = await saveBlogPost(article, category.name);

        if (saved) {
          articlesGenerated.push({
            category: category.name,
            title: article.title,
            tags: article.tags
          });
        }

      } catch (error) {
        console.error(`❌ Failed to generate article for ${category.name}:`, error);
        errors.push({
          category: category.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Generated ${articlesGenerated.length} articles`);

    return NextResponse.json({
      success: true,
      message: `Daily blog generation completed`,
      articlesGenerated: articlesGenerated.length,
      articles: articlesGenerated,
      errors: errors.length > 0 ? errors : undefined,
      time: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Daily blog generation failed:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      time: new Date().toISOString()
    }, { status: 500 });
  }
}