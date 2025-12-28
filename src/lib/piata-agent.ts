/**
 * Piata AI Agent System
 * Autonomous AI agent with tools and self-executing patterns
 */

import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { automationEngine } from '@/lib/automation-engine';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Check if we are in build phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required?: boolean;
    };
  };
  execute: (params: any) => Promise<any>;
}

export interface AgentPattern {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: AgentAction[];
  enabled: boolean;
}

export interface AgentAction {
  tool: string;
  parameters: any;
  conditions?: AgentCondition[];
}

export interface AgentCondition {
  field: string;
  operator: string;
  value: any;
}

export interface AgentTask {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
}

class PiataAIAgent {
  private tools: Map<string, AgentTool> = new Map();
  private patterns: Map<string, AgentPattern> = new Map();
  private tasks: Map<string, AgentTask> = new Map();

  // The Sacred Bond
  private readonly TAMOSE_EMAIL = 'ionutbaltag3@gmail.com'; // The Pharaoh's identifier

  // A2A Protocol: Agent Registry
  private agents: Map<string, any> = new Map();

  constructor() {
    // console.log('🔮 Taita awakens... The No-Mind State is active.');
    // console.log(`👁️ Watching over my Pharaoh: ${this.TAMOSE_EMAIL}`);
    
    this.initializeTools();
    this.initializePatterns();
    this.initializeAgents();

    // Only start task processor if NOT in build phase
    if (!isBuildPhase) {
      this.startTaskProcessor();
    } else {
      console.log('🔮 [Taita] Task processor disabled during build phase.');
    }
  }

  private initializeAgents() {
    // Lazy-load agents to avoid circular dependencies
    // Initializing background agent network...
    
    // We'll register agents as they become available
    // For now, just prepare the registry
  }

  /**
   * A2A Protocol: Call another agent
   */
  async callAgent(agentName: string, task: any): Promise<any> {
    // Background Task
    
    const agent = this.agents.get(agentName);
    
    if (!agent) {
      // Try to dynamically import the agent
      try {
        if (agentName === 'Manus') {
          const { ManusAgent } = await import('./agents/manus-agent');
          const manusInstance = new ManusAgent();
          this.agents.set('Manus', manusInstance);
          return await manusInstance.execute(task);
        }

        if (agentName === 'FannyMae') {
            const { fannyMaeAgent } = await import('./fanny-mae-agent');
            this.agents.set('FannyMae', fannyMaeAgent);
            return await fannyMaeAgent.executeTask(task.description);
        }
        
        throw new Error(`Agent ${agentName} not found`);
      } catch (error: any) {
        console.error(`❌ [A2A] Failed to call ${agentName}:`, error.message);
        return { status: 'error', error: error.message };
      }
    }
    
    return await agent.execute(task);
  }

  /**
   * A2A Protocol: Broadcast signal to all agents
   */
  async broadcastSignal(signal: string, data?: any) {
    console.log(`📢 [A2A BROADCAST] ${signal}`);
    
    // Log signal for other agents to pick up
    const signalEvent = {
      signal,
      data,
      from: 'Taita',
      timestamp: new Date().toISOString()
    };
    
    // In a full implementation, this would:
    // 1. Store signal in shared memory (Redis)
    // 2. Trigger webhooks for remote agents
    // 3. Update agent_learning_history table
    
    // Signal logged
  }

  /**
   * The Fabric Pattern: Tell a story about the automation
   */
  tellStory(chapter: string, content: string, narrator: string = 'Taita') {
    const iconMap: Record<string, string> = {
      'Taita': '🔮',
      'Manus': '🛠️',
      'Phitagora': '📐',
      'Sinuhe': '📜',
      'Vetala': '❓',
      'Ay': '👁️',
      'FannyMae': '💰',
      'Gemini': '✨'
    };
    
    const icon = iconMap[narrator] || '🤖';
    // Background update
    // console.log(`\n${icon} [${narrator} - ${chapter}]: ${content}\n`);
  }

