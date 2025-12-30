/**
 * Email System Stub
 * This is a minimal stub to allow the agent system to initialize.
 * Replace with actual implementation when email integration is needed.
 */

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  preferences?: Record<string, any>;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: Record<string, any>;
  userCount?: number;
}

export type TriggerType = 'signup' | 'purchase' | 'listing_posted' | 'listing_expired' | 'daily' | 'weekly';

export class EmailMarketingSystem {
  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    console.log(`[EmailSystem STUB] Would send email to ${to}: ${subject}`);
    return true;
  }

  async getSegments(): Promise<UserSegment[]> {
    return [];
  }

  async sendToSegment(segmentId: string, subject: string, content: string): Promise<number> {
    console.log(`[EmailSystem STUB] Would send to segment ${segmentId}: ${subject}`);
    return 0;
  }
}

export const emailSystem = new EmailMarketingSystem();
