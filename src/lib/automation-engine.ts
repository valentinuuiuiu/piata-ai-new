/**
 * Piata AI Automation Engine
 * Self-executing AI-powered automation scripts
 */

import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email-automation";
import { runPrompt } from "@/lib/ai";

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron expression
  prompt: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: "idle" | "running" | "completed" | "failed";
  results?: any;
}

export interface AutomationContext {
  timestamp: Date;
  data: any;
  userId?: number;
  listingId?: number;
}

// Core automation prompts
export const AUTOMATION_PROMPTS = {
  LISTING_OPTIMIZATION: `
You are an expert copywriter specializing in marketplace listings. Your task is to optimize the given listing to increase visibility and conversion.

Original Title: {title}
Original Description: {description}
Category: {category}
Price: {price}

Please provide:
1. An optimized title (max 80 characters) that's SEO-friendly and attention-grabbing
2. An enhanced description (200-500 words) that's detailed, persuasive, and includes relevant keywords
3. 3-5 relevant hashtags for social media sharing
4. A compelling call-to-action

Make it sound professional, trustworthy, and urgent. Use emotional triggers and social proof elements.
`,

  BLOG_CONTENT_GENERATION: `
You are a professional content writer for Piata AI, Romania's intelligent marketplace. Create engaging blog content about {topic}.

Requirements:
- Title: SEO-optimized, attention-grabbing (max 60 characters)
- Meta description: Compelling summary (max 160 characters)
- Content: 800-1200 words, well-structured with H2/H3 headings
- Include relevant keywords: marketplace, Romania, AI, buying, selling
- Add internal links to platform features
- End with strong call-to-action

Topic: {topic}
Target audience: Romanian entrepreneurs, buyers, sellers
Tone: Professional, helpful, authoritative
`,

  EMAIL_CAMPAIGN_GENERATION: `
Create a personalized email campaign for Piata AI users.

Campaign Type: {campaignType}
Target Audience: {audience}
Current User Data: {userData}

Generate:
1. Subject line (max 50 characters)
2. Email content (HTML format)
3. Call-to-action button text and link
4. Unsubscribe footer

Make it personalized, valuable, and conversion-focused. Include relevant marketplace features and benefits.
`,

  MARKET_ANALYSIS: `
Analyze the current marketplace data and provide insights.

Available Data:
- Total listings: {totalListings}
- Active categories: {categories}
- Price ranges: {priceRanges}
- User engagement: {engagement}

Provide:
1. Market trends analysis
2. Popular categories insights
3. Pricing optimization recommendations
4. User behavior patterns
5. Growth opportunities

Format as executive summary with actionable recommendations.
`,

  QUALITY_CHECK: `
Review the following listing for quality and compliance.

Listing Data:
- Title: {title}
- Description: {description}
- Price: {price}
- Images: {imageCount}
- Category: {category}

Check for:
1. Complete and accurate information
2. Professional presentation
3. Fair pricing
4. Image quality and relevance
5. Compliance with platform rules

Provide score (1-10) and specific improvement recommendations.
`,

  SOCIAL_MEDIA_POST: `
Create engaging social media content for Piata AI.

Platform: {platform}
Content Type: {contentType}
Topic: {topic}

Generate:
1. Post text (platform-appropriate length)
2. Relevant hashtags (5-10)
3. Call-to-action
4. Image/video description
5. Posting schedule recommendation

Make it shareable, engaging, and brand-consistent.
`,
};

// Automation execution engine
export class AutomationEngine {
  private tasks: Map<string, AutomationTask> = new Map();

