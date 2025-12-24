// Email Automation Workflow System
// Integrates with the email marketing system for automated campaigns

import {
  EmailMarketingSystem,
  UserProfile,
  UserSegment,
  TriggerType,
  CampaignType,
} from './email-system';

// Compatibility exports for API routes
import { randomBytes, createHash } from 'node:crypto';
import type { EmailOptions } from './email';
import { sendEmail as sendEmailService } from './email';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerType: TriggerType;
  targetSegment: UserSegment;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  priority: number;
}

interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface AutomationAction {
  type: 'send_email' | 'segment_user' | 'wait' | 'update_field';
  // Some actions (e.g. 'wait') may not require parameters.
  parameters?: Record<string, any>;
  delayMinutes?: number;
}

interface EmailQueueItem {
  id: string;
  userId: string;
  templateId: string;
  scheduledFor: Date;
  priority: 'low' | 'normal' | 'high';
  retryCount: number;
  personalizations: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

export class EmailAutomationEngine {
  // NOTE: This file also exports several helper utilities (token generation, basic email sending)
  // used by API routes under `src/app/api/*`. Keep those exports stable for backwards compatibility.
  private emailSystem: EmailMarketingSystem;
  private automationRules: Map<string, AutomationRule> = new Map();
  private emailQueue: Map<string, EmailQueueItem> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private isRunning: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(emailSystem: EmailMarketingSystem) {
    this.emailSystem = emailSystem;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // Welcome Series Automation Rule
    this.automationRules.set('welcome_series', {
      id: 'welcome_series',
      name: 'Welcome Series Automation',
      description: 'Automated 3-email welcome sequence for new users',
      triggerType: TriggerType.SIGNUP,
      targetSegment: UserSegment.NEW_USERS,
      conditions: [],
      actions: [
        {
          type: 'send_email',
          parameters: { templateId: 'welcome_1' },
          delayMinutes: 0
        },
        {
          type: 'send_email',
          parameters: { templateId: 'welcome_2' },
          delayMinutes: 60 * 24 // 24 hours
        },
        {
          type: 'send_email',
          parameters: { templateId: 'welcome_3' },
          delayMinutes: 60 * 24 * 3 // 3 days
        }
      ],
      isActive: true,
      priority: 1
    });

    // OLX Competitor Targeting Rule
    this.automationRules.set('olx_competitor_targeting', {
      id: 'olx_competitor_targeting',
      name: 'OLX User Migration Campaign',
      description: 'Target users who have previously used OLX with competitive messaging',
      triggerType: TriggerType.SCHEDULED,
      targetSegment: UserSegment.OLX_USERS,
      conditions: [
        {
          field: 'totalSpent',
          operator: 'greater_than',
          value: 0
        }
      ],
      actions: [
        {
          type: 'send_email',
          parameters: { 
            templateId: 'olx_competitor',
            personalizationKey: 'competitor_name',
            personalizationValue: 'OLX'
          }
        }
      ],
      isActive: true,
      priority: 2
    });

    // eMAG Price Comparison Rule
    this.automationRules.set('emag_price_comparison', {
      id: 'emag_price_comparison',
      name: 'eMAG Price Comparison Campaign',
      description: 'Target users with eMAG alternatives based on pricing data',
      triggerType: TriggerType.SCHEDULED,
      targetSegment: UserSegment.EMAG_USERS,
      conditions: [
        {
          field: 'preferences.categories',
          operator: 'contains',
          value: 'electronics'
        }
      ],
      actions: [
        {
          type: 'send_email',
          parameters: { 
            templateId: 'emag_alternative',
            personalizationKey: 'competitor_name',
            personalizationValue: 'eMAG'
          }
        }
      ],
      isActive: true,
      priority: 3
    });

    // Product Category Interest Automation
    this.automationRules.set('product_category_interests', {
      id: 'product_category_interests',
      name: 'Product Category Interest Campaigns',
      description: 'Send category-specific campaigns based on user interests',
      triggerType: TriggerType.SCHEDULED,
      targetSegment: UserSegment.ELECTRONICS_INTERESTED,
      conditions: [
        {
          field: 'interests',
          operator: 'contains',
          value: 'electronics'
        }
      ],
      actions: [
        {
          type: 'send_email',
          parameters: { 
            templateId: 'electronics_campaign',
            personalizationKey: 'category',
            personalizationValue: 'Electronics'
          }
        }
      ],
      isActive: true,
      priority: 4
    });

    // Cart Abandonment Automation Rule
    this.automationRules.set('cart_abandonment', {
      id: 'cart_abandonment',
      name: 'Cart Abandonment Recovery',
      description: 'Recover abandoned carts with personalized offers',
      triggerType: TriggerType.CART_ABANDONMENT,
      targetSegment: UserSegment.NEW_USERS,
      conditions: [
        {
          field: 'cartValue',
          operator: 'greater_than',
          value: 50
        }
      ],
      actions: [
        {
          type: 'wait',
          delayMinutes: 60 * 2 // Wait 2 hours
        },
        {
          type: 'send_email',
          parameters: { 
            templateId: 'cart_abandonment_recovery',
            personalizationKey: 'cartValue',
            personalizationField: 'cartValue'
          }
        }
      ],
      isActive: true,
      priority: 5
    });

    // Re-engagement Automation Rule
    this.automationRules.set('reengagement', {
      id: 'reengagement',
      name: 'Inactive User Re-engagement',
      description: 'Re-engage users who have been inactive for 30+ days',
      triggerType: TriggerType.INACTIVITY,
      targetSegment: UserSegment.INACTIVE_USERS,
      conditions: [
        {
          field: 'lastActivity',
          operator: 'less_than',
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      ],
      actions: [
        {
          type: 'send_email',
          parameters: { 
            templateId: 'reengagement',
            personalizationKey: 'daysSinceActivity',
            personalizationValue: 'calculated'
          }
        }
      ],
      isActive: true,
      priority: 6
    });

    // Loyalty Program Upsell Rule
    this.automationRules.set('loyalty_upsell', {
      id: 'loyalty_upsell',
      name: 'Loyalty Program Upsell',
      description: 'Upsell loyal customers to premium loyalty program',
      triggerType: TriggerType.SCHEDULED,
      targetSegment: UserSegment.LOYAL_CUSTOMERS,
      conditions: [
        {
          field: 'totalSpent',
          operator: 'greater_than',
          value: 500 // 500+ RON spent
        },
        {
          field: 'isActive',
          operator: 'equals',
          value: true
        }
      ],
      actions: [
        {
          type: 'send_email',
          parameters: { 
            templateId: 'loyalty_tier',
            personalizationKey: 'totalSpent',
            personalizationField: 'totalSpent'
          }
        }
      ],
      isActive: true,
      priority: 7
    });
  }

  public startAutomation(): void {
    if (this.isRunning) {
      console.log('Email automation is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Email automation engine started');

    // Process email queue every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processEmailQueue();
      this.processScheduledRules();
    }, 30 * 1000);

    // Clean up completed items every hour
    setInterval(() => {
      this.cleanupCompletedItems();
    }, 60 * 60 * 1000);
  }

