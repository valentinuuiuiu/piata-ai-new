// KAEL - Knowledge & Action Execution Layer
// The Orchestrator for Piata AI

export type ModelTier = 'basic' | 'standard' | 'advanced' | 'research';

export interface TOONContext {
  complexity: number;
  tokens_estimated: number;
  required_capabilities: string[];
  priority: 'speed' | 'quality';
}

export interface KAELRoute {
  model: string;
  provider: string;
  reasoning: string;
  max_tokens: number;
  temperature: number;
}

// Free models list from OpenRouter (2025)
const FREE_MODELS = {
  basic: [
    'google/gemma-2-9b-it:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free'
  ],
  standard: [
    'qwen/qwen-2.5-7b-instruct:free',
    '01-ai/yi-lightning', // Often free or very cheap
    'z-ai/glm-4.5-air:free'
  ],
  advanced: [
    'x-ai/grok-4.1-fast:free', // Assuming this is available/free as per previous code
    'mistralai/mistral-nemo:free'
  ],
  research: [
    'alibaba/tongyi-deepresearch-30b-a3b:free'
  ]
};

export class KAELOrchestrator {
  private static instance: KAELOrchestrator;

  private constructor() {}

  public static getInstance(): KAELOrchestrator {
    if (!KAELOrchestrator.instance) {
      KAELOrchestrator.instance = new KAELOrchestrator();
    }
    return KAELOrchestrator.instance;
  }

  /**
   * Analyzes the prompt to determine complexity and requirements (TOON analysis)
   */
  public analyzeTask(prompt: string): TOONContext {
    const wordCount = prompt.split(' ').length;
    const technicalTerms = /\b(code|api|database|sql|function|class|interface|async|await|react|nextjs|supabase|deployment|docker|linux|bash)\b/gi;
    const complexTerms = /\b(analyze|compare|evaluate|design|architecture|strategy|comprehensive|step-by-step|reasoning|chain-of-thought)\b/gi;
    
    const techCount = (prompt.match(technicalTerms) || []).length;
    const complexCount = (prompt.match(complexTerms) || []).length;
    
    let complexity = 1;
    if (wordCount > 100) complexity += 1;
    if (wordCount > 500) complexity += 1;
    if (techCount > 0) complexity += 1;
    if (techCount > 5) complexity += 2;
    if (complexCount > 0) complexity += 1;
    
    // Cap complexity at 10
    complexity = Math.min(complexity, 10);

    return {
      complexity,
      tokens_estimated: wordCount * 1.3, // Rough estimate
      required_capabilities: techCount > 0 ? ['coding', 'technical'] : ['general'],
      priority: complexity > 5 ? 'quality' : 'speed'
    };
  }

  /**
   * Routes the task to the best free model based on TOON analysis
   */
  public route(context: TOONContext): KAELRoute {
    let selectedModel = FREE_MODELS.basic[0];
    let tier: ModelTier = 'basic';
    let reasoning = 'Low complexity task, using basic model for speed.';

    if (context.complexity >= 8) {
      tier = 'research';
      selectedModel = FREE_MODELS.research[0] || FREE_MODELS.advanced[0];
      reasoning = 'High complexity/research task, using most capable free model.';
    } else if (context.complexity >= 5) {
      tier = 'advanced';
      selectedModel = FREE_MODELS.advanced[0] || FREE_MODELS.standard[0];
      reasoning = 'Medium-high complexity, using advanced model.';
    } else if (context.complexity >= 3) {
      tier = 'standard';
      selectedModel = FREE_MODELS.standard[0];
      reasoning = 'Standard complexity, using balanced model.';
    }

    return {
      model: selectedModel,
      provider: 'OpenRouter',
      reasoning,
      max_tokens: context.complexity > 5 ? 2000 : 1000,
      temperature: context.required_capabilities.includes('coding') ? 0.2 : 0.7
    };
  }

  /**
   * Big-AGI "Beam" inspired multi-model selection
   * Returns a set of models for parallel execution/merging
   */
  public beam(context: TOONContext): string[] {
    if (context.complexity >= 8) {
      // For research/complex tasks, combine Research + Advanced models
      return [
        FREE_MODELS.research[0],
        FREE_MODELS.advanced[0],
        FREE_MODELS.advanced[1] || FREE_MODELS.standard[0]
      ];
    } else if (context.complexity >= 5) {
      // For standard tasks, combine Advanced + Standard
      return [
        FREE_MODELS.advanced[0],
        FREE_MODELS.standard[0]
      ];
    }
    // Basic tasks don't need beam
    return [FREE_MODELS.basic[0]];
  }

  /**
   * Fallback mechanism if the primary model fails
   */
  public getFallbackModel(failedModel: string): string {
    // Flatten all models
    const allModels = [
      ...FREE_MODELS.research,
      ...FREE_MODELS.advanced,
      ...FREE_MODELS.standard,
      ...FREE_MODELS.basic
    ];
    
    // Find a model that isn't the failed one
    const fallback = allModels.find(m => m !== failedModel) || 'google/gemma-2-9b-it:free';
    return fallback;
  }
}

export const kael = KAELOrchestrator.getInstance();