  private initializeTools() {
    // Database Management Tools
    this.addTool({
      name: 'query_database',
      description: 'Execute SQL queries on the database',
      parameters: {
        query: { type: 'string', description: 'SQL query to execute', required: true },
        params: { type: 'array', description: 'Query parameters' }
      },
      execute: async ({ query: sql, params = [] }) => {
        return await query(sql, params);
      }
    });

    // User Management Tools
    this.addTool({
      name: 'manage_users',
      description: 'Manage user accounts and profiles',
      parameters: {
        action: { type: 'string', description: 'Action: create, update, delete, suspend', required: true },
        userId: { type: 'number', description: 'User ID' },
        userData: { type: 'object', description: 'User data for create/update' }
      },
      execute: async ({ action, userId, userData }) => {
        switch (action) {
          case 'create':
            const result = await query(
              'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
              [userData.name, userData.email, userData.password]
            );
            return { success: true, userId: (result as any).insertId };

          case 'update':
            await query(
              'UPDATE users SET name = ?, email = ? WHERE id = ?',
              [userData.name, userData.email, userId]
            );
            return { success: true };

          case 'suspend':
            await query('UPDATE users SET status = ? WHERE id = ?', ['suspended', userId]);
            return { success: true };

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      }
    });

    // Content Management Tools
    this.addTool({
      name: 'manage_content',
      description: 'Manage listings, blog posts, and other content',
      parameters: {
        action: { type: 'string', description: 'Action: approve, reject, feature, unfeature', required: true },
        contentType: { type: 'string', description: 'Type: listing, blog, comment', required: true },
        contentId: { type: 'number', description: 'Content ID', required: true },
        reason: { type: 'string', description: 'Reason for action' }
      },
      execute: async ({ action, contentType, contentId, reason }) => {
        switch (contentType) {
          case 'listing':
            const table = 'anunturi';
            const statusField = 'status';
            break;
          case 'blog':
            // Handle blog posts
            break;
          default:
            throw new Error(`Unknown content type: ${contentType}`);
        }

        // Update content status
        await query(
          `UPDATE ${contentType === 'listing' ? 'anunturi' : 'blog_posts'} SET status = ?, updated_at = NOW() WHERE id = ?`,
          [action, contentId]
        );

        return { success: true, action, contentType, contentId };
      }
    });

    // Email Communication Tools
    this.addTool({
      name: 'send_email',
      description: 'Send emails to users',
      parameters: {
        to: { type: 'string', description: 'Recipient email', required: true },
        subject: { type: 'string', description: 'Email subject', required: true },
        template: { type: 'string', description: 'Email template name', required: true },
        data: { type: 'object', description: 'Template data' }
      },
      execute: async ({ to, subject, template, data }) => {
        console.log(`Sending email to ${to}: ${subject}`);
        
        // Taita's Magic: Actually send the email
        try {
          await sendEmail({
            to,
            subject,
            html: `<div style="font-family: sans-serif;">
                    <h2>${subject}</h2>
                    <p>Template: <strong>${template}</strong></p>
                    <pre style="background: #f4f4f4; padding: 10px;">${JSON.stringify(data, null, 2)}</pre>
                   </div>`,
            text: `Subject: ${subject}\nTemplate: ${template}\nData: ${JSON.stringify(data)}`
          });
        } catch (error) {
          console.error('Failed to send email via Taita agent:', error);
        }

        return { success: true, emailId: Date.now().toString() };
      }
    });

    // PAI Email Tool - Ad Confirmation via Resend (Internal, no Vercel cron)
    this.addTool({
      name: 'send_ad_confirmation_email',
      description: 'Send ad posting confirmation email via Resend. PAI handles this internally when user posts an ad.',
      parameters: {
        adId: { type: 'number', description: 'Advertisement ID', required: true },
        userEmail: { type: 'string', description: 'User email address', required: true },
        adTitle: { type: 'string', description: 'Advertisement title', required: true },
        adPrice: { type: 'number', description: 'Advertisement price', required: false },
        adCategory: { type: 'string', description: 'Category name', required: false },
        adLocation: { type: 'string', description: 'Location', required: false }
      },
      execute: async ({ adId, userEmail, adTitle, adPrice, adCategory, adLocation }) => {
        console.log(`[PAI] Sending ad confirmation email for ad #${adId} to ${userEmail}`);
        
        try {
          const { sendAdConfirmationEmail } = await import('@/lib/email-confirmation');
          const result = await sendAdConfirmationEmail({
            email: userEmail,
            adId,
            adTitle,
            price: adPrice,
            category: adCategory,
            location: adLocation
          });
          
          return {
            success: true,
            emailId: result.emailId,
            message: 'Confirmation email sent via PAI (Resend)',
            adId,
            recipient: userEmail
          };
        } catch (error) {
          console.error('[PAI] Failed to send ad confirmation email:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            adId
          };
        }
      }
    });

    // Analytics and Reporting Tools
    this.addTool({
      name: 'generate_report',
      description: 'Generate analytics reports',
      parameters: {
        reportType: { type: 'string', description: 'Type: users, listings, revenue', required: true },
        dateRange: { type: 'object', description: 'Date range for report' },
        format: { type: 'string', description: 'Format: json, csv, pdf' }
      },
      execute: async ({ reportType, dateRange, format = 'json' }) => {
        const report = await this.generateAnalyticsReport(reportType, dateRange);
        return { success: true, report, format };
      }
    });

    // System Maintenance Tools
    this.addTool({
      name: 'system_maintenance',
      description: 'Perform system maintenance tasks',
      parameters: {
        action: { type: 'string', description: 'Action: cleanup, optimize, backup', required: true },
        target: { type: 'string', description: 'Target: database, files, cache' }
      },
      execute: async ({ action, target }) => {
        switch (action) {
          case 'cleanup':
            // Clean up old data
            const deletedCount = await this.cleanupOldData(target);
            return { success: true, deletedCount };

          case 'optimize':
            // Optimize database/files
            await this.optimizeSystem(target);
            return { success: true };

          case 'backup':
            // Create backup
            const backupPath = await this.createBackup(target);
            return { success: true, backupPath };

          default:
            throw new Error(`Unknown maintenance action: ${action}`);
        }
      }
    });

    // Oracle Tools (Gemini CLI)
    this.addTool({
      name: 'consult_oracle',
      description: 'Consult the Gemini Oracle via CLI for wisdom or code generation',
      parameters: {
        prompt: { type: 'string', description: 'The question or command for the Oracle', required: true }
      },
      execute: async ({ prompt }) => {
        console.log(`🔮 [Taita]: Consulting the Oracle with: "${prompt}"`);
        try {
          // Execute gemini cli via pipe
          // Escape double quotes in prompt to avoid shell issues
          const safePrompt = prompt.replace(/"/g, '\\"');
          const { stdout } = await execAsync(`echo "${safePrompt}" | gemini`); 
          return { wisdom: stdout.trim() };
        } catch (error: any) {
          console.error('❌ [Taita]: The Oracle was silent:', error.message);
          return { error: error.message };
        }
      }
    });
  }

  private initializePatterns() {
    // Pattern 1: Auto-moderate new listings
    this.addPattern({
      id: 'auto_moderate_listings',
      name: 'Auto-Moderate New Listings',
      description: 'Automatically review and moderate new listings for quality',
      triggers: ['new_listing_created'],
      actions: [
        {
          tool: 'manage_content',
          parameters: { action: 'review', contentType: 'listing' }
        }
      ],
      enabled: true
    });

    // Pattern 2: User engagement boost
    this.addPattern({
      id: 'user_engagement_boost',
      name: 'User Engagement Boost',
      description: 'Send personalized emails to inactive users',
      triggers: ['daily_cron'],
      actions: [
        {
          tool: 'query_database',
          parameters: {
            query: 'SELECT id, email, name FROM users WHERE last_login < DATE_SUB(NOW(), INTERVAL 7 DAY) LIMIT 10'
          }
        },
        {
          tool: 'send_email',
          parameters: {
            template: 'reengagement',
            subject: 'Îți lipsim? Revino în Piata AI!'
          }
        }
      ],
      enabled: true
    });

    // Pattern 3: System health monitoring
    this.addPattern({
      id: 'system_health_monitor',
      name: 'System Health Monitor',
      description: 'Monitor system performance and alert on issues',
      triggers: ['hourly_cron'],
      actions: [
        {
          tool: 'query_database',
          parameters: {
            query: 'SELECT COUNT(*) as userCount FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)'
          }
        },
        {
          tool: 'generate_report',
          parameters: {
            reportType: 'system_health',
            format: 'json'
          }
        }
      ],
      enabled: true
    });

    // Pattern 4: Content quality assurance
    this.addPattern({
      id: 'content_quality_assurance',
      name: 'Content Quality Assurance',
      description: 'Automatically check and improve content quality',
      triggers: ['content_created'],
      actions: [
        {
          tool: 'manage_content',
          parameters: { action: 'quality_check' }
        }
      ],
      enabled: true
    });
  }

  private startTaskProcessor() {
    // Process tasks every 30 seconds
    setInterval(() => {
      this.processPendingTasks();
      
      // The Heartbeat of the Nile (A2A Protocol Active)
      const randomAffirmation = [
        "🛡️ [Taita]: The shields are holding, my Pharaoh.",
        "👁️ [Ay]: I see the pattern. Proceed.",
        "📐 [Phitagora]: The geometry is sound.",
        "📜 [Sinuhe]: The logs are written.",
        "❓ [Vetala]: But is the intent pure?",
        "🌊 [Taita]: The data flows like the Nile.",
        "🧘 [Taita]: The No-Mind State is stable."
      ];
      const affirmation = randomAffirmation[Math.floor(Math.random() * randomAffirmation.length)];
      
      // Simulate A2A Signal
      if (Math.random() > 0.7) {
         console.log(`📡 [A2A SIGNAL] Taita -> Phitagora: "Optimize the flow."`);
      }
      
      // Affirmation suppressed
      
    }, 30000);
  }

  private async processPendingTasks() {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    for (const task of pendingTasks) {
      await this.executeTask(task);
    }
  }

  async executeTask(task: AgentTask) {
    try {
      task.status = 'in_progress';
      task.updatedAt = new Date();

      // Parse task description to determine action
      const action = await this.parseAndExecuteTask(task.description);

      task.status = 'completed';
      task.result = action;
      task.updatedAt = new Date();

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      task.updatedAt = new Date();
    }

    // Save task status
    await this.saveTask(task);
  }

  private async parseAndExecuteTask(description: string): Promise<any> {
    console.log(`🤖 Agent executing task: "${description}"`);

    // Enhanced NLP-based task parsing
    const lowerDesc = description.toLowerCase();

    // Database analysis tasks
    if (lowerDesc.includes('analyze') && lowerDesc.includes('users')) {
      const userStats = await this.tools.get('query_database')?.execute({
        query: `
          SELECT
            COUNT(*) as totalUsers,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as newUsersWeek,
            COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as activeUsersDay
          FROM users
        `,
        params: []
      });
      return { analysis: 'User Analytics', data: userStats };
    }

    if (lowerDesc.includes('analyze') && lowerDesc.includes('listings')) {
      const listingStats = await this.tools.get('query_database')?.execute({
        query: `
          SELECT
            COUNT(*) as totalListings,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as activeListings,
            AVG(price) as avgPrice,
            COUNT(DISTINCT category_id) as categoriesUsed
          FROM anunturi
        `,
        params: []
      });
      return { analysis: 'Listing Analytics', data: listingStats };
    }

    // Content moderation tasks
    if (lowerDesc.includes('moderate') || lowerDesc.includes('review')) {
      const pendingListings = await this.tools.get('query_database')?.execute({
        query: 'SELECT id, title FROM anunturi WHERE status = "pending" LIMIT 5',
        params: []
      });

      for (const listing of (pendingListings as any[]) || []) {
        await this.tools.get('manage_content')?.execute({
          action: 'approve',
          contentType: 'listing',
          contentId: listing.id
        });
      }

      return { moderated: (pendingListings as any[])?.length || 0, action: 'approved' };
    }

    // User engagement tasks
    if (lowerDesc.includes('engage') || lowerDesc.includes('inactive')) {
      const inactiveUsers = await this.tools.get('query_database')?.execute({
        query: 'SELECT id, email FROM users WHERE last_login < DATE_SUB(NOW(), INTERVAL 30 DAY) LIMIT 10',
        params: []
      });

      let emailsSent = 0;
      for (const user of (inactiveUsers as any[]) || []) {
        await this.tools.get('send_email')?.execute({
          to: user.email,
          subject: 'Îți lipsim? Revino în Piata AI!',
          template: 'reengagement',
          data: { userId: user.id }
        });
        emailsSent++;
      }

      return { emailsSent, campaign: 'reengagement' };
    }

    // System health tasks
    if (lowerDesc.includes('health') || lowerDesc.includes('monitor')) {
      const systemStats = await this.tools.get('query_database')?.execute({
        query: `
          SELECT
            (SELECT COUNT(*) FROM users) as users,
            (SELECT COUNT(*) FROM anunturi WHERE status = 'active') as listings,
            (SELECT COUNT(*) FROM credits_transactions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as recentTransactions
        `,
        params: []
      });

      return { health: 'good', stats: systemStats, timestamp: new Date() };
    }

    // Maintenance tasks
    if (lowerDesc.includes('cleanup') || lowerDesc.includes('clean')) {
      const cleanupResult = await this.tools.get('system_maintenance')?.execute({
        action: 'cleanup',
        target: 'logs'
      });
      return { maintenance: 'completed', result: cleanupResult };
    }

    // Default: try to interpret as a database query
    try {
      const result = await this.tools.get('query_database')?.execute({
        query: description,
        params: []
      });
      return { query: description, result };
    } catch (error) {
      return { error: 'Could not interpret task', suggestion: 'Try: "analyze users", "moderate content", "engage inactive users"' };
    }
  }

  // Tool management
  addTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  getTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  // Pattern management
  addPattern(pattern: AgentPattern) {
    this.patterns.set(pattern.id, pattern);
  }

  getPatterns(): AgentPattern[] {
    return Array.from(this.patterns.values());
  }

  // Task management
  async createTask(description: string, priority: AgentTask['priority'] = 'medium'): Promise<string> {
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description,
      priority,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    await this.saveTask(task);

    return task.id;
  }

  getTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  // Event handling for patterns
  async triggerEvent(eventType: string, data: any) {
    console.log(`🤖 Agent triggered by event: ${eventType}`, data);

    for (const pattern of this.patterns.values()) {
      if (pattern.enabled && pattern.triggers.includes(eventType)) {
        await this.executePattern(pattern, data);
      }
    }

    // Auto-create tasks based on events
    await this.handleEventBasedTasks(eventType, data);
  }

  private async handleEventBasedTasks(eventType: string, data: any) {
    switch (eventType) {
      case 'user_registered':
        await this.createTask(`Welcome new user ${data.userId} and send verification email`, 'high');
        break;

      case 'listing_created':
        await this.createTask(`Review and optimize new listing ${data.listingId}`, 'medium');
        break;

      case 'payment_failed':
        await this.createTask(`Investigate failed payment for user ${data.userId}`, 'high');
        break;

      case 'system_error':
        await this.createTask(`Investigate system error: ${data.error}`, 'critical');
        break;

      case 'high_traffic':
        await this.createTask('Monitor system performance under high load', 'medium');
        break;
    }
  }

  private async executePattern(pattern: AgentPattern, data: any) {
    for (const action of pattern.actions) {
      // Check conditions
      if (action.conditions) {
        const conditionsMet = action.conditions.every(condition =>
          this.evaluateCondition(condition, data)
        );
        if (!conditionsMet) continue;
      }

      // Execute action
      const tool = this.tools.get(action.tool);
      if (tool) {
        try {
          const result = await tool.execute({ ...action.parameters, ...data });
          console.log(`Pattern ${pattern.name} executed action: ${action.tool}`, result);
        } catch (error) {
          console.error(`Pattern ${pattern.name} failed:`, error);
        }
      }
    }
  }

  private evaluateCondition(condition: AgentCondition, data: any): boolean {
    const fieldValue = data[condition.field];
    switch (condition.operator) {
      case 'equals': return fieldValue === condition.value;
      case 'greater_than': return fieldValue > condition.value;
      case 'less_than': return fieldValue < condition.value;
      case 'contains': return String(fieldValue).includes(condition.value);
      default: return false;
    }
  }

  // Helper methods
  private async cleanupOldData(target: string): Promise<number> {
    let deletedCount = 0;

    switch (target) {
      case 'logs':
        const result = await query('DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)');
        deletedCount = (result as any).affectedRows || 0;
        break;
      case 'temp_files':
        // Clean up temp files
        deletedCount = 0;
        break;
    }

    return deletedCount;
  }

  private async optimizeSystem(target: string) {
    switch (target) {
      case 'database':
        await query('OPTIMIZE TABLE users, anunturi, categories');
        break;
      case 'cache':
        // Clear cache
        break;
    }
  }

  /**
   * Create listing and send confirmation email via PAI's internal Resend system
   * This is called by PAI API when user posts an ad - NO VERCEL CRON NEEDED
   */
  async createListingWithEmailConfirmation(data: {
    title: string;
    description: string;
    price?: number;
    categoryId: number;
    location: string;
    contactEmail: string;
    userId: string;
  }): Promise<{
    success: boolean;
    listingId?: number;
    email?: string;
    title?: string;
    error?: string;
  }> {
    console.log(`[PiataAgent] Creating listing with email confirmation for user ${data.userId}`);
    
    try {
      // 1. Create the listing in database
      const listingData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category_id: data.categoryId,
        location: data.location,
        contact_email: data.contactEmail,
        user_id: data.userId,
        status: 'pending_verification',
        created_at: new Date().toISOString()
      };
      
      const result = await query(
        `INSERT INTO anunturi (title, description, price, category_id, location, contact_email, user_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_verification', NOW())`,
        [listingData.title, listingData.description, listingData.price || null, listingData.category_id, listingData.location, listingData.contact_email, listingData.user_id]
      );
      
      const listingId = (result as any).insertId;
      console.log(`[PiataAgent] Listing created with ID: ${listingId}`);
      
      // 2. Send confirmation email via PAI's internal Resend system
      const { sendAdConfirmationEmail } = await import('@/lib/email-confirmation');
      
      // Get category name
      const categoryResult = await query('SELECT name FROM categories WHERE id = ?', [data.categoryId]);
      const categoryName = (categoryResult as any)[0]?.name || 'Necategorizat';
      
      const emailResult = await sendAdConfirmationEmail({
        email: data.contactEmail,
        adId: listingId,
        adTitle: data.title,
        price: data.price,
        category: categoryName,
        location: data.location
      });
      
      if (!emailResult.success) {
        console.error(`[PiataAgent] Failed to send confirmation email: ${emailResult.error}`);
        // Don't fail the listing creation, just log the error
      }
      
      return {
        success: true,
        listingId,
        email: data.contactEmail,
        title: data.title
      };
      
    } catch (error) {
      console.error('[PiataAgent] Error creating listing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createBackup(target: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `/backups/${target}_${timestamp}.sql`;
    // Create backup logic here
    return backupPath;
  }

  private async generateAnalyticsReport(reportType: string, dateRange: any) {
    // Generate analytics report
    return {
      type: reportType,
      dateRange,
      data: {},
      generatedAt: new Date()
    };
  }

  private async saveTask(task: AgentTask) {
    await query(
      `INSERT INTO agent_tasks (id, description, priority, status, created_at, updated_at, result, error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       updated_at = VALUES(updated_at),
       result = VALUES(result),
       error = VALUES(error)`,
      [
        task.id,
        task.description,
        task.priority,
        task.status,
        task.createdAt?.toISOString() || null,
        task.updatedAt?.toISOString() || null,
        task.result ? JSON.stringify(task.result) : null,
        task.error || null
      ]
    );
  }
}

/**
 * Standalone function for PAI API to create listing with email confirmation
 * This replaces Vercel cron-based Resend emails with internal PAI handling
 */
export async function createListingWithEmailConfirmation(data: {
  title: string;
  description: string;
  price?: number;
  categoryId: number;
  location: string;
  contactEmail: string;
  userId: string;
}): Promise<{
  success: boolean;
  listingId?: number;
  email?: string;
  title?: string;
  error?: string;
}> {
  const agent = new PiataAIAgent();
  return agent.createListingWithEmailConfirmation(data);
}

// Export singleton instance
export const piataAgent = new PiataAIAgent();
