/**
 * AI provider wrapper
 * Supports local Balog/TOON endpoint and OpenRouter fallback
 */

import { AUTOMATION_PROMPTS } from './automation-engine';

const OPENROUTER_API_BASE = process.env.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const LOCAL_BALOG_URL = process.env.LOCAL_BALOG_URL; // e.g. http://localhost:8080/v1
const LOCAL_BALOG_MODEL = process.env.LOCAL_BALOG_MODEL || 'balog';

function simpleTemplate(tpl: string, data: Record<string, any>): string {
  return tpl.replace(/\{([^}]+)\}/g, (_m, key) => {
    const val = data[key.trim()];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  });
}

export async function runPrompt(promptType: string, data: Record<string, any> = {}) {
  // Use the predefined templates if available
  const promptTemplate = (AUTOMATION_PROMPTS as any)[promptType.toUpperCase()] || data.prompt || '';
  const prompt = simpleTemplate(promptTemplate || '', data);

  // Choose provider: local Balog -> OpenRouter
  if (LOCAL_BALOG_URL) {
    try {
      const url = `${LOCAL_BALOG_URL.replace(/\/+$/, '')}/v1/generate`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: LOCAL_BALOG_MODEL, prompt, max_tokens: 1024 })
      });

      if (!resp.ok) throw new Error(`Local Balog error ${resp.status}: ${await resp.text()}`);
      const json = await resp.json();

      // Local response shape varies; attempt to return text or structured result
      if (json?.output) return json.output;
      if (json?.text) return json.text;
      return json;
    } catch (err) {
      console.error('Local Balog call failed:', err);
      // fallback to OpenRouter if configured
    }
  }

  if (OPENROUTER_API_KEY) {
    try {
      const url = `${OPENROUTER_API_BASE}/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 1024 })
      });

      if (!response.ok) throw new Error(`OpenRouter error ${response.status}: ${await response.text()}`);
      const payload = await response.json();

      // OpenRouter / Chat-like responses may embed text in choices
      if (payload?.choices && Array.isArray(payload.choices) && payload.choices[0]) {
        return payload.choices.map((c: any) => c.message?.content || c.text).join('\n');
      }

      if (payload?.output) return payload.output;

      return payload;
    } catch (err) {
      console.error('OpenRouter call failed:', err);
      throw err;
    }
  }

  // No provider configured — return placeholder
  return { error: 'No AI provider configured (set LOCAL_BALOG_URL or OPENROUTER_API_KEY)' };
}

export default {
  runPrompt
};
