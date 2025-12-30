
import { 
    TriggerType, 
    UserSegment, 
    AutomationRule, 
    AutomationCondition, 
    AutomationAction, 
    EmailQueueItem,
    UserProfile
} from './types';
import { EmailMarketingSystem } from './marketing';
import { randomBytes } from 'node:crypto';

export class EmailAutomationEngine {
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
        { type: 'send_email', parameters: { templateId: 'welcome_1' }, delayMinutes: 0 },
        { type: 'send_email', parameters: { templateId: 'welcome_2' }, delayMinutes: 60 * 24 },
        { type: 'send_email', parameters: { templateId: 'welcome_3' }, delayMinutes: 60 * 24 * 3 }
      ],
      isActive: true,
      priority: 1
    });

    // ... (Other default rules from original file would go here)
  }

  public startAutomation(): void {
    if (this.isRunning) {
      console.log('Email automation is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Email automation engine started');

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
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return a.scheduledFor.getTime() - b.scheduledFor.getTime();
    });

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
    // Check if rule should run
    const shouldRun = Math.random() < 0.001; 
    
    if (shouldRun) {
      const targetUsers = this.getTargetUsers(rule);
      
      targetUsers.forEach(user => {
        rule.actions.forEach(action => {
          if (action.type === 'send_email') {
            this.scheduleEmail({
              userId: user.id,
              templateId: action.parameters?.templateId,
              delayMinutes: action.delayMinutes || 0,
              personalizations: this.buildPersonalizations(action.parameters || {}, user)
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
      return await this.emailSystem.sendEmail(
        emailItem.userId,
        emailItem.templateId,
        emailItem.personalizations
      );
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
        if (user.segment !== rule.targetSegment) return false;
        return rule.conditions.every(condition => this.evaluateCondition(user, condition));
      });
  }

  private evaluateCondition(user: UserProfile, condition: AutomationCondition): boolean {
    const userValue = this.getNestedValue(user, condition.field);
    
    switch (condition.operator) {
      case 'equals': return userValue === condition.value;
      case 'not_equals': return userValue !== condition.value;
      case 'greater_than': return Number(userValue) > Number(condition.value);
      case 'less_than': return Number(userValue) < Number(condition.value);
      case 'contains': return String(userValue).includes(String(condition.value));
      case 'not_contains': return !String(userValue).includes(String(condition.value));
      default: return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private buildPersonalizations(params: Record<string, any>, user: UserProfile): Record<string, any> {
    const personalizations: Record<string, any> = {};
    Object.keys(params).forEach(key => {
        personalizations[key] = params[key];
    });
    // Add default user personalizations
    personalizations.firstName = user.firstName || 'Utilizator';
    personalizations.email = user.email;
    return personalizations;
  }

  private cleanupCompletedItems(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    Array.from(this.emailQueue.entries()).forEach(([id, item]) => {
      if ((item.status === 'sent' || item.status === 'failed') && item.scheduledFor < oneDayAgo) {
        this.emailQueue.delete(id);
      }
    });
    console.log('🧹 Cleaned up old email queue items');
  }

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
              templateId: action.parameters?.templateId,
              delayMinutes: action.delayMinutes || 0,
              personalizations: {
                ...this.buildPersonalizations(action.parameters || {}, user),
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

  public getQueueStats() {
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

export class EmailTestService {
  static async testAllEmailServices() {
    const resendConfigured = Boolean(process.env.RESEND_API_KEY);
    return {
      resendConfigured,
      timestamp: new Date().toISOString(),
    };
  }
}
