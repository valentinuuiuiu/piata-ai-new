#!/usr/bin/env npx tsx
/**
 * Telegram Human-in-the-Loop (HITL) System
 * Allows human oversight and intervention in automated processes
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8361998278:AAEcALVmGl2o4vn7x99sThxa7lP_FAE7Kns';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: any;
}

interface HITLRequest {
  id: string;
  type: 'approval' | 'decision' | 'input' | 'alert';
  title: string;
  description: string;
  options?: string[];
  metadata?: any;
}

class TelegramHITL {
  private botToken: string;
  private apiUrl: string;
  private pendingRequests: Map<string, HITLRequest>;

  constructor(botToken: string) {
    this.botToken = botToken;
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
    this.pendingRequests = new Map();
  }

  /**
   * Test Telegram bot connection
   */
  async testConnection() {
    console.log('🤖 Testing Telegram Bot Connection...\n');

    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      const data = await response.json();

      if (data.ok) {
        console.log('✅ Bot Connected!');
        console.log(`   Bot Name: ${data.result.first_name}`);
        console.log(`   Username: @${data.result.username}`);
        console.log(`   Bot ID: ${data.result.id}\n`);
        return { success: true, bot: data.result };
      } else {
        console.log('❌ Bot Connection Failed');
        console.log(`   Error: ${data.description}\n`);
        return { success: false, error: data.description };
      }
    } catch (error: any) {
      console.log('❌ Connection Error:', error.message, '\n');
      return { success: false, error: error.message };
    }
  }

  /**
   * Get bot updates (messages)
   */
  async getUpdates(offset?: number) {
    try {
      const url = offset 
        ? `${this.apiUrl}/getUpdates?offset=${offset}`
        : `${this.apiUrl}/getUpdates`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok) {
        return { success: true, updates: data.result };
      } else {
        return { success: false, error: data.description };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send message to Telegram chat
   */
  async sendMessage(chatId: string | number, text: string, options?: any) {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          ...options
        })
      });

      const data = await response.json();
      return data.ok ? { success: true, message: data.result } : { success: false, error: data.description };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Request human approval for an action
   */
  async requestApproval(chatId: string | number, request: HITLRequest) {
    const message = `
🔔 *Approval Required*

*${request.title}*
${request.description}

*Request ID:* \`${request.id}\`
*Type:* ${request.type}

Please review and respond with:
✅ \`/approve ${request.id}\`
❌ \`/reject ${request.id}\`
`;

    this.pendingRequests.set(request.id, request);
    return await this.sendMessage(chatId, message);
  }

  /**
   * Request human decision with options
   */
  async requestDecision(chatId: string | number, request: HITLRequest) {
    let message = `
🤔 *Decision Required*

*${request.title}*
${request.description}

*Request ID:* \`${request.id}\`
`;

    if (request.options && request.options.length > 0) {
      message += '\n*Options:*\n';
      request.options.forEach((option, idx) => {
        message += `${idx + 1}. ${option}\n`;
      });
      message += `\nRespond with: \`/decide ${request.id} [option_number]\``;
    }

    this.pendingRequests.set(request.id, request);
    return await this.sendMessage(chatId, message);
  }

  /**
   * Send alert notification
   */
  async sendAlert(chatId: string | number, title: string, description: string, severity: 'info' | 'warning' | 'error' = 'info') {
    const emoji = severity === 'error' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
    
    const message = `
${emoji} *${title}*

${description}

*Time:* ${new Date().toLocaleString()}
*Severity:* ${severity.toUpperCase()}
`;

    return await this.sendMessage(chatId, message);
  }

  /**
   * Request human input
   */
  async requestInput(chatId: string | number, request: HITLRequest) {
    const message = `
💬 *Input Required*

*${request.title}*
${request.description}

*Request ID:* \`${request.id}\`

Please respond with: \`/input ${request.id} [your input]\`
`;

    this.pendingRequests.set(request.id, request);
    return await this.sendMessage(chatId, message);
  }

  /**
   * Get chat ID from updates (for initial setup)
   */
  async getChatId() {
    console.log('📱 Getting Chat ID...\n');
    console.log('Please send any message to the bot and wait...\n');

    const updates = await this.getUpdates();
    if (updates.success && updates.updates.length > 0) {
      const latestUpdate = updates.updates[updates.updates.length - 1];
      const chatId = latestUpdate.message?.chat?.id;
      
      if (chatId) {
        console.log(`✅ Chat ID Found: ${chatId}`);
        console.log(`   From: ${latestUpdate.message.from.first_name}\n`);
        return { success: true, chatId };
      }
    }

    console.log('⚠️  No messages found. Send a message to the bot first.\n');
    return { success: false };
  }
}

