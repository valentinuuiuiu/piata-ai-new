import fs from 'fs';
import path from 'path';
import { AI_MODELS } from '../src/lib/ai-models';

console.log('Verifying AI Models Configuration (Static & Config Check)...');

// 1. Verify Config Values
const expectedModels = {
    claude: 'anthropic/claude-3-haiku',
    grok: 'x-ai/grok-2-1212',
    llama: 'meta-llama/llama-3.1-405b-instruct',
    qwen: 'qwen/qwen-2.5-72b-instruct',
    gemini: 'google/gemini-2.0-flash-001'
};

let errors = 0;

console.log('\n--- Checking src/lib/ai-models.ts ---');
for (const [key, modelId] of Object.entries(expectedModels)) {
    if (AI_MODELS[key]?.model !== modelId) {
        console.error(`ERROR: AI_MODELS.${key}.model is '${AI_MODELS[key]?.model}', expected '${modelId}'`);
        errors++;
    } else {
        console.log(`OK: AI_MODELS.${key}.model matches`);
    }
}

// 2. Verify Orchestrator Usage (Static)
console.log('\n--- Checking src/lib/ai-orchestrator.ts ---');
const orchestratorPath = path.join(process.cwd(), 'src/lib/ai-orchestrator.ts');
const orchestratorContent = fs.readFileSync(orchestratorPath, 'utf-8');

if (orchestratorContent.includes('import { AI_MODELS')) {
    console.log('OK: Imports AI_MODELS');
} else {
    console.error('ERROR: Does not import AI_MODELS');
    errors++;
}

if (orchestratorContent.includes('AI_MODELS.claude.model') &&
    orchestratorContent.includes('AI_MODELS.grok.model')) { // Check a few key ones
    console.log('OK: Uses AI_MODELS constants');
} else {
    console.error('ERROR: Does not appear to use AI_MODELS constants (checked claude/grok)');
    errors++;
}

// 3. Verify Gemini Service Usage (Static)
console.log('\n--- Checking src/app/services/geminiService.ts ---');
const geminiServicePath = path.join(process.cwd(), 'src/app/services/geminiService.ts');
const geminiServiceContent = fs.readFileSync(geminiServicePath, 'utf-8');

if (geminiServiceContent.includes('import { AI_MODELS')) {
    console.log('OK: Imports AI_MODELS');
} else {
    console.error('ERROR: Does not import AI_MODELS');
    errors++;
}

if (geminiServiceContent.includes('OPENROUTER_MODEL = AI_MODELS.grok.model')) {
    console.log('OK: Uses AI_MODELS.grok.model for OPENROUTER_MODEL');
} else {
    console.error('ERROR: Does not use AI_MODELS.grok.model');
    errors++;
}

// 4. Verify Grok Shell Script
console.log('\n--- Checking subagents/grok-agent.sh ---');
const grokScriptPath = path.join(process.cwd(), 'subagents/grok-agent.sh');
const grokScriptContent = fs.readFileSync(grokScriptPath, 'utf-8');

if (grokScriptContent.includes('x-ai/grok-2-1212')) {
    console.log('OK: Shell script uses correct Grok model');
} else {
    console.error('ERROR: Shell script does not contain correct Grok model ID');
    errors++;
}

console.log(`\nVerification Complete. Errors: ${errors}`);
if (errors === 0) {
    process.exit(0);
} else {
    process.exit(1);
}
