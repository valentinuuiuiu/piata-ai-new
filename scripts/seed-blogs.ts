import { createClient } from '@supabase/supabase-js';
import { AIOrchestrator } from '../src/lib/ai-orchestrator';
import { AgentCapability } from '../src/lib/agents/types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CATEGORIES = [
  {
    name: 'AI & Technology',
    topic: 'Viitorul Inteligenței Artificiale în Comerțul Online',
    prompt: 'Write a high-quality, professional blog post in Romanian about the future of AI in e-commerce. Discuss personalization, automated customer support, and predictive analytics. Use a sophisticated tone. Format with HTML tags (h2, p, ul, li). Avoid generic fluff.'
  },
  {
    name: 'Machine Learning',
    topic: 'Cum Machine Learning Transformă Piața Imobiliară',
    prompt: 'Write a detailed, technical but accessible blog post in Romanian about how Machine Learning is revolutionizing the Real Estate market. Cover price prediction algorithms, image recognition for listings, and fraud detection. High quality content only. Format with HTML tags.'
  },
  {
    name: 'News',
    topic: 'Lansarea Piata AI: O Nouă Era pentru Anunțuri',
    prompt: 'Write an exciting news article in Romanian about the launch of Piata AI. Highlight its unique features: AI-powered validation, smart search, and user safety. Professional journalistic tone. Format with HTML tags.'
  }
];

async function seedBlogs() {
  console.log('🚀 Starting blog generation...');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Use OpenRouter with provided key
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    console.error('❌ Missing OPENROUTER_API_KEY');
    process.exit(1);
  }

  // Process all categories
  for (const cat of CATEGORIES) {
    console.log(`\n📝 Generating article for: ${cat.name}...`);
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://piata-ai.ro',
          'X-Title': 'Piata AI'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4.1-fast:free', // Using the requested model
          messages: [
            { role: 'system', content: 'You are an expert content writer for a Romanian marketplace. Write in Romanian.' },
            { role: 'user', content: cat.prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${await response.text()}`);
      }

      const aiData = await response.json();
      const content = aiData.choices[0].message.content;

      if (content) {
        // Insert into DB
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            title: cat.topic,
            content: content,
            published: true,
            published_at: new Date().toISOString(),
            author: 'AI Marketplace Expert',
            tags: [cat.name, 'Ghid', 'Sfaturi', '2024'],
            excerpt: `Descoperă cele mai noi informații despre ${cat.name.toLowerCase()}. Ghid complet și sfaturi utile pentru cumpărători și vânzători.`
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Failed to save ${cat.name}:`, error.message);
        } else {
          console.log(`✅ Published: "${cat.topic}" (ID: ${data.id})`);
        }
      } else {
        console.error(`❌ Failed to generate content for ${cat.name}`);
      }

    } catch (e: any) {
      console.error(`❌ Error processing ${cat.name}:`, e.message);
    }
  }

  console.log('\n✨ All done!');
}

seedBlogs();