// Demo and test
async function demoTelegramHITL() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     TELEGRAM HUMAN-IN-THE-LOOP SYSTEM - DEMO        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const hitl = new TelegramHITL(TELEGRAM_BOT_TOKEN);

  // Test connection
  const connectionTest = await hitl.testConnection();
  if (!connectionTest.success) {
    console.log('❌ Cannot proceed without bot connection.\n');
    return;
  }

  // Get chat ID
  const chatIdResult = await hitl.getChatId();
  if (!chatIdResult.success || !chatIdResult.chatId) {
    console.log('❌ No chat ID available. Send a message to the bot first.\n');
    console.log('Instructions:');
    console.log(`1. Open Telegram`);
    console.log(`2. Search for bot: @${connectionTest.bot.username}`);
    console.log(`3. Send /start or any message`);
    console.log(`4. Run this script again\n`);
    return;
  }

  const chatId = chatIdResult.chatId;

  console.log('═══════════════════════════════════════════════════════');
  console.log('DEMO: Sending Test Messages');
  console.log('═══════════════════════════════════════════════════════\n');

  // Demo 1: Send alert
  console.log('📤 Sending test alert...');
  await hitl.sendAlert(
    chatId,
    'System Health Check',
    'All systems operational. N8N workflows active, database connected.',
    'info'
  );
  console.log('   ✅ Alert sent\n');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Demo 2: Request approval
  console.log('📤 Sending approval request...');
  await hitl.requestApproval(chatId, {
    id: 'test-approval-001',
    type: 'approval',
    title: 'Auto-Post Blog Article',
    description: 'AI generated a blog post about marketplace trends. Review at: https://piata-ai.vercel.app/blog/draft-123',
    metadata: { article_id: 'draft-123' }
  });
  console.log('   ✅ Approval request sent\n');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Demo 3: Request decision
  console.log('📤 Sending decision request...');
  await hitl.requestDecision(chatId, {
    id: 'test-decision-001',
    type: 'decision',
    title: 'Email Campaign Timing',
    description: 'When should we send the re-engagement email campaign to 150 inactive users?',
    options: [
      'Send now',
      'Send in 1 hour',
      'Send tomorrow at 10 AM',
      'Cancel campaign'
    ]
  });
  console.log('   ✅ Decision request sent\n');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Demo 4: Request input
  console.log('📤 Sending input request...');
  await hitl.requestInput(chatId, {
    id: 'test-input-001',
    type: 'input',
    title: 'Blog Post Title',
    description: 'Please provide a better title for the AI-generated blog post about "Top 10 Tips for Selling Online"'
  });
  console.log('   ✅ Input request sent\n');

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ DEMO COMPLETE!');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Check your Telegram for 4 test messages:');
  console.log('1. ℹ️  System health alert');
  console.log('2. 🔔 Approval request for blog post');
  console.log('3. 🤔 Decision request for email timing');
  console.log('4. 💬 Input request for blog title\n');

  console.log('💡 Integration Examples:\n');
  console.log('```typescript');
  console.log('// In automation scripts:');
  console.log('const hitl = new TelegramHITL(TELEGRAM_BOT_TOKEN);');
  console.log('');
  console.log('// Before posting blog');
  console.log('await hitl.requestApproval(chatId, {');
  console.log('  id: `blog-${blogId}`,');
  console.log('  type: "approval",');
  console.log('  title: "Review Blog Post",');
  console.log('  description: blogContent');
  console.log('});');
  console.log('');
  console.log('// On system errors');
  console.log('await hitl.sendAlert(chatId, "Critical Error", errorMsg, "error");');
  console.log('```\n');
}

// Run demo
demoTelegramHITL().catch(console.error);

// Export for use in other scripts
export { TelegramHITL };
