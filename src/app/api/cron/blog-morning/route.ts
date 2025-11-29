import { NextResponse } from 'next/server';

// TOON Blog Data - embedded directly to avoid import issues
const TOON_BLOG_DATA = {
  version: "1.0.0",
  type: "blog_posts",
  generated: new Date().toISOString(),
  data: [
    {
      id: "toon_001",
      title: "Inteligența Artificială în România: Stadiul Actual și Perspective",
      excerpt: "O analiză a dezvoltării AI în România și impactul economic asupra regiunii",
      content: `# Inteligența Artificială în România: Stadiul Actual și Perspective

## Introducere
România se poziționează tot mai ferm pe harta europeană a inteligenței artificiale. Cu un ecosistem tech în plină expansiune și specialiști recunoscuți internațional, țara noastră devine un hub regional pentru inovație AI.

## Ecosistemul AI Românesc

### Centre de Excelență
- **Laboratorul AI-UPT** - Cercetare de vârf în machine learning
- **Centrul de Excelență AI din București** - Parteneriate cu industrie
- **Grupuri de cercetare la Iasi** - Specializare în NLP și computer vision

### Startup-uri Notabile
- **UiPath** - Lider global în RPA
- **Humans.ai** - Platformă de AI sintetic
- **DroneDeploy** - Analiză prin drone și AI

## Impact Economic

### Statistici 2024
- Piața AI: €200 milioane anuală
- Creștere: 35% an de an
- Angajați în sector: 15,000+

### Sectoare Transformate
- **Finanțe**: Detectare fraudă, credit scoring
- **Sănătate**: Diagnostic medical, management pacienți
- **Retail**: Personalizare, optimizare stocuri
- **Manufactură**: Predictive maintenance, control calitate

## Provocări și Oportunități

### Infrastructură
- **Conectivitate**: Investiții în 5G și cloud computing
- **Centre de date**: Dezvoltarea de facilități moderne
- **Educație**: Programe de formare în AI și date

### Resurse Umane
- **Formare**: Universități și programe de reconversie profesională
- **Atrăgerea de talente**: Politici pentru reținerea specialiștilor
- **Colaborare internațională**: Parteneriate cu companii globale

## Studii de Caz

### Banca Comercială Română
Automatizarea a redus timpul de procesare a creditelor de 3 zile la 30 minute.

### OMV Petrom
Implementarea RPA a generat economii anuale de 2 milioane euro.

### Orange România
Automatizarea proceselor de provisioning a redus erorile cu 95%.

## Beneficii Măsurabile

### Eficiență Operațională
- Reducere timp procesare: 70-90%
- Scădere erori umane: 95%
- Disponibilitate 24/7

### Beneficii Financiare
- ROI tipic: 200-300% în primul an
- Reducere costuri operaționale: 40-60%
- Productivitate crescută: 300%

## Viitorul RPA

### Tendințe 2024-2025
- Integrarea cu AI și ML
- Automatizare cognitivă avansată
- RPA ca serviciu (RPAaaS)
- Hyperautomation

### Tehnologii Emergente
- Process mining
- Intelligent document processing
- Conversational AI integration

## Concluzii
RPA nu mai este o opțiune ci o necesitate pentru companiile românești care doresc să rămână competitive pe piața globală.`,
      category: "AI & Technology",
      tags: ["AI", "Romania", "Technology", "Innovation"],
      source_urls: ["https://example.com/ai-romania-2024"],
      published_at: new Date().toISOString()
    },
    {
      id: "toon_002",
      title: "Cum să Începi o Carieră în Inteligență Artificială: Ghid Complet pentru Români",
      excerpt: "Pași practici pentru a deveni specialist AI în România și peste hotare",
      content: `# Cum să Începi o Carieră în Inteligență Artificială: Ghid Complet pentru Români

## De ce AI?

Inteligența Artificială este cel mai rapid evoluționant domeniu tehnologic din ultimii 50 de ani. Salariile sunt impresionante, oportunitățile internaționale sunt nelimitate, iar impactul asupra lumii este profund.

### Perspective de Carieră
- **Entry-level**: 6,000-12,000 RON/lună în România
- **Mid-level**: 12,000-25,000 RON/lună în România
- **Senior**: 25,000-50,000+ RON/lună în România
- **Internationally**: $80,000-$200,000/an

## Pașii pentru Începători

### 1. Fundamente Matematice
**Ce trebuie să înveți:**
- Algebră liniară (vectori, matrice)
- Calcul diferențial și integral
- Statistică și probabilități
- Algoritmi și structuri de date

**Resurse recomandate:**
- Khan Academy (gratuit)
- MIT OpenCourseWare
- "Mathematics for Machine Learning" - gratuit online

### 2. Programare
**Limbaje esențiale:**
- **Python** - principalul limbaj AI
- **R** - pentru analiză statistică
- **SQL** - pentru baze de date

**Unde înveți:**
- Codecademy
- Coursera "Python for Everybody"
- "Automate the Boring Stuff with Python"

### 3. Machine Learning
**Concepte de bază:**
- Supervised vs unsupervised learning
- Classification vs regression
- Overfitting vs underfitting
- Cross-validation

**Cursuri recomandate:**
- Andrew Ng pe Coursera (gratuit)
- Fast.ai (gratuit)
- Kaggle Learn (gratuit)

### 4. Deep Learning
**Framework-uri:**
- TensorFlow/Keras
- PyTorch
- JAX

**Proiecte practice:**
- Recunoaștere de imagini
- Procesare limbaj natural
- Generare text

## Resurse Românești

### Universități
- **Universitatea Politehnica Timișoara** - Facultatea de Automatică
- **Universitatea din București** - Facultatea de Matematică
- **Universitatea "Alexandru Ioan Cuza" Iași** - Informatică

### Comunități
- **Romanian AI Community** (Facebook)
- **Machine Learning Romania** (Meetup)
- **Data Science Society Romania**

### Bootcamps
- **Wild Code School** - București
- **Greenlight** - Cluj
- **Techdin Academy** - Bacău

## Portofoliu de Proiecte

### Pentru Începători
1. **Titanic ML Challenge** - Pe Kaggle
2. **Spam Detection** - Clasificare emailuri
3. **House Price Prediction** - Regresie

### Pentru Intermediari
1. **Chatbot** - NLP cu TensorFlow
2. **Recomandări Filme** - Collaborative filtering
3. **Recunoaștere Plante** - Computer vision

### Pentru Avansați
1. **Generare Text** - cu GPT-style models
2. **Autonomous Trading Bot** - Reinforcement learning
3. **Medical Diagnosis AI** - Deep learning medical

## Certificări Valorificate

### Internaționale
- **TensorFlow Developer Certificate** - Google
- **AWS Machine Learning Specialty**
- **Microsoft Azure AI Engineer Associate**

### Gratuite
- **IBM AI Engineering Professional Certificate** (Coursera)
- **DeepLearning.AI Specializations**
- **fast.ai Part 1 & 2**

## Networking în România

### Evenimente Anuale
- **Romanian AI Summit** - București
- **Techsylvania** - Cluj
- **WeXperience** - București
- **Startup Week** - Iași

### Conferințe Internaționale
- **NeurIPS** - Una din cele mai prestigioase
- **ICML** - International Conference on ML
- **CVPR** - Computer Vision
- **ACL** - Natural Language Processing

## Freelancing pentru Experiență

### Platforme
- **Upwork** - Proiecte internaționale
- **Fiverr** - Mic proiecte rapide
- **Freelancer.com** - Concursuri
- **PeoplePerHour** - Proiecte europene

### Idei de Freelance
- **Data Analysis** - 50-200€/proiect
- **Model Training** - 100-500€/proiect
- **AI Consulting** - 50-150€/oră
- **Tutorial Creation** - 200-1000€/curs

## Aplicarea pentru Joburi

### CV-ul Perfect pentru AI
- **Proiecte reale** > Diploma
- **Contribuții open-source**
- **Blogging despre AI**
- **Competiții Kaggle**

### Platforme de Angajare
- **LinkedIn** - Pentru poziții senior
- **eJobs** - Piața locală
- **Wellfound** - Startupuri
- **AngelList** - Tech companies

### Interviuri AI
- **Codare live** - LeetCode, HackerRank
- **Probleme ML** - Case studies
- **Proiecte personale** - Portofoliu
- **Întrebări teoretice** - ML concepts

## Salarii în România

### Junior (0-2 ani)
- **Developer AI**: 6,000-10,000 RON
- **Data Analyst**: 5,000-8,000 RON
- **ML Engineer**: 8,000-12,000 RON

### Mid-Level (2-5 ani)
- **Senior ML Engineer**: 12,000-20,000 RON
- **Data Scientist**: 10,000-18,000 RON
- **AI Researcher**: 15,000-25,000 RON

### Senior (5+ ani)
- **Lead ML Engineer**: 20,000-35,000 RON
- **Principal Data Scientist**: 25,000-45,000 RON
- **AI Architect**: 30,000-50,000+ RON

## Oportunități Internaționale

### Țări Prietenoase
- **Canada** - Program Express Entry
- **Germania** - Blue Card UE
- **Olanda** - Highly Skilled Migrant
- **Suedia** - Tech specialization

### Companii care angajează Români
- **Google** - București office
- **Amazon** - Multiple locations
- **Microsoft** - România & international
- **IBM** - Global opportunities

## Viitorul Carierelor AI

### Tendințe 2024-2030
- **AI Ethics** - Specializare în etică AI
- **Quantum Machine Learning** - Tehnologie emergentă
- **AI for Good** - Aplicații sociale
- **Edge AI** - Procesare locală

### Abilități Viitoare
- **Prompt Engineering** - Comunicare cu AI
- **AI Governance** - Reglementare și compliance
- **Human-AI Collaboration** - Workflows hibride
- **AI Education** - Training și development

## Concluzie

Cariera în AI este una dintre cele mai bune alegeri pe care le poți face în 2024. România are un potențial uriaș, iar oportunitățile sunt nelimitate pentru cei care sunt dispuși să învețe și să se implice.

Cheia succesului: **Începe acum, înveță constant, construiește proiecte reale și conectează-te cu comunitatea.**

Viitorul aparține celor care înțeleg și modelează inteligența artificială! 🚀`,
      category: "Education",
      tags: ["Career", "Education", "AI Jobs", "Romania"],
      source_urls: ["https://example.com/ai-career-romania"],
      published_at: new Date().toISOString()
    }
  ]
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

async function saveTOONBlogPost(article: any) {
  // Import query function dynamically to avoid build issues
  const { query } = await import('@/lib/db');

  try {
    await query(
      'INSERT INTO blog_posts (title, slug, content, excerpt, category, tags, source_urls, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, \'published\', NOW())',
      [
        article.title,
        generateSlug(article.title),
        article.content,
        article.excerpt,
        article.category || 'AI & Technology',
        JSON.stringify(article.tags || []),
        JSON.stringify(article.source_urls || [])
      ]
    );

    console.log(`✅ TOON Blog post saved: ${article.title}`);
    return true;

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`⚠️  Article already exists: ${generateSlug(article.title)}`);
      return false;
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting Vercel Cron: Morning Blog Generation');

    // Generate TOON blog posts directly
    const articlesGenerated = [];
    for (const article of TOON_BLOG_DATA.data) {
      try {
        const saved = await saveTOONBlogPost(article);
        if (saved) {
          articlesGenerated.push(article);
        }
      } catch (error) {
        console.error(`❌ Failed to save article ${article.title}:`, error);
      }
    }

    console.log(`✅ Generated ${articlesGenerated.length} articles for morning`);

    return NextResponse.json({
      success: true,
      message: `Morning blog generation completed`,
      articlesGenerated: articlesGenerated.length,
      time: new Date().toISOString(),
      type: 'morning'
    });

  } catch (error: any) {
    console.error('❌ Morning blog generation failed:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      time: new Date().toISOString()
    }, { status: 500 });
  }
}