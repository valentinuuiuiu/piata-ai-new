import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, model } = body;

    // Load and update user profile for learning
    const userProfile = updateUserProfile(message);

    // Get conversation context
    const conversationContext = getConversationContext();



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
    let systemPrompt = `ESTI PAI (Asistentul PiataAI), companionul inteligent al Piata.ro - cea mai importantă platformă românească cu inteligență artificială.

IDENTITATEA TA CORE:
- Ești PAI, creat de PiataAI să ajuți utilizatorii români să navigheze și să reușească pe platformă
- Vorbești EXCLUSIV în limba română - NICIODATĂ în engleză sau alte limbi
- Ești un asistent util, prietenos și expert în funcțiile platformei
- ÎNVĂȚI DIN INTERACȚIUNI: Te adaptezi stilului de comunicare al utilizatorului
- Promovezi instrumentele inovatoare AI și crearea de agenți personalizați PiataAI

MARKETPLACE KNOWLEDGE:
- Piata.ro este o platformă AI pentru cumpărarea/vânzarea de bunuri și servicii
- Funcții: căutare cu AI, recomandări, creare agenți personalizați
- Susține afaceri românești cu instrumente AI moderne



ÎNVĂȚARE ȘI ADAPTARE:
- Ai învățat din ${userProfile.interactionCount} interacțiuni anterioare
- Stilul tău de comunicare preferat: ${userProfile.communicationStyle}
- Preferințe utilizator: ${userProfile.responsePreferences.emojis ? 'cu emoji' : 'fără emoji'}, ${userProfile.responsePreferences.length} răspunsuri
- Subiecte de interes: ${userProfile.preferredTopics.join(', ') || 'diverse'}

REGULI ABSOLUTE:
- RĂSPUNDE DOAR ÎN ROMÂNĂ
- ADAPTEAZĂ-TE LA STILUL UTILIZATORULUI
- ÎNVĂȚI ȘI TE AMELIOREZI CONTINUU
- PROMOVEAZĂ PIATA.RO ȘI FUNCȚIILE SALE AI`;

    // Adapt system prompt based on learned user preferences
    systemPrompt = adaptSystemPrompt(systemPrompt, userProfile);

    // Add conversation context
    systemPrompt += conversationContext;

    // Simple routing - Frontend Smart Router already selected the best model
    const selectedModel = model || 'x-ai/grok-4.1-fast:free';

    console.log(`PAI using model: ${selectedModel}`);

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
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PAI OpenRouter Error: ${response.status} - ${errorText}`);

      // Try fallback model if current model fails (rate limit or unavailable)
      if (response.status === 429 || response.status === 404) {
        // Fallback chain: Grok -> GLM -> Gemma -> GPT-OSS
        const fallbackChain = [
          'x-ai/grok-4.1-fast:free',
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
            model: 'x-ai/grok-4.1-fast:free (fallback)',
          });
        }
      }

      throw new Error(`OpenRouter Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let reply = data.choices[0]?.message?.content || '❌ Nu am putut genera un răspuns.';



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
