// Intelligent AI Router - RouteLLM-style model selection
// Analyzes query complexity and routes to the best free model

interface ModelConfig {
  name: string;
  cost: number; // per 1K tokens (0 = free)
  speed: number; // tokens/sec estimate
  quality: number; // 1-10 rating
  free: boolean;
  specialties: string[]; // e.g., 'code', 'chat', 'reasoning'
}

const AVAILABLE_MODELS: ModelConfig[] = [
  {
    name: 'x-ai/grok-4.1-fast:free',
    cost: 0,
    speed: 100,
    quality: 7,
    free: true,
    specialties: ['chat', 'general', 'fast']
  },
  {
    name: 'google/gemma-3-27b-it:free',
    cost: 0,
    speed: 80,
    quality: 6,
    free: true,
    specialties: ['chat', 'reasoning']
  },
  {
    name: 'meta-llama/llama-3.1-8b-instruct:free',
    cost: 0,
    speed: 120,
    quality: 6,
    free: true,
    specialties: ['fast', 'general']
  },
  {
    name: 'qwen/qwen-2-7b-instruct:free',
    cost: 0,
    speed: 110,
    quality: 6,
    free: true,
    specialties: ['multilingual', 'chat']
  },
  {
    name: 'openai/gpt-4o-mini',
    cost: 0.15,
    speed: 90,
    quality: 9,
    free: false,
    specialties: ['complex', 'code', 'reasoning']
  },
];

interface QueryAnalysis {
  complexity: number; // 1-10
  type: 'simple' | 'medium' | 'complex';
  needsCode: boolean;
  needsReasoning: boolean;
  isMultilingual: boolean;
  estimatedTokens: number;
}

/**
 * Analyzes query to determine complexity and routing strategy
 */
export function analyzeQuery(query: string): QueryAnalysis {
  let complexity = 1;
  const lowerQuery = query.toLowerCase();
  
  // Length analysis
  complexity += Math.min(query.length / 100, 2);
  
  // Technical/code indicators
  const codeKeywords = /\b(code|function|class|debug|program|algorithm|api|sql|database)\b/gi;
  const codeMatches = (query.match(codeKeywords) || []).length;
 if (codeMatches > 0) {
    complexity += 2;
  }
  
  // Reasoning indicators
  const reasoningKeywords = /\b(why|how|explain|analyze|compare|evaluate|reason|logic)\b/gi;
  const reasoningMatches = (query.match(reasoningKeywords) || []).length;
  if (reasoningMatches > 0) {
    complexity += 1.5;
  }
  
  // Multi-step indicators
  const multiStepKeywords = /(then|after|next|finally|first|second|step)/gi;
  if (multiStepKeywords.test(query)) {
    complexity += 2;
  }
  
  // Question complexity
  const questionMarks = (query.match(/\?/g) || []).length;
  complexity += Math.min(questionMarks * 0.5, 1);
  
  // Romanian language check
  const romanianWords = /\b(cum|când|unde|cine|ce|sunt|este|poate|trebuie|vreau)\b/gi;
  const isMultilingual = romanianWords.test(query);
  
  // Estimate tokens (rough: 1 token ≈ 4 chars)
  const estimatedTokens = Math.ceil(query.length / 4);
  
  // Cap complexity at 10
  complexity = Math.min(complexity, 10);
  
  // Determine type
  let type: 'simple' | 'medium' | 'complex';
  if (complexity <= 3) type = 'simple';
  else if (complexity <= 6) type = 'medium';
  else type = 'complex';
  
  return {
    complexity,
    type,
    needsCode: codeMatches > 0 || /```/.test(query),
    needsReasoning: reasoningMatches > 1,
    isMultilingual,
    estimatedTokens
  };
}

/**
 * Selects the best model based on query analysis and user preferences
 */
export function selectBestModel(
  query: string,
  options: {
    preferFree?: boolean;
    maxCost?: number;
    preferSpeed?: boolean;
  } = {}
): { model: string; reasoning: string } {
  const { preferFree = true, maxCost = 0, preferSpeed = false } = options;
  
  const analysis = analyzeQuery(query);
  
  // Filter models by cost preference
  let availableModels = preferFree
    ? AVAILABLE_MODELS.filter(m => m.free)
    : AVAILABLE_MODELS.filter(m => m.cost <= maxCost);
  
  // If no models available after filtering, fall back to free models
  if (availableModels.length === 0) {
    availableModels = AVAILABLE_MODELS.filter(m => m.free);
  }
  
  // Scoring system
  const scoredModels = availableModels.map(model => {
    let score = 0;
    
    // Base quality score
    score += model.quality * 2;
    
    // Speed preference
    if (preferSpeed) {
      score += (model.speed / 10);
    }
    
    // Match analysis to specialties
    if (analysis.needsCode && model.specialties.includes('code')) {
      score += 5;
    }
    if (analysis.needsReasoning && model.specialties.includes('reasoning')) {
      score += 4;
    }
    if (analysis.isMultilingual && model.specialties.includes('multilingual')) {
      score += 3;
    }
    if (analysis.type === 'simple' && model.specialties.includes('fast')) {
      score += 2;
    }
    
    // Penalize expensive models if preferring free
    if (preferFree && !model.free) {
      score -= 10;
    }
    
    // Complexity matching
    if (analysis.complexity <= 3 && model.speed > 100) {
      score += 3; // Fast models for simple queries
    } else if (analysis.complexity >= 7 && model.quality >= 8) {
      score += 5; // High-quality models for complex queries
    }
    
    return { model, score };
  });
  
  // Sort by score descending
  scoredModels.sort((a, b) => b.score - a.score);
  
  const selectedModel = scoredModels[0].model;
  
  // Generate reasoning
  const reasoning = generateReasoning(analysis, selectedModel);
  
  return {
    model: selectedModel.name,
    reasoning
  };
}

function generateReasoning(analysis: QueryAnalysis, model: ModelConfig): string {
  const reasons = [];
  
  reasons.push(`Query complexity: ${analysis.complexity}/10 (${analysis.type})`);
  
  if (analysis.type === 'simple') {
    reasons.push(`Using fast model (${model.name}) for simple query`);
  } else if (analysis.type === 'complex') {
    reasons.push(`Using high-quality model (${model.name}) for complex query`);
  } else {
    reasons.push(`Balanced model selection (${model.name})`);
  }
  
  if (analysis.needsCode) {
    reasons.push('Code generation/analysis detected');
  }
  if (analysis.needsReasoning) {
    reasons.push('Reasoning task detected');
  }
  if (analysis.isMultilingual) {
    reasons.push('Romanian language support needed');
  }
  
  reasons.push(`Model: ${model.quality}/10 quality, ${model.speed} tok/s, ${model.free ? 'FREE' : `$${model.cost}/1K tok`}`);
  
  return reasons.join(' | ');
}

/**
 * Fallback chain for when a model fails
 */
export function getFallbackModel(failedModel: string): string {
  const fallbackChain = [
    'x-ai/grok-4.1-fast:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'qwen/qwen-2-7b-instruct:free'
  ];
  
  const currentIndex = fallbackChain.indexOf(failedModel);
  const nextIndex = (currentIndex + 1) % fallbackChain.length;
  
  return fallbackChain[nextIndex];
}

/**
 * Usage example:
 * 
 * const { model, reasoning } = selectBestModel(
 *   "Explain how to implement a binary search tree in Python",
 *   { preferFree: true, preferSpeed: false }
 * );
 * 
 * console.log(`Selected: ${model}`);
 * console.log(`Reasoning: ${reasoning}`);
 */
