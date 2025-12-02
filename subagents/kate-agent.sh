#!/bin/bash
# Jules Subagent: The Code Specialist (KATE Coder Pro)
# "I speak the language of machines with elegance."

echo "Awakening KATE - The Code Specialist..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep OPENROUTER_API_KEY | xargs)
fi

# Validate API key exists
if [ -z "$OPENROUTER_API_KEY" ]; then
  echo "❌ ERROR: OPENROUTER_API_KEY not found in environment"
  echo "Please add it to .env.local or export it manually"
  exit 1
fi

echo "✅ KATE is ready to code..."
echo "Model: kat-coder-pro:free"
echo "Specialty: Code generation, debugging, optimization"

# Start an interactive agent session
# This simulates an MCP-like interface using OpenRouter's chat completions
node -e "
const https = require('https');

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'kat-coder-pro:free';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

console.log('\\n🤖 KATE Agent Running (Press Ctrl+C to exit)\\n');
console.log('Available commands:');
console.log('  - Type your coding question or task');
console.log('  - Type \"exit\" to quit\\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'KATE> '
});

rl.prompt();

rl.on('line', async (line) => {
  const input = line.trim();
  
  if (input === 'exit' || input === 'quit') {
    console.log('\\nKATE signing off. Happy coding! 👋');
    process.exit(0);
  }
  
  if (!input) {
    rl.prompt();
    return;
  }
  
  // Call OpenRouter API
  const payload = JSON.stringify({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are KATE, an expert coding assistant specialized in code generation, debugging, and optimization. Provide concise, production-ready code with clear explanations.'
      },
      {
        role: 'user',
        content: input
      }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });
  
  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY,
      'HTTP-Referer': 'https://piata-ai.ro',
      'X-Title': 'Jules KATE Agent'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const content = response.choices[0]?.message?.content || 'No response';
        console.log('\\n' + content + '\\n');
      } catch (e) {
        console.error('Error parsing response:', e.message);
      }
      rl.prompt();
    });
  });
  
  req.on('error', (e) => {
    console.error('Request error:', e.message);
    rl.prompt();
  });
  
  req.write(payload);
  req.end();
});

rl.on('close', () => {
  console.log('\\nKATE signing off. Happy coding! 👋');
  process.exit(0);
});
"
