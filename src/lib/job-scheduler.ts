import { createClient } from 'redis';

/**
 * Redis Job Scheduler - Simple & Powerful
 * 
 * Replaces complex Celery/RabbitMQ with lightweight Redis-based jobs
 * Perfect for scheduling marketing emails, data updates, AI validation, etc.
 */

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string; // cron format: "0 9 * * *" = daily at 9am
  handler: string; // function to execute
  data?: any;
  enabled: boolean;
  lastRun?: number;
  nextRun?: number;
}

class JobScheduler {
  private redis: ReturnType<typeof createClient>;
  private isConnected: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.redis.on('error', (err) => {
      console.error('[JobScheduler] Redis error:', err);
    });
  }

  async connect() {
    if (!this.isConnected) {
      await this.redis.connect();
      this.isConnected = true;
      console.log('[JobScheduler] Connected to Redis');
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.redis.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Schedule a recurring job
   */
  async scheduleJob(job: ScheduledJob) {
    await this.connect();
    
    const jobKey = `job:${job.id}`;
    await this.redis.set(jobKey, JSON.stringify(job));
    
    console.log(`[JobScheduler] ✅ Scheduled job: ${job.name}`);
    return job.id;
  }

  /**
   * Get all scheduled jobs
   */
  async getJobs(): Promise<ScheduledJob[]> {
    await this.connect();
    
    const keys = await this.redis.keys('job:*');
    const jobs: ScheduledJob[] = [];
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        jobs.push(JSON.parse(data));
      }
    }
    
    return jobs;
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string) {
    await this.connect();
    await this.redis.del(`job:${jobId}`);
    console.log(`[JobScheduler] ❌ Deleted job: ${jobId}`);
  }

  /**
   * Check if a job should run based on cron schedule
   */
  private shouldRun(job: ScheduledJob): boolean {
    if (!job.enabled) return false;
    
    const now = Date.now();
    
    // If never run, run it now
    if (!job.lastRun) return true;
    
    // Parse cron: "minute hour day month dayOfWeek"
    // Simple implementation for common patterns
    const parts = job.schedule.split(' ');
    const [minute, hour, day, month, dayOfWeek] = parts.map(p => p === '*' ? null : parseInt(p));
    
    const date = new Date();
    const currentMinute = date.getMinutes();
    const currentHour = date.getHours();
    const currentDay = date.getDate();
    const currentMonth = date.getMonth() + 1;
    const currentDayOfWeek = date.getDay();
    
    // Check if current time matches schedule
    const minuteMatch = minute === null || minute === currentMinute;
    const hourMatch = hour === null || hour === currentHour;
    const dayMatch = day === null || day === currentDay;
    const monthMatch = month === null || month === currentMonth;
    const dayOfWeekMatch = dayOfWeek === null || dayOfWeek === currentDayOfWeek;
    
    // Don't run if we already ran this minute
    const timeSinceLastRun = now - (job.lastRun || 0);
    const hasBeenAtLeastAMinute = timeSinceLastRun > 60000;
    
    return minuteMatch && hourMatch && dayMatch && monthMatch && dayOfWeekMatch && hasBeenAtLeastAMinute;
  }

  /**
   * Execute a job
   */
  private async executeJob(job: ScheduledJob) {
    console.log(`[JobScheduler] 🚀 Executing job: ${job.name}`);
    
    try {
      // Dynamic handler execution
      // In production, map handler strings to actual functions
      const handlers: Record<string, Function> = {
        'sendDailyNewsletter': this.sendDailyNewsletter,
        'syncGoogleSheets': this.syncGoogleSheets,
        'validateNewListings': this.validateNewListings,
        'optimizePricing': this.optimizePricing,
        'generateAnalytics': this.generateAnalytics
      };
      
      const handler = handlers[job.handler];
      if (handler) {
        await handler(job.data);
        
        // Update last run time
        job.lastRun = Date.now();
        await this.scheduleJob(job);
        
        console.log(`[JobScheduler] ✅ Job completed: ${job.name}`);
      } else {
        console.error(`[JobScheduler] ❌ Handler not found: ${job.handler}`);
      }
    } catch (error) {
      console.error(`[JobScheduler] ❌ Job failed: ${job.name}`, error);
    }
  }

  /**
   * Start the scheduler (runs every minute)
   */
  start() {
    if (this.intervalId) {
      console.log('[JobScheduler] Already running');
      return;
    }
    
    console.log('[JobScheduler] ⏰ Starting job scheduler...');
    
    // Check jobs every minute
    this.intervalId = setInterval(async () => {
      const jobs = await this.getJobs();
      
      for (const job of jobs) {
        if (this.shouldRun(job)) {
          await this.executeJob(job);
        }
      }
    }, 60000); // Check every minute
    
    console.log('[JobScheduler] ✅ Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[JobScheduler] ⏹️  Scheduler stopped');
    }
  }

  // ============================================================================
  // JOB HANDLERS - Define your automated tasks here
  // ============================================================================

  private async sendDailyNewsletter(data: any) {
    console.log('[Job] Sending daily newsletter...');
    // Use NotebookLLM-style intelligence to generate newsletter
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'workflow',
        data: { workflowName: 'WEEKLY_NEWSLETTER' }
      })
    });
    const result = await response.json();
    console.log('[Job] Newsletter generated:', result.success);
  }

  private async syncGoogleSheets(data: any) {
    console.log('[Job] Syncing Google Sheets...');
    // TODO: Use Google Workspace MCP to read/write sheets
  }

  private async validateNewListings(data: any) {
    console.log('[Job] Validating new listings with AI...');
    // TODO: Use Grok agent to validate listings
  }

  private async optimizePricing(data: any) {
    console.log('[Job] Optimizing pricing with AI...');
    // Generate trend report and adjust pricing
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'trend-report',
        data: { category: data?.category || 'Electronics' }
      })
    });
    const result = await response.json();
    console.log('[Job] Trend analysis complete:', result.success);
  }

  private async generateAnalytics(data: any) {
    console.log('[Job] Generating analytics...');
    // Analyze user feedback
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'workflow',
        data: { workflowName: 'FEEDBACK_ANALYSIS' }
      })
    });
    const result = await response.json();
    console.log('[Job] Analytics generated:', result.success);
  }
}

// Singleton instance
let schedulerInstance: JobScheduler | null = null;

export function getScheduler(): JobScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new JobScheduler();
  }
  return schedulerInstance;
}

// Preset common jobs
export const COMMON_JOBS = {
  DAILY_NEWSLETTER: {
    id: 'daily-newsletter',
    name: 'Daily Newsletter',
    schedule: '0 9 * * *', // 9 AM daily
    handler: 'sendDailyNewsletter',
    enabled: true
  },
  HOURLY_SYNC: {
    id: 'hourly-sync',
    name: 'Sync Google Sheets',
    schedule: '0 * * * *', // Every hour
    handler: 'syncGoogleSheets',
    enabled: true
  },
  VALIDATE_ADS: {
    id: 'validate-ads',
    name: 'AI Validation of New Ads',
    schedule: '*/15 * * * *', // Every 15 minutes
    handler: 'validateNewListings',
    enabled: true
  },
  WEEKLY_PRICING: {
    id: 'weekly-pricing',
    name: 'Weekly Price Optimization',
    schedule: '0 10 * * 1', // Monday 10 AM
    handler: 'optimizePricing',
    enabled: true
  }
};