  constructor() {
    // Only initialize if not in build phase
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      this.loadTasks();
      this.startScheduler();
    }
  }

  private async loadTasks() {
    try {
      // Load automation tasks from database
      const tasks = await query(
        "SELECT * FROM automation_tasks WHERE enabled = true"
      );
      if (Array.isArray(tasks)) {
        tasks.forEach((task: any) => {
          this.tasks.set(task.id, {
            ...task,
            lastRun: task.last_run ? new Date(task.last_run) : undefined,
            nextRun: task.next_run ? new Date(task.next_run) : undefined,
            results: task.results ? JSON.parse(task.results) : undefined,
          });
        });
      }
    } catch (error) {
      console.error("Failed to load automation tasks:", error);
    }
  }

  private startScheduler() {
    // Run every minute
    setInterval(() => {
      this.checkAndExecuteTasks();
    }, 60000);
  }

  private async checkAndExecuteTasks() {
    const now = new Date();

    for (const [taskId, task] of this.tasks) {
      if (
        task.enabled &&
        task.nextRun &&
        task.nextRun <= now &&
        task.status !== "running"
      ) {
        await this.executeTask(task);
      }
    }
  }

  async executeTask(task: AutomationTask) {
    try {
      task.status = "running";
      console.log(`🚀 Executing automation: ${task.name}`);

      // Execute the automation based on type
      const result = await this.runAutomation(task);

      // Update task status
      task.status = "completed";
      task.lastRun = new Date();
      task.results = result;

      // Calculate next run
      task.nextRun = this.calculateNextRun(task.schedule);

      // Save to database
      await this.saveTaskResult(task);

      console.log(`✅ Automation completed: ${task.name}`);
    } catch (error) {
      console.error(`❌ Automation failed: ${task.name}`, error);
      task.status = "failed";
      task.results = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async runAutomation(task: AutomationTask): Promise<any> {
    const context: AutomationContext = {
      timestamp: new Date(),
      data: {},
    };

    switch (task.id) {
      case "listing_optimization":
        return await this.optimizeListings(context);

      case "blog_generation":
        return await this.generateBlogContent(context);

      case "email_campaign":
        return await this.runEmailCampaign(context);

      case "market_analysis":
        return await this.analyzeMarket(context);

      case "quality_check":
        return await this.checkListingQuality(context);

      case "social_media":
        return await this.createSocialContent(context);

      default:
        throw new Error(`Unknown automation task: ${task.id}`);
    }
  }

  private async optimizeListings(context: AutomationContext) {
    // Get listings that need optimization
    const listings = await query(`
      SELECT id, title, description, category_id, price
      FROM anunturi
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      AND (title LIKE '%vând%' OR title LIKE '%cumpăr%')
      LIMIT 10
    `);

    const results = [];

    for (const listing of (listings as any) || []) {
      // Ask the model to return a strict JSON result for easier parsing.
      const overridePrompt = `${AUTOMATION_PROMPTS.LISTING_OPTIMIZATION}\n\nIMPORTANT: Return ONLY a valid JSON object with these keys: title, description, hashtags (array), cta. Do NOT include extra commentary.`;

      const optimized = await this.callAI("custom_listing_optimization", {
        prompt: overridePrompt,
        title: listing.title,
        description: listing.description,
        category: listing.category_id,
        price: listing.price,
      });

      // Ensure we have a parsed object (some providers return strings)
      let resultObj: any = optimized;
      if (typeof optimized === "string") {
        try {
          resultObj = JSON.parse(optimized);
        } catch (e) {
          // If parsing fails, fall back to simple heuristics
          resultObj = {
            title: `Optimizat: ${listing.title}`,
            description: optimized,
            hashtags: ["#piataai"],
            cta: "Contactează vânzătorul",
          };
        }
      }

      // Update listing
      await query(
        "UPDATE anunturi SET title = ?, description = ? WHERE id = ?",
        [
          resultObj.title || listing.title,
          resultObj.description || listing.description,
          listing.id,
        ]
      );

      results.push({
        listingId: listing.id,
        originalTitle: listing.title,
        optimizedTitle: optimized.title,
      });
    }

    return { optimizedCount: results.length, results };
  }

  private async generateBlogContent(context: AutomationContext) {
    const topics = [
      "Tendințe în comerțul online din România",
      "Cum să vinzi mai repede pe marketplace-uri",
      "AI în e-commerce: viitorul cumpărăturilor",
      "Sfaturi pentru cumpărători online siguri",
      "Optimizarea listing-urilor pentru mai multe vânzări",
    ];

    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

    const content = await this.callAI("blog_generation", {
      topic: selectedTopic,
    });

    // Save blog post to database
    await query(
      "INSERT INTO blog_posts (title, content, meta_description, slug, published_at) VALUES (?, ?, ?, ?, NOW())",
      [content.title, content.content, content.metaDescription, content.slug]
    );

    return { topic: selectedTopic, title: content.title };
  }

  private async runEmailCampaign(context: AutomationContext) {
    // Get inactive users from last 30 days
    const users = await query(`
      SELECT id, email, name, last_login
      FROM users
      WHERE last_login < DATE_SUB(NOW(), INTERVAL 30 DAY)
      LIMIT 50
    `);

    let sentCount = 0;

    for (const user of (users as any) || []) {
      const emailContent = await this.callAI("email_campaign", {
        campaignType: "reengagement",
        audience: "inactive_users",
        userData: { name: user.name, lastLogin: user.last_login },
      });

      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      sentCount++;
    }

    return { emailsSent: sentCount };
  }

  private async analyzeMarket(context: AutomationContext) {
    // Get market statistics
    const stats = await query(`
      SELECT
        COUNT(*) as totalListings,
        AVG(price) as avgPrice,
        COUNT(DISTINCT category_id) as categoriesCount
      FROM anunturi
      WHERE status = 'active'
    `);

    const categoryStats = await query(`
      SELECT c.name, COUNT(a.id) as count
      FROM categories c
      LEFT JOIN anunturi a ON c.id = a.category_id AND a.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 5
    `);

    const analysis = await this.callAI("market_analysis", {
      totalListings: (stats as any)[0]?.totalListings || 0,
      categories: categoryStats,
      priceRanges: "TBD",
      engagement: "TBD",
    });

    return { analysis, stats: (stats as any)[0], topCategories: categoryStats };
  }

  private async checkListingQuality(context: AutomationContext) {
    // Get recent listings for quality check
    const listings = await query(`
      SELECT id, title, description, price, images
      FROM anunturi
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
      LIMIT 20
    `);

    const results = [];

    for (const listing of (listings as any) || []) {
      const images = listing.images ? JSON.parse(listing.images) : [];
      const qualityCheck = await this.callAI("quality_check", {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        imageCount: images.length,
        category: "TBD",
      });

      results.push({
        listingId: listing.id,
        score: qualityCheck.score,
        recommendations: qualityCheck.recommendations,
      });
    }

    return { checkedCount: results.length, results };
  }

  private async createSocialContent(context: AutomationContext) {
    const platforms = ["facebook", "instagram", "twitter"];
    const contentTypes = ["listing_showcase", "market_trend", "user_tip"];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const contentType =
      contentTypes[Math.floor(Math.random() * contentTypes.length)];

    const topics = [
      "cele mai căutate produse",
      "sfaturi pentru vânzări online",
      "tendințe în e-commerce",
      "succes stories din piață",
    ];

    const topic = topics[Math.floor(Math.random() * topics.length)];

    const content = await this.callAI("social_media", {
      platform,
      contentType,
      topic,
    });

    // Save to social media queue
    await query(
      "INSERT INTO social_media_queue (platform, content, hashtags, scheduled_for) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
      [
        platform,
        content.text,
        JSON.stringify(content.hashtags),
        content.schedule,
      ]
    );

    return { platform, contentType, topic, content: content.text };
  }

  private async callAI(promptType: string, data: any): Promise<any> {
    // Use the shared AI provider wrapper (local Balog/TOON or OpenRouter)

    try {
      const raw = await runPrompt(promptType, data);

      // If provider returned a JSON string, try to parse it
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          return parsed;
        } catch (_) {
          // Not JSON — return raw text for caller to interpret
          return raw;
        }
      }

      return raw;
    } catch (err) {
      console.error("AI provider error:", err);

      // Fallback to previous mocks to keep automation resilient
      const mockResponses = {
        listing_optimization: {
          title: `Optimizat: ${data.title}`,
          description: `Descriere îmbunătățită pentru ${data.title}...`,
          hashtags: ["#piataai", "#romania", "#cumpar", "#vand"],
          cta: "Contactează vânzătorul acum!",
        },

        blog_generation: {
          title: `Ghid complet: ${data.topic}`,
          content: `Conținut detaliat despre ${data.topic}...`,
          metaDescription: `Descoperă totul despre ${data.topic} în România`,
          slug: data.topic.toLowerCase().replace(/\s+/g, "-"),
        },

        email_campaign: {
          subject: "Îți lipsim? Revino în Piata AI!",
          html: "<h1>Bine ai revenit!</h1><p>Descoperă ofertele noi...</p>",
        },

        market_analysis: {
          trends: "Creștere în categoria electronice",
          recommendations: "Focus pe categorii populare",
        },

        quality_check: {
          score: 8,
          recommendations: [
            "Adaugă mai multe imagini",
            "Îmbunătățește descrierea",
          ],
        },

        social_media: {
          text: `Descoperă cele mai bune oferte din ${data.topic}! #PiataAI`,
          hashtags: ["#piataai", "#romania", "#oferte", "#cumparaturi"],
          schedule: "2024-01-01 10:00:00",
        },
      };

      return (
        (mockResponses as any)[promptType] || { error: "Unknown prompt type" }
      );
    }
  }

  private calculateNextRun(schedule: string): Date {
    // Simple scheduling - add hours based on schedule
    const now = new Date();
    const hours = parseInt(schedule) || 24; // Default 24 hours
    now.setHours(now.getHours() + hours);
    return now;
  }

  private async saveTaskResult(task: AutomationTask) {
    await query(
      "UPDATE automation_tasks SET last_run = ?, next_run = ?, status = ?, results = ? WHERE id = ?",
      [
        task.lastRun?.toISOString() || null,
        task.nextRun?.toISOString() || null,
        task.status,
        JSON.stringify(task.results),
        task.id,
      ]
    );
  }

  // Public methods
  async addTask(task: Omit<AutomationTask, "lastRun" | "nextRun" | "status">) {
    const newTask: AutomationTask = {
      ...task,
      status: "idle",
      nextRun: this.calculateNextRun(task.schedule),
    };

    this.tasks.set(task.id, newTask);

    // Save to database
    await query(
      "INSERT INTO automation_tasks (id, name, description, schedule, prompt, enabled, status, next_run) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        task.id,
        task.name,
        task.description,
        task.schedule,
        task.prompt,
        task.enabled,
        "idle",
        newTask.nextRun?.toISOString() || null,
      ]
    );
  }

  getTasks(): AutomationTask[] {
    return Array.from(this.tasks.values());
  }

  async toggleTask(taskId: string, enabled: boolean) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = enabled;
      await query("UPDATE automation_tasks SET enabled = ? WHERE id = ?", [
        enabled,
        taskId,
      ]);
    }
  }
}

