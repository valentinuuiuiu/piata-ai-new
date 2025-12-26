import { db } from './drizzle/db';
import { referralCodes, referrals, referralRewards, userProfiles, referralFraudLogs } from './drizzle/schema';
import { eq, and, sql, or } from 'drizzle-orm';

export const REFERRAL_REWARD_REFERRER = 25; // RON
export const REFERRAL_REWARD_REFEREE = 50; // RON
export const REFERRAL_REWARD_TIER2 = 10; // RON bonus for indirect referrals

/**
 * Gets or creates a unique referral code for a user
 */
export async function getOrCreateReferralCode(userId: string) {
  const existing = await db.query.referralCodes.findFirst({
    where: eq(referralCodes.userId, userId),
  });

  if (existing) return existing.code;

  // Generate a clean, readable 8-character code
  let code = '';
  let isUnique = false;
  
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const conflict = await db.query.referralCodes.findFirst({
      where: eq(referralCodes.code, code),
    });
    if (!conflict) isUnique = true;
  }

  await db.insert(referralCodes).values({
    userId,
    code,
  });

  return code;
}

/**
 * Tracks a new referral when a user signs up with a code
 */
export async function trackReferral(referrerCode: string, referredUserId: string, metadata: any = {}) {
  // 1. Find referrer by code
  const codeEntry = await db.query.referralCodes.findFirst({
    where: eq(referralCodes.code, referrerCode),
  });

  if (!codeEntry) throw new Error('Invalid referral code');
  if (codeEntry.userId === referredUserId) throw new Error('Cannot refer yourself');

  // 2. Check if already referred (fraud prevention)
  const existingReferral = await db.query.referrals.findFirst({
    where: eq(referrals.referredId, referredUserId),
  });

  if (existingReferral) {
    await db.insert(referralFraudLogs).values({
      reason: 'Duplicate referral attempt',
      metadata: { referredUserId, referrerCode, ...metadata },
    });
    throw new Error('User already referred');
  }

  // 3. Create Tier 1 referral record
  const [newReferral] = await db.insert(referrals).values({
    referrerId: codeEntry.userId,
    referredId: referredUserId,
    status: 'pending',
    tier: 1,
  }).returning();

  // 4. Multi-tier tracking: Check if the referrer was also referred
  const referrersReferrer = await db.query.referrals.findFirst({
    where: and(
      eq(referrals.referredId, codeEntry.userId),
      eq(referrals.tier, 1)
    ),
  });

  if (referrersReferrer) {
    // Create Tier 2 referral record (indirect)
    await db.insert(referrals).values({
      referrerId: referrersReferrer.referrerId,
      referredId: referredUserId,
      status: 'pending',
      tier: 2,
    });
  }

  return newReferral;
}

/**
 * Completes a referral and distributes rewards (e.g., after email verification or first post)
 */
export async function completeReferral(referredUserId: string) {
  // Find all pending referrals for this user (could be Tier 1 and Tier 2)
  const pendingReferrals = await db.query.referrals.findMany({
    where: and(
      eq(referrals.referredId, referredUserId),
      eq(referrals.status, 'pending')
    ),
  });

  if (pendingReferrals.length === 0) return;

  for (const referral of pendingReferrals) {
    // Update status to completed
    await db.update(referrals)
      .set({ status: 'completed' })
      .where(eq(referrals.id, referral.id));

    // Distribute rewards based on tier
    if (referral.tier === 1) {
      await distributeTier1Rewards(referral.id, referral.referrerId, referredUserId);
    } else if (referral.tier === 2) {
      await distributeTier2Rewards(referral.id, referral.referrerId);
    }
  }
}

async function distributeTier1Rewards(referralId: number, referrerId: string, refereeId: string) {
  // 1. Referrer Reward (25 RON)
  await db.insert(referralRewards).values({
    referralId,
    userId: referrerId,
    rewardType: 'credit',
    amount: REFERRAL_REWARD_REFERRER.toString(),
    status: 'distributed',
    distributedAt: new Date(),
  });

  await db.update(userProfiles)
    .set({ creditsBalance: sql`${userProfiles.creditsBalance} + ${REFERRAL_REWARD_REFERRER}` })
    .where(eq(userProfiles.userId, referrerId));

  // 2. Referee Reward (50 RON)
  await db.insert(referralRewards).values({
    referralId,
    userId: refereeId,
    rewardType: 'credit',
    amount: REFERRAL_REWARD_REFEREE.toString(),
    status: 'distributed',
    distributedAt: new Date(),
  });

  await db.update(userProfiles)
    .set({ creditsBalance: sql`${userProfiles.creditsBalance} + ${REFERRAL_REWARD_REFEREE}` })
    .where(eq(userProfiles.userId, refereeId));
}

async function distributeTier2Rewards(referralId: number, referrerId: string) {
  // Tier 2 Referrer Reward (10 RON)
  await db.insert(referralRewards).values({
    referralId,
    userId: referrerId,
    rewardType: 'credit',
    amount: REFERRAL_REWARD_TIER2.toString(),
    status: 'distributed',
    distributedAt: new Date(),
  });

  await db.update(userProfiles)
    .set({ creditsBalance: sql`${userProfiles.creditsBalance} + ${REFERRAL_REWARD_TIER2}` })
    .where(eq(userProfiles.userId, referrerId));
}

/**
 * Fraud detection logic
 */
export async function detectReferralFraud(referredUserId: string, referrerCode: string, metadata: any = {}) {
  const { ip, userAgent, fingerprint } = metadata;

  // 1. Check for same IP referrals (limit to 3 per IP)
  if (ip) {
    const [sameIpCount] = await db
      .select({ value: sql<number>`count(*)` })
      .from(referrals)
      .where(sql`metadata->>'ip' = ${ip}`);
    
    if (Number(sameIpCount.value) > 3) {
      await db.insert(referralFraudLogs).values({
        reason: 'High frequency IP referral',
        metadata: { referredUserId, referrerCode, ip, userAgent },
      });
      return true;
    }
  }

  // 2. Check for same device fingerprint
  if (fingerprint) {
    const [sameFingerprint] = await db
      .select({ value: sql<number>`count(*)` })
      .from(referrals)
      .where(sql`metadata->>'fingerprint' = ${fingerprint}`);
    
    if (Number(sameFingerprint.value) > 1) {
       await db.insert(referralFraudLogs).values({
        reason: 'Duplicate device fingerprint',
        metadata: { referredUserId, referrerCode, fingerprint },
      });
      return true;
    }
  }

  return false;
}
