import { NextRequest, NextResponse } from 'next/server';
import {
  detectWorkflowTrigger,
  executeRelayChain,
  getSystemPrompt,
  selectBestLLM,
  LLM_PROVIDERS
} from '@/lib/relay-kai-integration';
import { chainlinkAgent } from '@/lib/chainlink-integration';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const KAI_SECRET_KEY = process.env.KAI_SECRET_KEY;

export async function POST(req: NextRequest) {
  // KAI ROUTE PROTECTION - Only authorized access
  if (!KAI_SECRET_KEY) {
    return NextResponse.json({
      error: 'KAI_SECRET_KEY environment variable not configured.'
    }, { status: 500 });
  }

  const authHeader = req.headers.get('x-kai-auth');
  if (authHeader !== KAI_SECRET_KEY) {
    return NextResponse.json({
      error: 'KAI route is protected. Use PAI for public access.'
    }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { message, model } = body;

    // Input validation
    if (!message || typeof message !== 'string' || message.length > 10000) {
      return NextResponse.json({
        error: 'Invalid message: must be string, max 10000 characters'
      }, { status: 400 });
    }

    if (model && typeof model !== 'string') {
      return NextResponse.json({
        error: 'Invalid model: must be string'
      }, { status: 400 });
    }

    // Detect if message triggers a workflow
    const detectedWorkflow = detectWorkflowTrigger(message);

    // Check if ChainLink query
    const chainlinkKeywords = ['chainlink', 'oracle', 'price feed', 'vrf', 'ron/usd', 'eth/usd'];
    const isChainLinkQuery = chainlinkKeywords.some(kw => message.toLowerCase().includes(kw));

    // Handle ChainLink queries with learning agent
    if (isChainLinkQuery) {
      try {
        // Check if asking for price
        if (message.toLowerCase().includes('price') || message.toLowerCase().includes('ron/usd')) {
          const priceData = await chainlinkAgent.getPriceData('RON/USD');
          return NextResponse.json({
            reply: `🔗 ChainLink Oracle Data:

Pair: ${priceData.pair}
Price: ${priceData.price}
Decimals: ${priceData.decimals}
Timestamp: ${priceData.timestamp}
Source: ${priceData.source}

This is REAL data from ChainLink network (via CRE CLI)!`,
            isComplex: true,
            chainlink: true,
            data: priceData,
            model: 'chainlink-agent'
          });
        } else {
          // Ask learning agent
          const answer = await chainlinkAgent.askQuestion(message);
          return NextResponse.json({
            reply: `🔗 ChainLink Specialist: ${answer}`,
            isComplex: true,
            chainlink: true,
            model: 'chainlink-learning-agent'
          });
        }
      } catch (error) {
        console.error('ChainLink agent error:', error);
        // Fall through to normal LLM processing
      }
    }

    // KAI Backend: Check complexity + workflow detection
    const complexKeywords = ['listing', 'pallet', 'scrape', 'workflow', 'blockchain', 'match', 'audit', '/relay'];
    const isComplex = complexKeywords.some(kw => message.toLowerCase().includes(kw)) || !!detectedWorkflow || isChainLinkQuery;

    // If workflow detected, execute relay chain
    if (detectedWorkflow) {
      const relayResult = await executeRelayChain(detectedWorkflow, { userMessage: message });

      return NextResponse.json({
        reply: formatWorkflowResult(relayResult, detectedWorkflow),
        isComplex: true,
        workflow: detectedWorkflow,
        relayChain: relayResult,
        model: model || 'workflow-executor'
      });
    }

    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(isComplex, detectedWorkflow || undefined);

    // Multi-LLM fallback: Try models in priority order
    const selectedModel = selectBestLLM(model);
    const failedModels: string[] = [];

    // Retry with fallback models on rate limit
    let lastError = null;
    let currentModel = selectedModel;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://piata-ro.vercel.app',
            'X-Title': 'KAI Backend - PAI Proxy + Relay Chain',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 1200,
            temperature: 0.6,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();

          // Rate limit detected - try next model
          if (response.status === 429) {
            failedModels.push(currentModel);
            currentModel = selectBestLLM(undefined, failedModels);
            continue;
          }

          throw new Error(`OpenRouter Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || '❌ No response from LLM';

        return NextResponse.json({
          reply,
          isComplex,
          model: currentModel,
          fallbackUsed: failedModels.length > 0,
          attemptedModels: [selectedModel, ...failedModels]
        });

      } catch (error) {
        lastError = error;
        failedModels.push(currentModel);
        currentModel = selectBestLLM(undefined, failedModels);

        if (attempt === 2) {
          // All models failed
          throw error;
        }
      }
    }

    throw lastError;

  } catch (error) {
    console.error('KAI API Error:', error); // Log for debugging but don't expose

    return NextResponse.json({
      error: 'Internal server error',
      reply: '❌ KAI Backend: Service temporarily unavailable. Please try again later.',
      isComplex: false
    }, { status: 500 });
  }
}

// Helper function to format workflow execution results
function formatWorkflowResult(relayResult: any, workflowName: string): string {
  if (!relayResult.success) {
    return `❌ Workflow "${workflowName}" failed at step ${relayResult.steps_completed}

Error: ${relayResult.error}

Steps completed:
${relayResult.results.map((r: any, i: number) => `${i + 1}. ${r.description} - ${r.success ? '✅' : '❌'}`).join('\n')}`;
  }

  return `🎉 Workflow "${workflowName}" completed successfully!

📋 Steps executed: ${relayResult.steps_completed}
${relayResult.blockchain_recorded ? '⛓️ Recorded on blockchain' : ''}

Results:
${relayResult.results.map((r: any, i: number) => {
  const emoji = r.requires_llm ? '🤖' : '✅';
  return `${i + 1}. ${emoji} ${r.description} (${r.agent})`;
}).join('\n')}

${relayResult.results.some((r: any) => r.requires_llm) ? '\n🔥 KAEL-3025 active for complex steps' : ''}`;
}
