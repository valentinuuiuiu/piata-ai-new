export type TelegramSendMessage = {
  chat_id: string | number;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
};

export async function telegramRequest<T = any>(method: string, body?: any): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API error (${method}): ${data.description || 'unknown error'}`);
  }
  return data.result as T;
}

export async function telegramSendMessage(payload: TelegramSendMessage) {
  return telegramRequest('sendMessage', {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    ...payload,
  });
}

export async function telegramGetUpdates(offset?: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

  const url = new URL(`https://api.telegram.org/bot${token}/getUpdates`);
  if (offset) url.searchParams.set('offset', String(offset));

  const res = await fetch(url.toString(), { method: 'GET' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Telegram getUpdates failed');
  return data.result as any[];
}

export async function resolveAdminChatId(): Promise<string | number> {
  // Preferred: explicit env var
  const configured = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (configured) return configured;

  // Fallback: infer from latest update
  const updates = await telegramGetUpdates();
  const last = updates?.[updates.length - 1];
  const chatId = last?.message?.chat?.id ?? last?.callback_query?.message?.chat?.id;
  if (!chatId) {
    throw new Error(
      'TELEGRAM_ADMIN_CHAT_ID is not set and no updates found. Send /start to the bot, then retry.'
    );
  }
  return chatId;
}
