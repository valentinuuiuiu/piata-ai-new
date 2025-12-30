import { kael } from '../src/lib/kael/orchestrator';

console.log('Testing KAEL Tool Generation...');

// Mock the generateTool to avoid actual API calls during basic verification if needed, 
// but here we want to verify the method exists and runs.
// We will call it with a dry run flag concept or just inspect the method presence if we can't mock imports easily.

if (typeof kael.generateTool === 'function') {
    console.log('SUCCESS: generateTool method exists on KAELOrchestrator instance.');
} else {
    console.error('FAILED: generateTool method missing.');
    process.exit(1);
}

// Static check for method body (rough)
const fs = require('fs');
const path = require('path');
const orchestratorContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/kael/orchestrator.ts'), 'utf-8');

if (orchestratorContent.includes('public async generateTool')) {
    console.log('SUCCESS: Method definition found in file.');
} else {
    console.error('FAILED: Method definition not found in file content.');
    process.exit(1);
}
