
import { db } from '../drizzle/db';
import { users, anunturi } from '../drizzle/schema';
import { eq, desc, sql, count } from 'drizzle-orm';
import { emailSystem } from '../email-system';

export interface TrustScore {
  score: number; // 0-100
  factors: {
    accountAgeDays: number;
    totalListings: number;
    verifiedEmail: boolean;
    verifiedPhone: boolean;
    suspiciousPatterns: string[];
  };
  level: 'trusted' | 'neutral' | 'suspicious' | 'blocked';
}

export interface SecurityReport {
  userId: string;
  userEmail: string;
  timestamp: Date;
  findings: string[];
  recommendedAction: 'none' | 'monitor' | 'suspend' | 'ban';
  trustScore: TrustScore;
}

/**
 * 🛡️ Guardian Agent - Security & Surveillance
 *
 * Responsibilities:
 * - Analyze user activity patterns
 * - Calculate trust scores
 * - Detect fraud/scams
 * - Report suspicious activity
 */
export class GuardianAgent {
  private static instance: GuardianAgent;

  private constructor() {}

  static getInstance(): GuardianAgent {
    if (!GuardianAgent.instance) {
      GuardianAgent.instance = new GuardianAgent();
    }
    return GuardianAgent.instance;
  }

  /**
   * Calculate Trust Score for a user
   */
  async calculateTrustScore(userId: string): Promise<TrustScore> {
    try {
      // Fetch user data
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Fetch listings stats (optimized: only fetch necessary fields)
      const listings = await db.select({
        id: anunturi.id,
        title: anunturi.title,
        createdAt: anunturi.createdAt
      })
      .from(anunturi)
      .where(eq(anunturi.userId, userId));

      const accountAgeDays = Math.floor((Date.now() - (user.createdAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24));

      // Basic scoring logic
      let score = 50; // Start neutral
      const factors: TrustScore['factors'] = {
        accountAgeDays,
        totalListings: listings.length,
        verifiedEmail: !!user.email, // Assuming presence means verification for now, should check auth table ideally
        verifiedPhone: !!user.phone,
        suspiciousPatterns: []
      };

      // 1. Account Age Bonus
      if (accountAgeDays > 30) score += 10;
      if (accountAgeDays > 365) score += 20;

      // 2. Verified Info
      if (user.phone) score += 15;

      // 3. Activity Patterns (Negative checks)

      // Check for rapid posting (too many listings in short time)
      const recentListings = listings.filter(l =>
        l.createdAt && (Date.now() - l.createdAt.getTime()) < 24 * 60 * 60 * 1000
      );

      if (recentListings.length > 10) {
        score -= 20;
        factors.suspiciousPatterns.push('High frequency posting (>10/day)');
      }

      // Check for duplicate titles (spam)
      const titles = listings.map(l => (l.title || '').toLowerCase());
      const uniqueTitles = new Set(titles);
      if (titles.length > 5 && uniqueTitles.size < titles.length * 0.5) {
        score -= 15;
        factors.suspiciousPatterns.push('Repetitive listing titles');
      }

      // Cap score 0-100
      score = Math.max(0, Math.min(100, score));

      return {
        score,
        factors,
        level: score > 80 ? 'trusted' : score > 40 ? 'neutral' : score > 20 ? 'suspicious' : 'blocked'
      };

    } catch (error) {
      console.error('[Guardian] Error calculating trust score:', error);
      return {
        score: 0,
        factors: { accountAgeDays: 0, totalListings: 0, verifiedEmail: false, verifiedPhone: false, suspiciousPatterns: ['Error calculating score'] },
        level: 'neutral'
      };
    }
  }

  /**
   * Scan for suspicious activity across recent listings
   */
  async scanForSuspiciousActivity(): Promise<SecurityReport[]> {
    const reports: SecurityReport[] = [];

    // Get listings from last 24h
    const recentListings = await db.select({
      id: anunturi.id,
      userId: anunturi.userId,
      title: anunturi.title,
      description: anunturi.description,
      createdAt: anunturi.createdAt,
      userEmail: users.email
    })
    .from(anunturi)
    .leftJoin(users, eq(anunturi.userId, users.id))
    .where(sql`${anunturi.createdAt} > NOW() - INTERVAL '24 HOURS'`);

    // Group by user
    const userListings = new Map<string, typeof recentListings>();
    for (const listing of recentListings) {
      if (!listing.userId) continue;
      const list = userListings.get(listing.userId) || [];
      list.push(listing);
      userListings.set(listing.userId, list);
    }

    // Analyze each active user
    for (const [userId, listings] of userListings.entries()) {
      const email = listings[0]?.userEmail || 'unknown';
      const trustScore = await this.calculateTrustScore(userId);

      // Heuristics for immediate reporting
      const findings: string[] = [...trustScore.factors.suspiciousPatterns];

      // Keyword check (scam patterns)
      const scamKeywords = ['western union', 'moneygram', 'pay in advance', 'nigeria', 'shipping agent'];
      let keywordMatches = 0;

      for (const listing of listings) {
        const content = ((listing.title || '') + ' ' + (listing.description || '')).toLowerCase();
        for (const kw of scamKeywords) {
          if (content.includes(kw)) {
            keywordMatches++;
            findings.push(`Found scam keyword: "${kw}" in listing ${listing.id}`);
          }
        }
      }

      if (trustScore.level === 'suspicious' || trustScore.level === 'blocked' || keywordMatches > 0) {
        reports.push({
          userId,
          userEmail: email,
          timestamp: new Date(),
          findings,
          recommendedAction: keywordMatches > 0 ? 'suspend' : 'monitor',
          trustScore
        });
      }
    }

    return reports;
  }

  /**
   * Report findings via email/notification
   */
  async reportFindings(reports: SecurityReport[]): Promise<void> {
    if (reports.length === 0) return;

    console.log(`[Guardian] Found ${reports.length} suspicious activities`);

    const adminEmail = process.env.ADMIN_EMAIL || 'ionutbaltag3@gmail.com';

    let emailBody = `<h1>🛡️ Guardian Security Report</h1>
    <p>Found ${reports.length} suspicious users/activities in the last scan.</p>
    <hr>`;

    for (const report of reports) {
      emailBody += `
      <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-left: 5px solid ${report.recommendedAction === 'suspend' ? 'red' : 'orange'}">
        <h3>User: ${report.userEmail}</h3>
        <p><strong>Trust Score:</strong> ${report.trustScore.score} (${report.trustScore.level})</p>
        <p><strong>Action:</strong> ${report.recommendedAction.toUpperCase()}</p>
        <ul>
          ${report.findings.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      `;
    }

    // Use email system to send report
    await emailSystem.sendTemplate(
      adminEmail,
      'SECURITY_REPORT',
      { subject: `🚨 Security Alert: ${reports.length} Suspicious Activities`, html: emailBody }
    );
  }
}

export const guardian = GuardianAgent.getInstance();
