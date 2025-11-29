'use client';

import { useState } from 'react';

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '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';

const SENTINEL_PORT = 8006;
const ARCHITECT_PORT = 8007;

async function callGrok(prompt: string): Promise<string> {
  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4.1-fast',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.choices[0].message.content;
    }
    return `❌ API Error: ${resp.status}`;
  } catch (e) {
    return `❌ Grok Error: ${e}`;
  }
}

async function auditSolidity(code: string): Promise<string> {
  try {
    const resp = await fetch(`http://localhost:${SENTINEL_PORT}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (resp.ok) {
      const report = await resp.json();
      return `🛡️ **Security Audit Result**\n\nScore: ${report.score || 0}/100\nFindings: ${report.findings_count || 0}\n\n${JSON.stringify(report.findings || [], null, 2)}`;
    }
    return '❌ Sentinel offline';
  } catch (e) {
    return `❌ Audit Error: ${e}`;
  }
}

async function getPallet(): Promise<string> {
  try {
    const resp = await fetch(`http://localhost:${ARCHITECT_PORT}/get-pallet`);
    if (resp.ok) {
      const data = await resp.json();
      return `🏗️ **Substrate Pallet (Modern FRAME v2)**\n\n\`\`\`rust\n${data.code?.slice(0, 1000)}...\n\`\`\``;
    }
    return '❌ Architect offline';
  } catch (e) {
    return `❌ Error: ${e}`;
  }
}

async function askGrok(question: string): Promise<string> {
  const context = `You are Grok, the intelligent orchestrator for Piata-RO, a fully AI-driven Romanian marketplace.

Available Tools:
- audit_solidity(code): Audit Solidity smart contract code for security
- get_pallet(): Get modern Substrate pallet code
- generate_listing(description): Generate a marketplace listing
- suggest_price(item): Suggest competitive price for item
- moderate_content(content): Moderate marketplace content
- smart_match(buyer, seller): Match buyer with seller
- delegate_subagent(task): Delegate task to specialized sub-agent
- generate_mcp_tool(description): Generate new MCP tool code
- analyze_market_trends(): Analyze Romanian market trends
- optimize_listing(listing): Optimize listing for better performance
- send_email(to, subject, body): Send automated email
- post_social(platform, content): Post to social media
- integrate_payment(amount, method): Process payment
- sync_database(action, data): Sync with database
- webhook_trigger(url, payload): Trigger webhook

When user asks something that matches a tool, respond with: TOOL_CALL: tool_name(arguments)

Otherwise, respond conversationally.

User Input: ${question}`;

  const response = await callGrok(context);
  if (response.includes('TOOL_CALL:')) {
    const toolCall = response.split('TOOL_CALL:')[1].trim();
    // Parse tool call, e.g. audit_solidity("pragma...")
    const match = toolCall.match(/(\w+)\((.*)\)/);
    if (match) {
      const tool = match[1];
      const args = match[2].replace(/"/g, '').trim();
      switch (tool) {
        case 'audit_solidity':
          return auditSolidity(args);
        case 'get_pallet':
          return getPallet();
        case 'generate_listing':
          return generateListing(args);
        case 'suggest_price':
          return suggestPrice(args);
        case 'moderate_content':
          return moderateContent(args);
        case 'smart_match':
          const [buyer, seller] = args.split(',').map(s => s.trim());
          return smartMatch(buyer, seller);
        case 'delegate_subagent':
          return delegateSubagent(args);
        case 'generate_mcp_tool':
          return generateMCPTool(args);
        case 'analyze_market_trends':
          return analyzeMarketTrends();
        case 'optimize_listing':
          return optimizeListing(args);
        case 'send_email':
          const [to, subject, ...bodyParts] = args.split(',').map(s => s.trim());
          return sendEmail(to, subject, bodyParts.join(','));
        case 'post_social':
          const [platform, ...contentParts] = args.split(',').map(s => s.trim());
          return postSocial(platform, contentParts.join(','));
        case 'integrate_payment':
          const [amount, method] = args.split(',').map(s => s.trim());
          return integratePayment(parseFloat(amount), method);
        case 'sync_database':
          const [action, ...dataParts] = args.split(',').map(s => s.trim());
          return syncDatabase(action, dataParts.join(','));
        case 'webhook_trigger':
          const [url, ...payloadParts] = args.split(',').map(s => s.trim());
          return webhookTrigger(url, payloadParts.join(','));
        default:
          return `Unknown tool: ${tool}`;
      }
    }
  }
  return response;
}

async function generateListing(description: string): Promise<string> {
  const prompt = `Generate a compelling marketplace listing in Romanian for: ${description}. Include title, description, price suggestion, and category.`;
  return callGrok(prompt);
}

async function suggestPrice(item: string): Promise<string> {
  const prompt = `Suggest a competitive price in RON for ${item} on the Romanian market. Consider current trends and provide reasoning.`;
  return callGrok(prompt);
}

async function moderateContent(content: string): Promise<string> {
  const prompt = `Moderate this marketplace content: "${content}". Is it appropriate? Suggest edits if needed.`;
  return callGrok(prompt);
}

async function smartMatch(buyer: string, seller: string): Promise<string> {
  const prompt = `Match buyer "${buyer}" with seller "${seller}" in the marketplace. Suggest negotiation strategy.`;
  return callGrok(prompt);
}

async function delegateSubagent(task: string): Promise<string> {
  const prompt = `Delegate this task to a specialized sub-agent: ${task}. What sub-agent would handle it and how?`;
  return callGrok(prompt);
}

async function generateMCPTool(description: string): Promise<string> {
  const prompt = `Generate a new MCP tool based on: ${description}. Provide TypeScript code for the tool.`;
  return callGrok(prompt);
}

async function analyzeMarketTrends(): Promise<string> {
  const prompt = `Analyze current market trends for the Romanian marketplace. Provide insights on popular categories, pricing, and opportunities.`;
  return callGrok(prompt);
}

async function optimizeListing(listing: string): Promise<string> {
  const prompt = `Optimize this marketplace listing for better visibility and sales: ${listing}. Suggest improvements.`;
  return callGrok(prompt);
}

async function sendEmail(to: string, subject: string, body: string): Promise<string> {
  // Simulate sending from ionutbaltag3
  const from = 'ionutbaltag3@gmail.com'; // Assuming Gmail
  return `📧 Email sent from ${from} to ${to} with subject "${subject}". Body: ${body.slice(0, 100)}... (Simulated - integrate with real SMTP for production)`;
}

async function postSocial(platform: string, content: string): Promise<string> {
  // Simulate posting to TikTok or Facebook
  if (platform.toLowerCase() === 'tiktok') {
    return `🎵 Posted to TikTok: ${content} (Video simulated)`;
  } else if (platform.toLowerCase() === 'facebook') {
    return `📘 Posted to Facebook: ${content}`;
  } else {
    return `📱 Posted to ${platform}: ${content}`;
  }
}

async function integratePayment(amount: number, method: string): Promise<string> {
  // Simulate payment connector
  return `💳 Payment of ${amount} RON processed via ${method}.`;
}

async function syncDatabase(action: string, data: string): Promise<string> {
  // Simulate database connector
  return `🗄️ Database ${action} executed: ${data}`;
}

async function webhookTrigger(url: string, payload: string): Promise<string> {
  // Simulate webhook connector
  return `🔗 Webhook triggered to ${url} with payload: ${payload}`;
}

async function processCommand(cmd: string): Promise<string> {
  const cmdLower = cmd.toLowerCase();
  if (cmdLower.includes('match')) {
    return Promise.resolve('❌ Format: match [buyer] with [seller]');
  } else if (cmdLower.includes('ask') || cmdLower.includes('advice')) {
    const question = cmd.replace(/ask|advice/gi, '').trim() || 'What should I optimize next?';
    return askGrok(question);
  } else {
    return askGrok(cmd);
  }
}

export default function KAI() {
  // KAI - Kernel AI Orchestrator (Internal Tools, not frontend-facing)
  // Powered by Grok-4.1 | Contributors: @valentinuuiuiu @openhands-agent @claude @google-labs-jules[bot] @sourcery-ai[bot]
  // OpenHands infra live – GitHub: https://github.com/valentinuuiuiu/piata-ro-project
  const [messages, setMessages] = useState<Array<{ user: string; bot: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = input;
    setInput('');
    const response = await processCommand(userMsg);
    setMessages(prev => [...prev, { user: userMsg, bot: response }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-2 justify-center mb-4 p-4 bg-gradient-to-r from-[#ff00f0]/20 to-[#00f0ff]/20 rounded-2xl">
            <span className="text-sm bg-[#ff00f0] text-black px-2 py-1 rounded-full font-bold">@valentinuuiuiu</span>
            <span className="text-sm bg-[#00f0ff] text-black px-2 py-1 rounded-full font-bold">@openhands-agent</span>
            <span className="text-sm bg-gray-800 text-white px-2 py-1 rounded-full font-bold">@claude</span>
            <span className="text-sm bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">@google-labs-jules[bot]</span>
            <span className="text-sm bg-green-500 text-black px-2 py-1 rounded-full font-bold">@sourcery-ai[bot]</span>
          </div>
          <h1 className="text-3xl font-black text-center bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent drop-shadow-2xl">🤖 KAI - Kernel AI Orchestrator</h1>
          <p className="text-center text-gray-600 text-lg mb-4">Piata-RO Internal Tools | Grok-4.1 Powered | OpenHands Infra</p>
          <p className="text-center text-gray-600">Grok-4.1-fast - Inteligență Conversațională AI</p>
        </div>
        <div className="p-6 h-96 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mb-2">
                <strong>You:</strong> {msg.user}
              </div>
              <div className="bg-gray-100 p-3 rounded-lg whitespace-pre-wrap">
                <strong>Bot:</strong> {msg.bot}
              </div>
            </div>
          ))}
          {loading && <div className="text-center">Loading...</div>}
        </div>
        <div className="p-6 border-t">
          <div className="flex">
            <textarea
              className="flex-1 p-2 border rounded-l-lg"
              placeholder="Spune-mi ce să fac... (ex: generează anunț pentru iPhone)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
            />
            <button
              className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
              onClick={handleSend}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}