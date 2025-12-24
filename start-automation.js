
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env explicitly
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_TASKS = [
  {
    id: "listing_optimization",
    name: "Optimizare Listing-uri",
    description: "Optimizează automat titlurile și descrierile listing-urilor vechi",
    schedule: "168",
    enabled: true,
    status: "idle"
  },
  {
    id: "blog_generation",
    name: "Generare Conținut Blog",
    description: "Creează articole de blog relevante pentru SEO",
    schedule: "24",
    enabled: true,
    status: "idle"
  },
  {
    id: "email_campaign",
    name: "Campanii Email",
    description: "Trimite email-uri personalizate utilizatorilor inactivi",
    schedule: "168",
    enabled: true,
    status: "idle"
  },
  {
    id: "market_analysis",
    name: "Analiză de Piață",
    description: "Analizează tendințele pieței și generează rapoarte",
    schedule: "24",
    enabled: true,
    status: "idle"
  },
  {
    id: "quality_check",
    name: "Control Calitate",
    description: "Verifică calitatea listing-urilor noi",
    schedule: "1",
    enabled: true,
    status: "idle"
  },
  {
    id: "social_media",
    name: "Conținut Social Media",
    description: "Generează conținut pentru rețelele sociale",
    schedule: "6",
    enabled: true,
    status: "idle"
  }
];

async function startAutomation() {
  console.log('--- Initializing Automation Tasks ---');
  
  for (const task of DEFAULT_TASKS) {
    const { data: existing } = await supabase
      .from('automation_tasks')
      .select('id')
      .eq('id', task.id)
      .single();
      
    if (!existing) {
      console.log(`Creating task: ${task.name}...`);
      const { error } = await supabase.from('automation_tasks').insert(task);
      if (error) console.error(`Error creating ${task.id}:`, error.message);
    } else {
      console.log(`Enabling task: ${task.name}...`);
      const { error } = await supabase
        .from('automation_tasks')
        .update({ enabled: true, status: 'idle' })
        .eq('id', task.id);
      if (error) console.error(`Error enabling ${task.id}:`, error.message);
    }
  }
  
  console.log('✅ Automation engine tasks initialized and enabled.');
}

startAutomation();
