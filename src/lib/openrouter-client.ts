export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
export const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

export async function openRouterFetch(url: string, opts: RequestInit = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, ...opts });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if ((err as any)?.name === 'AbortError') {
      const e: any = new Error('OpenRouter request timed out');
      e.code = 'ETIMEDOUT';
      throw e;
    }
    throw err;
  }
}
