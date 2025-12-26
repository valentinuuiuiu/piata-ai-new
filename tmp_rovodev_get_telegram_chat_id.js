#!/usr/bin/env node

// Reads TELEGRAM_BOT_TOKEN from .env (without requiring dotenv dependency)
// and prints latest chat_id from getUpdates.

const fs = require('fs');

function readEnvValue(key) {
  try {
    const envText = fs.readFileSync('.env', 'utf8');
    const line = envText.split(/\r?\n/).find(l => l.startsWith(`${key}=`));
    if (!line) return null;
    return line.slice(key.length + 1).trim();
  } catch {
    return null;
  }
}

(async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN || readEnvValue('TELEGRAM_BOT_TOKEN');
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not found in environment or .env');
    process.exit(1);
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = await res.json();
  if (!data.ok) {
    console.error('Telegram error:', data);
    process.exit(1);
  }

  const updates = data.result || [];
  console.log('updates:', updates.length);
  const last = updates[updates.length - 1];
  const chatId = last?.message?.chat?.id ?? last?.callback_query?.message?.chat?.id;
  const from = last?.message?.from;
  console.log('last_update_id:', last?.update_id);
  console.log('chat_id:', chatId);
  console.log('from:', from ? { id: from.id, username: from.username, first_name: from.first_name, last_name: from.last_name } : null);
  console.log('text:', last?.message?.text);
})();
