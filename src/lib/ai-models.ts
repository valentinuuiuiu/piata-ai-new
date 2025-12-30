export interface AgentModelConfig {
  name: string;
  model: string;
  specialties: string[];
  costPerToken: number;
}

export const AI_MODELS: Record<string, AgentModelConfig> = {
  claude: {
    name: 'Claude',
    model: 'anthropic/claude-3-haiku',
    specialties: ['code', 'reasoning', 'orchestration', 'planning'],
    costPerToken: 0.00000025
  },
  grok: {
    name: 'Grok',
    model: 'x-ai/grok-2-1212',
    specialties: ['marketplace', 'automation', 'insights', 'real-time'],
    costPerToken: 0.000002
  },
  llama: {
    name: 'Llama',
    model: 'meta-llama/llama-3.1-405b-instruct',
    specialties: ['smart-contracts', 'solidity', 'optimization', 'security'],
    costPerToken: 0.000003
  },
  qwen: {
    name: 'Qwen',
    model: 'qwen/qwen-2.5-72b-instruct',
    specialties: ['multilingual', 'content', 'translation', 'analysis'],
    costPerToken: 0.000001
  },
  gemini: {
    name: 'Gemini',
    // Using the flash model for speed/efficiency as requested in plan discussion implicitly via 'google/gemini-2.0-flash-001'
    model: 'google/gemini-2.0-flash-001',
    specialties: ['multimodal', 'vision', 'speed', 'long-context'],
    costPerToken: 0.000001
  },
  // Kate-Coder (Mistral Devstral) - Kept as legacy/specialized but standardized config could be here
  kate: {
    name: 'Kate-Coder',
    model: 'mistralai/devstral-2512', // Assuming this was the intent from previous code
    specialties: ['coding', 'architecture'],
    costPerToken: 0.000002
  }
};