// Initialize default tasks if they don't exist
export async function initializeAutomationTasks() {
  try {
    // Check if tasks exist
    const existingTasks = await query(
      "SELECT id FROM automation_tasks LIMIT 1"
    );
    if (Array.isArray(existingTasks) && existingTasks.length === 0) {
      // Insert default tasks
      for (const task of DEFAULT_AUTOMATION_TASKS) {
        await query(
          "INSERT INTO automation_tasks (id, name, description, schedule, prompt, enabled, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            task.id,
            task.name,
            task.description,
            task.schedule,
            task.prompt,
            task.enabled,
            "idle",
          ]
        );
      }
      console.log("✅ Initialized default automation tasks");
    }
  } catch (error) {
    console.error("❌ Failed to initialize automation tasks:", error);
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine();

// Initialize tasks on module load
// Initialize tasks on module load only if not building
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  initializeAutomationTasks();
}

// Default automation tasks
export const DEFAULT_AUTOMATION_TASKS: Omit<
  AutomationTask,
  "lastRun" | "nextRun" | "status" | "results"
>[] = [
  {
    id: "listing_optimization",
    name: "Optimizare Listing-uri",
    description:
      "Optimizează automat titlurile și descrierile listing-urilor vechi",
    schedule: "168", // Every 7 days
    prompt: AUTOMATION_PROMPTS.LISTING_OPTIMIZATION,
    enabled: true,
  },
  {
    id: "blog_generation",
    name: "Generare Conținut Blog",
    description: "Creează articole de blog relevante pentru SEO",
    schedule: "24", // Daily
    prompt: AUTOMATION_PROMPTS.BLOG_CONTENT_GENERATION,
    enabled: true,
  },
  {
    id: "email_campaign",
    name: "Campanii Email",
    description: "Trimite email-uri personalizate utilizatorilor inactivi",
    schedule: "168", // Weekly
    prompt: AUTOMATION_PROMPTS.EMAIL_CAMPAIGN_GENERATION,
    enabled: false,
  },
  {
    id: "market_analysis",
    name: "Analiză de Piață",
    description: "Analizează tendințele pieței și generează rapoarte",
    schedule: "24", // Daily
    prompt: AUTOMATION_PROMPTS.MARKET_ANALYSIS,
    enabled: true,
  },
  {
    id: "quality_check",
    name: "Control Calitate",
    description: "Verifică calitatea listing-urilor noi",
    schedule: "1", // Hourly
    prompt: AUTOMATION_PROMPTS.QUALITY_CHECK,
    enabled: true,
  },
  {
    id: "social_media",
    name: "Conținut Social Media",
    description: "Generează conținut pentru rețelele sociale",
    schedule: "6", // Every 6 hours
    prompt: AUTOMATION_PROMPTS.SOCIAL_MEDIA_POST,
    enabled: false,
  },
];