  public stopAutomation(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('🛑 Email automation engine stopped');
  }

  private processEmailQueue(): void {
    const now = new Date();
    const pendingEmails = Array.from(this.emailQueue.values())
      .filter(item => 
        item.status === 'pending' && 
        item.scheduledFor <= now &&
        item.retryCount < 3
      );

    // Sort by priority and scheduled time
    pendingEmails.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return a.scheduledFor.getTime() - b.scheduledFor.getTime();
    });

    // Process emails (limit to avoid overwhelming)
    const emailsToProcess = pendingEmails.slice(0, 10);
    
    emailsToProcess.forEach(async (emailItem) => {
      try {
        const success = await this.sendEmail(emailItem);
        if (success) {
          emailItem.status = 'sent';
          this.emailQueue.set(emailItem.id, emailItem);
          console.log(`✅ Email sent: ${emailItem.id}`);
        } else {
          throw new Error('Send failed');
        }
      } catch (error) {
        emailItem.retryCount++;
        if (emailItem.retryCount >= 3) {
          emailItem.status = 'failed';
          console.log(`❌ Email failed after 3 retries: ${emailItem.id}`);
        } else {
          // Exponential backoff for retries
          const backoffMinutes = Math.pow(2, emailItem.retryCount) * 5;
          emailItem.scheduledFor = new Date(Date.now() + backoffMinutes * 60 * 1000);
          console.log(`⚠️ Email retry scheduled in ${backoffMinutes} minutes: ${emailItem.id}`);
        }
      }
    });
  }

  private processScheduledRules(): void {
    const activeRules = Array.from(this.automationRules.values())
      .filter(rule => rule.isActive);

    activeRules.forEach(rule => {
      if (rule.triggerType === TriggerType.SCHEDULED) {
        this.processScheduledRule(rule);
      }
    });
  }

  private processScheduledRule(rule: AutomationRule): void {
    // Check if rule should run (simplified - in production, use proper scheduling)
    const shouldRun = Math.random() < 0.001; // 0.1% chance per check (about once per day)
    
    if (shouldRun) {
      const targetUsers = this.getTargetUsers(rule);
      
      targetUsers.forEach(user => {
        rule.actions.forEach(action => {
          if (action.type === 'send_email') {
            this.scheduleEmail({
              userId: user.id,
              templateId: action.parameters.templateId,
              delayMinutes: action.delayMinutes || 0,
              personalizations: this.buildPersonalizations(action.parameters, user)
            });
          }
        });
      });
    }
  }

  private async sendEmail(emailItem: EmailQueueItem): Promise<boolean> {
    try {
      const user = this.userProfiles.get(emailItem.userId);
      if (!user) {
        throw new Error(`User not found: ${emailItem.userId}`);
      }

      const success = await this.emailSystem.sendEmail(
        emailItem.userId,
        emailItem.templateId,
        emailItem.personalizations
      );

      return success;
    } catch (error) {
      console.error(`Failed to send email ${emailItem.id}:`, error);
      return false;
    }
  }

  private scheduleEmail(params: {
    userId: string;
    templateId: string;
    delayMinutes: number;
    personalizations: Record<string, any>;
  }): void {
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const scheduledFor = new Date(Date.now() + params.delayMinutes * 60 * 1000);

    const emailItem: EmailQueueItem = {
      id: emailId,
      userId: params.userId,
      templateId: params.templateId,
      scheduledFor,
      priority: 'normal',
      retryCount: 0,
      personalizations: params.personalizations,
      status: 'pending'
    };

    this.emailQueue.set(emailId, emailItem);
    console.log(`📧 Email scheduled: ${emailId} for ${scheduledFor.toISOString()}`);
  }

  private getTargetUsers(rule: AutomationRule): UserProfile[] {
    return Array.from(this.userProfiles.values())
      .filter(user => {
        // Check segment match
        if (user.segment !== rule.targetSegment) {
          return false;
        }

        // Check conditions
        return rule.conditions.every(condition => {
          return this.evaluateCondition(user, condition);
        });
      });
  }

  private evaluateCondition(user: UserProfile, condition: AutomationCondition): boolean {
    const userValue = this.getNestedValue(user, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return userValue === condition.value;
      case 'not_equals':
        return userValue !== condition.value;
      case 'greater_than':
        return Number(userValue) > Number(condition.value);
      case 'less_than':
        return Number(userValue) < Number(condition.value);
      case 'contains':
        return String(userValue).includes(String(condition.value));
      case 'not_contains':
        return !String(userValue).includes(String(condition.value));
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private buildPersonalizations(params: Record<string, any>, user: UserProfile): Record<string, any> {
    const personalizations: Record<string, any> = {};
    
    Object.keys(params).forEach(key => {
      if (key.startsWith('personalization')) {
        const fieldName = params[key];
        if (fieldName === 'calculated') {
          // Calculate dynamic values
          if (key === 'personalizationValue' && fieldName === 'calculated') {
            if (params.personalizationKey === 'daysSinceActivity') {
              const daysSince = Math.floor((Date.now() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
              personalizations[params.personalizationKey || 'value'] = daysSince;
            }
          }
        } else {
          personalizations[key.replace('personalization', '').toLowerCase()] = fieldName;
        }
      } else if (key !== 'templateId') {
        personalizations[key] = params[key];
      }
    });

    // Add default user personalizations
    personalizations.firstName = user.firstName || 'Utilizator';
    personalizations.lastName = user.lastName || '';
    personalizations.email = user.email;

    return personalizations;
  }

  private cleanupCompletedItems(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Remove old completed/failed items
    Array.from(this.emailQueue.entries()).forEach(([id, item]) => {
      if ((item.status === 'sent' || item.status === 'failed') && item.scheduledFor < oneDayAgo) {
        this.emailQueue.delete(id);
      }
    });

    console.log('🧹 Cleaned up old email queue items');
  }

  // Public methods for external integration
  public triggerAutomation(triggerType: TriggerType, userId: string, data?: any): void {
    const relevantRules = Array.from(this.automationRules.values())
      .filter(rule => rule.triggerType === triggerType && rule.isActive);

    relevantRules.forEach(rule => {
      const user = this.userProfiles.get(userId);
      if (user && user.segment === rule.targetSegment) {
        rule.actions.forEach(action => {
          if (action.type === 'send_email') {
            this.scheduleEmail({
              userId,
              templateId: action.parameters.templateId,
              delayMinutes: action.delayMinutes || 0,
              personalizations: {
                ...this.buildPersonalizations(action.parameters, user),
                ...data
              }
            });
          }
        });
      }
    });
  }

  public addUserProfile(user: UserProfile): void {
    this.userProfiles.set(user.id, user);
  }

  public getQueueStats(): {
    total: number;
    pending: number;
    sent: number;
    failed: number;
  } {
    const items = Array.from(this.emailQueue.values());
    return {
      total: items.length,
      pending: items.filter(item => item.status === 'pending').length,
      sent: items.filter(item => item.status === 'sent').length,
      failed: items.filter(item => item.status === 'failed').length
    };
  }

  public getActiveRules(): AutomationRule[] {
    return Array.from(this.automationRules.values()).filter(rule => rule.isActive);
  }

  public toggleRule(ruleId: string, isActive: boolean): void {
    const rule = this.automationRules.get(ruleId);
    if (rule) {
      rule.isActive = isActive;
      this.automationRules.set(ruleId, rule);
      console.log(`Rule ${ruleId} ${isActive ? 'activated' : 'deactivated'}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Compatibility layer for Next.js API routes
// ---------------------------------------------------------------------------

export type SendEmailParams = EmailOptions;

/**
 * Convenience wrapper used by cron routes.
 * Delegates to `src/lib/email.ts` (Resend).
 */
export async function sendEmail(params: SendEmailParams) {
  return sendEmailService(params);
}

export function generateVerificationToken(bytes: number = 32): string {
  // URL-safe base64 without padding
  return randomBytes(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function sendAccountCreationEmail(email: string, token: string, name?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const link = `${appUrl}/api/verify-confirmation?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bun venit${name ? `, ${name}` : ''}!</h2>
      <p>Te rugăm să confirmi adresa de email pentru a finaliza crearea contului.</p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background:#667eea;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;">
          Confirmă emailul →
        </a>
      </p>
      <p style="color:#666;font-size:12px;">Dacă butonul nu funcționează, deschide linkul: ${link}</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Confirmă crearea contului - Piata AI',
    html,
    text: `Confirmă crearea contului: ${link}`,
  });
}

export async function sendAdPostingConfirmationEmail(
  email: string,
  adData: {
    title: string;
    platform?: string;
    category?: string;
    price?: number;
    location?: string;
  },
  token: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const link = `${appUrl}/api/verify-confirmation?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Confirmare postare anunț</h2>
      <p>Te rugăm să confirmi postarea anunțului:</p>
      <ul>
        <li><strong>Titlu:</strong> ${adData.title}</li>
        ${adData.price != null ? `<li><strong>Preț:</strong> ${adData.price}</li>` : ''}
        ${adData.category ? `<li><strong>Categorie:</strong> ${adData.category}</li>` : ''}
        ${adData.location ? `<li><strong>Locație:</strong> ${adData.location}</li>` : ''}
        ${adData.platform ? `<li><strong>Platformă:</strong> ${adData.platform}</li>` : ''}
      </ul>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background:#22c55e;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;">
          Confirmă postarea →
        </a>
      </p>
      <p style="color:#666;font-size:12px;">Link: ${link}</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Confirmă postarea anunțului - Piata AI',
    html,
    text: `Confirmă postarea anunțului: ${link}`,
  });
}

export async function sendPermissionRequestEmail(
  adminEmail: string,
  data: {
    requesterName: string;
    requesterEmail: string;
    platform?: string;
    adTitle: string;
    reason: string;
    approvalLink: string;
    rejectionLink: string;
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Cerere permisiune</h2>
      <p><strong>Solicitant:</strong> ${data.requesterName} (${data.requesterEmail})</p>
      <p><strong>Permisiune:</strong> ${data.adTitle}</p>
      <p><strong>Motiv:</strong> ${data.reason}</p>
      <p style="margin: 24px 0;">
        <a href="${data.approvalLink}" style="background:#22c55e;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;margin-right:10px;display:inline-block;">Aprobă</a>
        <a href="${data.rejectionLink}" style="background:#ef4444;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block;">Respinge</a>
      </p>
      <p style="color:#666;font-size:12px;">Dacă butoanele nu funcționează: ${data.approvalLink} / ${data.rejectionLink}</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: 'Aprobare necesară - Piata AI',
    html,
    text: `Aprobă: ${data.approvalLink}\nRespinge: ${data.rejectionLink}`,
  });
}

export class EmailTestService {
  static async testAllEmailServices() {
    const resendConfigured = Boolean(process.env.RESEND_API_KEY);
    return {
      resendConfigured,
      timestamp: new Date().toISOString(),
    };
  }
}
