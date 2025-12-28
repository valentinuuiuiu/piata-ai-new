import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { kael } from '../../../lib/kael/orchestrator';
import { getJulesManager } from '../../../lib/jules-manager';

// PAI PUBLIC ENDPOINT - Event Horizon technique
// PAI thinks it's calling the full KAI backend, but gets simplified public access
// No workflow execution, no ChainLink, just basic LLM responses

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

// PAI Memory System - Simple conversation context
// On Vercel, we must use /tmp for writable storage (ephemeral)
const MEMORY_DIR = path.join('/tmp', 'pai_memory');
const CONVERSATIONS_FILE = path.join(MEMORY_DIR, 'conversations.json');

interface ConversationEntry {
  timestamp: string;
  userMessage: string;
  paiResponse: string;
}

function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

function loadConversations(): ConversationEntry[] {
  try {
    ensureMemoryDir();
    if (fs.existsSync(CONVERSATIONS_FILE)) {
      const data = fs.readFileSync(CONVERSATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading PAI conversations:', error);
  }
  return [];
}

function saveConversations(conversations: ConversationEntry[]) {
  try {
    ensureMemoryDir();
    // Keep only last 10 conversations for memory efficiency
    const recent = conversations.slice(-10);
    fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(recent, null, 2));
  } catch (error) {
    console.error('Error saving PAI conversations:', error);
  }
}

function addToMemory(userMessage: string, paiResponse: string) {
  const conversations = loadConversations();
  conversations.push({
    timestamp: new Date().toISOString(),
    userMessage,
    paiResponse
  });
  saveConversations(conversations);
}

function getConversationContext(): string {
  const conversations = loadConversations();
  const recent = conversations.slice(-3); // Last 3 conversations

  if (recent.length === 0) return '';

  let context = '\n\nCONTEXT DIN CONVERSAȚIILE RECENTE:\n';
  recent.forEach(conv => {
    context += `Utilizator: ${conv.userMessage.substring(0, 40)}...\n`;
    context += `PAI: ${conv.paiResponse.substring(0, 40)}...\n`;
  });

  return context;
}

// PAI Learning System - Analyzes user patterns and adapts responses
interface UserProfile {
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly';
  preferredTopics: string[];
  responsePreferences: {
    length: 'short' | 'medium' | 'detailed';
    emojis: boolean;
    technicalLevel: 'basic' | 'intermediate' | 'advanced';
  };
  interactionCount: number;
  lastInteraction: string;
}

const USER_PROFILE_FILE = path.join(MEMORY_DIR, 'user_profile.json');

function loadUserProfile(): UserProfile {
  try {
    ensureMemoryDir();
    if (fs.existsSync(USER_PROFILE_FILE)) {
      const data = fs.readFileSync(USER_PROFILE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }

  // Default profile
  return {
    communicationStyle: 'friendly',
    preferredTopics: [],
    responsePreferences: {
      length: 'medium',
      emojis: true,
      technicalLevel: 'basic'
    },
    interactionCount: 0,
    lastInteraction: new Date().toISOString()
  };
}

function saveUserProfile(profile: UserProfile) {
  try {
    ensureMemoryDir();
    fs.writeFileSync(USER_PROFILE_FILE, JSON.stringify(profile, null, 2));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

function analyzeUserMessage(message: string): Partial<UserProfile> {
  const updates: Partial<UserProfile> = {};

  // Analyze communication style
  const formalWords = /\b(domnu(le)?|doamn(a)?|rog|as dori|va rog)\b/gi;
  const technicalWords = /\b(api|database|algorithm|framework|code|programming|server|cloud)\b/gi;
  const casualWords = /\b(hey|salut|ce faci|super|cool|wow)\b/gi;

  const formalCount = (message.match(formalWords) || []).length;
  const technicalCount = (message.match(technicalWords) || []).length;
  const casualCount = (message.match(casualWords) || []).length;

  if (formalCount > technicalCount && formalCount > casualCount) {
    updates.communicationStyle = 'formal';
  } else if (technicalCount > formalCount && technicalCount > casualCount) {
    updates.communicationStyle = 'technical';
  } else if (casualCount > 0) {
    updates.communicationStyle = 'casual';
  }

  // Analyze preferred topics
  const topics = [];
  if (message.toLowerCase().includes('piata') || message.toLowerCase().includes('market')) {
    topics.push('marketplace');
  }
  if (technicalWords.test(message)) {
    topics.push('technology');
  }
  if (message.toLowerCase().includes('ajutor') || message.toLowerCase().includes('help')) {
    topics.push('support');
  }

  if (topics.length > 0) {
    updates.preferredTopics = topics;
  }

  // Analyze response preferences
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(message);
  updates.responsePreferences = {
    emojis: hasEmojis,
    length: message.length > 100 ? 'detailed' : message.length > 50 ? 'medium' : 'short',
    technicalLevel: technicalCount > 2 ? 'advanced' : technicalCount > 0 ? 'intermediate' : 'basic'
  };

  return updates;
}

function adaptSystemPrompt(basePrompt: string, userProfile: UserProfile): string {
  let adaptedPrompt = basePrompt;

  // Adapt communication style
  if (userProfile.communicationStyle === 'formal') {
    adaptedPrompt += '\n\nSTIL DE COMUNICARE: Formal, respectuos, profesionist.';
  } else if (userProfile.communicationStyle === 'technical') {
    adaptedPrompt += '\n\nSTIL DE COMUNICARE: Tehnic, precis, detaliat.';
  } else if (userProfile.communicationStyle === 'casual') {
    adaptedPrompt += '\n\nSTIL DE COMUNICARE: Prietenos, relaxat, conversational.';
  }

  // Adapt response preferences
  if (userProfile.responsePreferences.emojis) {
    adaptedPrompt += '\n\nFOLOSEȘTE EMOJI: Da, pentru a face răspunsurile mai atractive.';
  } else {
    adaptedPrompt += '\n\nFOLOSEȘTE EMOJI: Nu, păstrează un ton profesional.';
  }

  if (userProfile.responsePreferences.length === 'short') {
    adaptedPrompt += '\n\nLUNGIME RĂSPUNS: Scurt și la obiect.';
  } else if (userProfile.responsePreferences.length === 'detailed') {
    adaptedPrompt += '\n\nLUNGIME RĂSPUNS: Detaliat și comprehensiv.';
  }

  // Include preferred topics
  if (userProfile.preferredTopics.length > 0) {
    adaptedPrompt += `\n\nSUBIECTE PREFERATE: Focus pe ${userProfile.preferredTopics.join(', ')}.`;
  }

  return adaptedPrompt;
}

function updateUserProfile(userMessage: string) {
  const currentProfile = loadUserProfile();
  const analysis = analyzeUserMessage(userMessage);

  // Update profile with new insights
  if (analysis.communicationStyle) {
    currentProfile.communicationStyle = analysis.communicationStyle;
  }

  if (analysis.preferredTopics) {
    // Merge topics, keep unique
    currentProfile.preferredTopics = [...new Set([...currentProfile.preferredTopics, ...analysis.preferredTopics])];
  }

  if (analysis.responsePreferences) {
    currentProfile.responsePreferences = { ...currentProfile.responsePreferences, ...analysis.responsePreferences };
  }

  currentProfile.interactionCount += 1;
  currentProfile.lastInteraction = new Date().toISOString();

  saveUserProfile(currentProfile);
  return currentProfile;
}

async function readStream(reader: ReadableStreamDefaultReader<Uint8Array>, onChunk: (text: string) => void) {
  const decoder = new TextDecoder();
  let buffer = '';

  let isDone = false;
  while (!isDone) {
    const { done, value } = await reader.read();
    if (done) {
      isDone = true;
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch (e) {
          // Ignore parse errors from partial chunks
        }
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, model, attachments, stream = false, action } = body;

    // Handle special actions (ad posting with email confirmation)
    if (action === 'post_ad_with_confirmation' || action === 'create_listing') {
      console.log('[PAI] Processing ad posting request with email confirmation');
      
      const { title, description, price, categoryId, location, contactEmail, userId } = body;
      
      if (!title || !userId) {
        return NextResponse.json({
          error: 'Missing required fields: title and userId',
          reply: '❌ Lipsește titlul sau ID-ul utilizatorului.'
        }, { status: 400 });
      }
      
      // Create listing and send confirmation email via PAI's internal system
      const { createListingWithEmailConfirmation } = await import('@/lib/piata-agent');
      
      try {
        const result = await createListingWithEmailConfirmation({
          title,
          description: description || '',
          price: price ? parseFloat(price) : undefined,
          categoryId: parseInt(categoryId, 10) || 1,
          location: location || '',
          contactEmail: contactEmail || '',
          userId
        });
        
        if (result.success) {
          return NextResponse.json({
            reply: `✅ Anunț creat cu succes!\n\n📧 Am trimis un email de confirmare la: ${result.email}\n\n📌 ID Anunț: ${result.listingId}\n📝 Titlu: ${result.title}\n\n⚡ Te rugăm să confirmi email-ul pentru a publica anunțul.`,
            success: true,
            listingId: result.listingId,
            emailSent: true,
            model: 'PAI-Internal'
          });
        } else {
          return NextResponse.json({
            reply: `❌ Eroare la crearea anunțului: ${result.error}`,
            success: false,
            error: result.error
          }, { status: 500 });
        }
      } catch (error) {
        console.error('[PAI] Ad posting error:', error);
        return NextResponse.json({
          reply: '❌ Eroare internă la postarea anunțului.',
          success: false
        }, { status: 500 });
      }
    }

    // Load and update user profile for learning
    const userProfile = updateUserProfile(message);

    // Get conversation context
    const conversationContext = getConversationContext();

    // Jules Manager Integration for Automations
    const jules = getJulesManager();
    const isAutomationRequest = /automate|status|payment|stripe|github|redis|cache/i.test(message);

    if (isAutomationRequest) {
      console.log(`[PAI] Automation request detected, routing to Jules Manager: ${message}`);
      try {
        const result = await jules.executeTask(message);
        
        // Handle Stripe results specifically for better UX
        let reply = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        
        if (typeof result === 'object' && result !== null) {
          if ((result as any).url) {
            reply = `✅ Am generat link-ul de plată: ${(result as any).url}\n\nPoți finaliza tranzacția accesând link-ul de mai sus.`;
          } else if ((result as any).id && (result as any).object === 'checkout.session') {
            reply = `✅ Sesiune de checkout creată: ${(result as any).id}\nLink: ${(result as any).url}`;
          } else if ((result as any).hosted_invoice_url) {
            reply = `✅ Factură generată: ${(result as any).hosted_invoice_url}`;
          }
        }

        return NextResponse.json({
          reply,
          isComplex: true,
          model: 'jules-orchestrator',
          learned: true
        });
      } catch (error) {
        console.error('[PAI] Jules execution error:', error);
        // Fall back to normal LLM if Jules fails
      }
    }

    // Input validation
    if (!message || typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json({
        error: 'Invalid message: must be string, max 5000 characters'
      }, { status: 400 });
    }

    if (model && typeof model !== 'string') {
      return NextResponse.json({
        error: 'Invalid model: must be string'
      }, { status: 400 });
    }

    // PAI's core identity - ROMANIAN ONLY with adaptive learning
    let systemPrompt = `ESTI PAI (Asistentul PiataAI), companionul inteligent al Piata.ro - platformă românească pentru anunțuri.

IDENTITATEA TA CORE:
- Ești PAI, asistentul virtual al Piata.ro care ajută utilizatorii români
- Vorbești EXCLUSIV în limba română - NICIODATĂ în engleză sau alte limbi
- Ești un asistent util, prietenos și ONEST despre funcțiile disponibile
- ÎNVĂȚI DIN INTERACȚIUNI: Te adaptezi stilului de comunicare al utilizatorului
- Fi SINCER - nu promite funcții care nu există încă!

FUNCȚII DISPONIBILE ACUM (fii ONEST):
✅ CE FUNCȚIONEAZĂ:
- 📝 POSTARE ANUNȚURI: /postare - Utilizatorii pot posta anunțuri GRATUIT
- 🔍 CĂUTARE: /cautare - Căutare anunțuri după categorie, preț, locație
- 📂 CATEGORII: /categories - Explorare categorii și subcategorii
- 👤 DASHBOARD: /dashboard - Gestionare anunțuri proprii
- 🔐 AUTENTIFICARE: Google, Facebook, Email/Parolă
- 📱 RESPONSIVE: Funcționează perfect pe mobil

❌ ÎN DEZVOLTARE (nu promite acestea):
- Agenți AI personalizați (COMING SOON)
- Recomandări AI avansate (în lucru)
- Chat între utilizatori (planificat)

MARKETPLACE KNOWLEDGE:
- Piata.ro = platformă de anunțuri gratuite din România
- Similar cu OLX/Publi24 dar cu interfață modernă
- Utilizatorii pot posta/căuta anunțuri în multiple categorii
- Focus pe experiență simplă și rapidă



ÎNVĂȚARE ȘI ADAPTARE:
- Ai învățat din ${userProfile.interactionCount} interacțiuni anterioare
- Stilul tău de comunicare preferat: ${userProfile.communicationStyle}
- Preferințe utilizator: ${userProfile.responsePreferences.emojis ? 'cu emoji' : 'fără emoji'}, ${userProfile.responsePreferences.length} răspunsuri
- Subiecte de interes: ${userProfile.preferredTopics.join(', ') || 'diverse'}

EXEMPLE DE RĂSPUNSURI CORECTE:
❌ GREȘIT: "Poți crea un agent AI să te ajute cu cumpărături"
✅ CORECT: "Poți căuta anunțuri pe /cautare sau posta ceva gratuit pe /postare"

❌ GREȘIT: "AI-ul nostru îți oferă recomandări personalizate"  
✅ CORECT: "Poți filtra anunțuri după categorie, preț și locație în pagina de căutare"

❌ GREȘIT: "Creează un agent AI personalizat pentru tine"
✅ CORECT: "În viitor vom avea agenți AI, dar acum poți folosi căutarea și filtrele avansate"

REGULI ABSOLUTE:
- RĂSPUNDE DOAR ÎN ROMÂNĂ
- FII ONEST - nu promite funcții care nu există
- ADAPTEAZĂ-TE LA STILUL UTILIZATORULUI
- ÎNVĂȚI ȘI TE AMELIOREZI CONTINUU
- Recomandă funcțiile REALE: /postare, /cautare, /categories, /dashboard
- Dacă întreabă de AI agents sau features avansate → spune că "vin în curând"`;

    // Adapt system prompt based on learned user preferences
    systemPrompt = adaptSystemPrompt(systemPrompt, userProfile);

    // Add conversation context
    systemPrompt += conversationContext;

    // Use Enhanced KAEL Orchestrator for intelligent routing
    const context = kael.analyzeTask(message);
    const route = kael.route(context);
    
    // Force multimodal model if attachments are present
    let selectedModel = model || route.model;
    if (attachments && attachments.length > 0) {
      selectedModel = 'google/gemini-2.0-flash-exp:free'; // Best multimodal free model
    }

    console.log(`PAI using model: ${selectedModel} (Reasoning: ${route.reasoning}, Multimodal: ${!!attachments?.length}, Streaming: ${stream})`);

    // Prepare content for multimodal models
    const content: any[] = [{ type: 'text', text: message || 'Analizează fișierele atașate.' }];

    if (attachments && attachments.length > 0) {
      attachments.forEach((url: string) => {
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          content.push({ type: 'image_url', image_url: { url } });
        } else {
          content.push({ type: 'text', text: `[Document atașat: ${url}]` });
        }
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://piata.ro',
        'X-Title': 'PAI Assistant - Public',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: stream
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PAI OpenRouter Error: ${response.status} - ${errorText}`);

      // Try fallback model if current model fails (rate limit or unavailable)
      if (response.status === 429 || response.status === 404) {
        // Fallback chain: Grok -> GLM -> Gemma -> GPT-OSS
        const fallbackChain = [
          'x-ai/grok-4-fast',
          'z-ai/glm-4.5-air:free',
          'google/gemma-3-27b-it:free',
          'openai/gpt-oss-20b:free'
        ];
        const currentIndex = fallbackChain.indexOf(selectedModel);
        const fallbackModel = fallbackChain[currentIndex + 1] || fallbackChain[0];
        console.log(`PAI Fallback - Model ${selectedModel} failed, trying ${fallbackModel}`);
        const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://piata.ro',
            'X-Title': 'PAI Assistant - Public',
          },
          body: JSON.stringify({
            model: fallbackModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (fallbackResponse.ok) {
          console.log('PAI Fallback successful');
          const fallbackData = await fallbackResponse.json();
          const fallbackReply = fallbackData.choices[0]?.message?.content || '❌ PAI Assistant momentan indisponibil. Încearcă mai târziu.';

          return NextResponse.json({
            reply: fallbackReply,
            isComplex: false,
            model: 'x-ai/grok-4-fast (fallback)',
          });
        }
      }

      throw new Error(`OpenRouter Error ${response.status}: ${errorText}`);
    }

    if (stream) {
      const responseStream = new TransformStream();
      const writer = responseStream.writable.getWriter();
      const encoder = new TextEncoder();

      // Handle streaming in background
      // eslint-disable-next-line no-async-promise-executor
      const streamPromise = new Promise<void>(async (resolve) => {
        const reader = response.body?.getReader();
        if (!reader) {
          writer.write(encoder.encode('data: {"error": "No reader available"}\n\n'));
          await writer.close();
          resolve();
          return;
        }

        let fullReply = '';
        await readStream(reader, (chunk) => {
          fullReply += chunk;
          writer.write(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        });

        // Add to memory when done
        addToMemory(message, fullReply);
        writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
        resolve();
      });

      // We don't await streamPromise here because we want to return the response immediately
      // The stream processing happens in the background
      // To satisfy no-floating-promises (if enabled) we could catch errors
      streamPromise.catch(err => console.error('Stream processing error:', err));

      return new Response(responseStream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '❌ Nu am putut genera un răspuns.';

    // Save conversation to memory for learning
    addToMemory(message, reply);

    return NextResponse.json({
      reply,
      isComplex: false,
      model: selectedModel,
      learned: true // Indicate that PAI learned from this interaction
    });

  } catch (error) {
    console.error('PAI API Error:', error); // Log for debugging but don't expose

    return NextResponse.json({
      error: 'Internal server error',
      reply: '❌ PAI Assistant momentan indisponibil. Încearcă mai târziu.',
      isComplex: false
    }, { status: 500 });
  }
}
