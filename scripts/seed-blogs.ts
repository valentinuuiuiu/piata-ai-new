import { createClient } from '@supabase/supabase-js';
import { AIOrchestrator } from '../src/lib/ai-orchestrator';
import { AgentCapability } from '../src/lib/agents/types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CATEGORIES = [
  {
    name: 'Imobiliare',
    topic: 'Tendințe pe piața imobiliară din România în 2024',
    prompt: 'Write a comprehensive blog post about Real Estate trends in Romania for late 2024. Focus on prices in Cluj, Bucharest, and Timisoara. Discuss mortgage rates and advice for first-time buyers. Write in Romanian. Format with HTML tags (h2, p, ul, li).'
  },
  {
    name: 'Auto',
    topic: 'Top mașini second-hand de cumpărat în 2024',
    prompt: 'Write a detailed blog post about the best used cars to buy in Romania in 2024. Compare German vs Asian brands. Discuss reliability, maintenance costs, and fuel economy. Write in Romanian. Format with HTML tags (h2, p, ul, li).'
  },
  {
    name: 'Electronice',
    topic: 'Ghid de achiziție: Laptopuri și Telefoane Second Hand',
    prompt: 'Write a helpful guide for buying used electronics (phones and laptops). What to check before buying? How to spot scams? Battery health importance. Warranty checks. Write in Romanian. Format with HTML tags (h2, p, ul, li).'
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

  for (const cat of CATEGORIES) {
    console.log(`\n📝 Generating article for: ${cat.name}...`);
    
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
          model: 'google/gemini-2.0-flash-exp:free', // Using a reliable free model
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
