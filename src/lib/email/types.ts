
export enum CampaignType {
  WELCOME = 'welcome',
  COMPETITOR_ANALYSIS = 'competitor_analysis',
  PRODUCT_CATEGORY = 'product_category',
  LOYALTY_RETENTION = 'loyalty_retention',
  RE_ENGAGEMENT = 're_engagement',
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional'
}

export enum UserSegment {
  NEW_USERS = 'new_users',
  OLX_USERS = 'olx_users',
  EMAG_USERS = 'emag_users',
  ELECTRONICS_INTERESTED = 'electronics_interested',
  FASHION_INTERESTED = 'fashion_interested',
  HOME_GARDEN_INTERESTED = 'home_garden_interested',
  INACTIVE_USERS = 'inactive_users',
  LOYAL_CUSTOMERS = 'loyal_customers',
  HIGH_VALUE_USERS = 'high_value_users'
}

export enum TriggerType {
  SIGNUP = 'signup',
  FIRST_PURCHASE = 'first_purchase',
  CART_ABANDONMENT = 'cart_abandonment',
  INACTIVITY = 'inactivity',
  PURCHASE_COMPLETION = 'purchase_completion',
  SCHEDULED = 'scheduled',
  BIRTHDAY = 'birthday'
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  campaignType: CampaignType;
  targetSegment: UserSegment;
  triggerType: TriggerType;
  delayMinutes?: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateIds: string[];
  targetSegment: UserSegment;
  triggerType: TriggerType;
  scheduling?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  segment: UserSegment;
  interests: string[];
  totalSpent: number;
  lastActivity: Date;
  signupDate: Date;
  isActive: boolean;
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    communicationFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

export interface EmailAnalytics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  sentAt: Date;
}

export interface AutomationRule {
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

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  type: 'send_email' | 'segment_user' | 'wait' | 'update_field';
  parameters?: Record<string, any>;
  delayMinutes?: number;
}

export interface EmailQueueItem {
  id: string;
  userId: string;
  templateId: string;
  scheduledFor: Date;
  priority: 'low' | 'normal' | 'high';
  retryCount: number;
  personalizations: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

export interface MarketplaceEvent {
  type: 'user_signup' | 'user_purchase' | 'cart_abandoned' | 'user_inactive' | 'email_opened' | 'email_clicked' | 'purchase_completed';
  userId: string;
  timestamp: Date;
  data: any;
}

export interface UserEventData {
  email?: string;
  firstName?: string;
  lastName?: string;
  totalSpent?: number;
  cartValue?: number;
  categories?: string[];
  purchaseHistory?: Array<{amount: number; category: string; date: Date}>;
  platformUsage?: string[];
}
