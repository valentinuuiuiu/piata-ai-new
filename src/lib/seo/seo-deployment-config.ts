// SEO Automation Deployment Configuration
import { SEOAutomationConfig } from './seo-automation-orchestrator';

export const DEFAULT_SEO_CONFIG: SEOAutomationConfig = {
  siteInfo: {
    name: 'Piata AI RO',
    domain: 'piata-ai.ro',
    baseUrl: 'https://piata-ai.ro',
    defaultLanguage: 'ro',
    targetCountry: 'RO'
  },
  apiKeys: {
    googleAnalytics: process.env.GOOGLE_ANALYTICS_ID || '',
    googleSearchConsole: process.env.GOOGLE_SEARCH_CONSOLE_ID || '',
    semrush: process.env.SEMRUSH_API_KEY || '',
    ahrefs: process.env.AHREFS_API_KEY || '',
    pagespeed: process.env.PAGESPEED_API_KEY || ''
  },
  automation: {
    contentGeneration: true,
    keywordTracking: true,
    competitorMonitoring: true,
    performanceTracking: true,
    technicalOptimization: true,
    localSEO: true
  },
  schedules: {
    contentGeneration: '0 9 * * 1,3,5', // Monday, Wednesday, Friday at 9 AM
    keywordTracking: '0 */6 * * *', // Every 6 hours
    competitorMonitoring: '0 10 * * *', // Daily at 10 AM
    performanceTracking: '0 8 * * *', // Daily at 8 AM
    technicalOptimization: '0 2 * * 0' // Weekly on Sunday at 2 AM
  },
  targets: {
    trafficGrowth: 25, // 25% growth target
    rankingImprovement: 5, // 5 position improvement target
    conversionRate: 4.5, // 4.5% conversion rate target
    localVisibility: 80 // 80% local visibility target
  }
};

// Deployment Scripts
export const DEPLOYMENT_SCRIPTS = {
  // Content Generation Automation
  contentGeneration: {
    name: 'Content Generation Automation',
    cron: DEFAULT_SEO_CONFIG.schedules.contentGeneration,
    script: `node scripts/seo/content-generation-runner.js`,
    description: 'Automatically generates SEO-optimized content for Romanian marketplace'
  },

  // Keyword Tracking
  keywordTracking: {
    name: 'Keyword Ranking Tracking',
    cron: DEFAULT_SEO_CONFIG.schedules.keywordTracking,
    script: `node scripts/seo/keyword-tracking-runner.js`,
    description: 'Tracks keyword rankings and identifies opportunities'
  },

  // Competitor Monitoring
  competitorMonitoring: {
    name: 'Competitor Analysis & Monitoring',
    cron: DEFAULT_SEO_CONFIG.schedules.competitorMonitoring,
    script: `node scripts/seo/competitor-monitoring-runner.js`,
    description: 'Monitors OLX and eMAG strategies and performance'
  },

  // Performance Tracking
  performanceTracking: {
    name: 'SEO Performance Monitoring',
    cron: DEFAULT_SEO_CONFIG.schedules.performanceTracking,
    script: `node scripts/seo/performance-tracking-runner.js`,
    description: 'Tracks SEO performance metrics and generates reports'
  },

  // Technical Optimization
  technicalOptimization: {
    name: 'Technical SEO Optimization',
    cron: DEFAULT_SEO_CONFIG.schedules.technicalOptimization,
    script: `node scripts/seo/technical-optimization-runner.js`,
    description: 'Runs technical SEO audits and optimizations'
  }
};

// Environment Variables Template
export const ENVIRONMENT_TEMPLATE = `# SEO Automation Environment Variables

# Google Services
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_SEARCH_CONSOLE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAGESPEED_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# SEO Tools APIs
SEMRUSH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AHREFS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MOZ_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI API for Content Generation
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/seo_automation

# Redis for Caching
REDIS_URL=redis://localhost:6379

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@piata-ai.ro
SMTP_PASS=app_password_here

# Monitoring & Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/xxx

# Romanian Market Specific
ROMANIAN_TIMEZONE=Europe/Bucharest
DEFAULT_CURRENCY=RON
DEFAULT_LANGUAGE=ro

# Content Generation Settings
CONTENT_GENERATION_MODEL=gpt-4
MAX_CONTENT_LENGTH=2500
CONTENT_QUALITY_THRESHOLD=85

# Performance Targets
TARGET_TRAFFIC_GROWTH=25
TARGET_RANKING_IMPROVEMENT=5
TARGET_CONVERSION_RATE=4.5
TARGET_LOCAL_VISIBILITY=80
`;

// Package.json Scripts
export const PACKAGE_JSON_SCRIPTS = {
  "seo:init": "node scripts/seo/initialize-seo-system.js",
  "seo:deploy": "node scripts/seo/deploy-seo-automation.js",
  "seo:generate-content": "node scripts/seo/content-generation-runner.js",
  "seo:track-keywords": "node scripts/seo/keyword-tracking-runner.js",
  "seo:monitor-competitors": "node scripts/seo/competitor-monitoring-runner.js",
  "seo:performance": "node scripts/seo/performance-tracking-runner.js",
  "seo:optimize": "node scripts/seo/technical-optimization-runner.js",
  "seo:report": "node scripts/seo/generate-seo-report.js",
  "seo:status": "node scripts/seo/check-seo-system-status.js",
  "seo:health": "node scripts/seo/seo-health-check.js"
};

// Docker Configuration
export const DOCKER_CONFIG = {
  seo_automation: {
    image: 'node:18-alpine',
    working_dir: '/app',
    volumes: [
      './scripts/seo:/app/scripts/seo',
      './src/lib/seo:/app/src/lib/seo',
      './data:/app/data',
      './logs:/app/logs'
    ],
    environment: [
      'NODE_ENV=production',
      'TZ=Europe/Bucharest'
    ],
    command: 'npm run seo:init',
    restart: 'unless-stopped',
    networks: ['seo_network']
  },

  seo_scheduler: {
    image: 'node:18-alpine',
    working_dir: '/app',
    volumes: [
      './scripts/seo:/app/scripts/seo',
      './src/lib/seo:/app/src/lib/seo',
      './data:/app/data'
    ],
    environment: [
      'NODE_ENV=production',
      'TZ=Europe/Bucharest'
    ],
    command: 'npm run seo:deploy',
    restart: 'unless-stopped',
    depends_on: ['seo_automation'],
    networks: ['seo_network']
  }
};

// Nginx Configuration
export const NGINX_CONFIG = `
# SEO Automation API Proxy
server {
    listen 80;
    server_name api.piata-ai.ro;
    
    location /seo/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Cache headers for SEO content
    location ~* .(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
`;

// Database Schema
export const DATABASE_SCHEMA = `
-- SEO Automation Database Schema

-- Content Generation Table
CREATE TABLE seo_content_generations (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_description VARCHAR(160),
    keywords TEXT[],
    status VARCHAR(20) DEFAULT 'draft',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    performance_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keyword Tracking Table
CREATE TABLE seo_keyword_tracking (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    position INTEGER,
    previous_position INTEGER,
    search_volume INTEGER,
    difficulty INTEGER,
    url TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitor Analysis Table
CREATE TABLE seo_competitor_analysis (
    id SERIAL PRIMARY KEY,
    competitor VARCHAR(50) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value TEXT,
    snapshot_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Metrics Table
CREATE TABLE seo_performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_data JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Technical Issues Table
CREATE TABLE seo_technical_issues (
    id SERIAL PRIMARY KEY,
    issue_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    affected_pages TEXT[],
    status VARCHAR(20) DEFAULT 'open',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Local SEO Campaigns Table
CREATE TABLE seo_local_campaigns (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    performance_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Calendar Table
CREATE TABLE seo_content_calendar (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    target_keyword VARCHAR(255),
    scheduled_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    content_id INTEGER REFERENCES seo_content_generations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_seo_content_generations_keyword ON seo_content_generations(keyword);
CREATE INDEX idx_seo_keyword_tracking_keyword ON seo_keyword_tracking(keyword);
CREATE INDEX idx_seo_competitor_analysis_competitor ON seo_competitor_analysis(competitor);
CREATE INDEX idx_seo_performance_metrics_type ON seo_performance_metrics(metric_type);
CREATE INDEX idx_seo_technical_issues_status ON seo_technical_issues(status);
CREATE INDEX idx_seo_local_campaigns_city ON seo_local_campaigns(city);
`;

// Monitoring Configuration
export const MONITORING_CONFIG = {
  alerts: {
    email: {
      enabled: true,
      recipients: ['admin@piata-ai.ro', 'seo@piata-ai.ro'],
      thresholds: {
        organicTrafficDrop: 20, // percentage
        rankingDrop: 10, // positions
        pageSpeedBelow: 70, // score
        technicalErrorsAbove: 50 // count
      }
    },
    slack: {
      enabled: true,
      channel: '#seo-alerts',
      webhookUrl: process.env.SLACK_WEBHOOK_URL
    },
    discord: {
      enabled: false,
      channelId: process.env.DISCORD_CHANNEL_ID
    }
  },
  dashboard: {
    enabled: true,
    refreshInterval: 300000, // 5 minutes
    publicAccess: false,
    metricsRetention: 90 // days
  }
};

// Deployment Checklist
export const DEPLOYMENT_CHECKLIST = [
  {
    item: 'Configure environment variables',
    completed: false,
    description: 'Set up all required API keys and configuration'
  },
  {
    item: 'Setup database',
    completed: false,
    description: 'Create database schema and run migrations'
  },
  {
    item: 'Deploy automation scripts',
    completed: false,
    description: 'Deploy all SEO automation scripts to production'
  },
  {
    item: 'Configure cron jobs',
    completed: false,
    description: 'Set up scheduled tasks for automation components'
  },
  {
    item: 'Setup monitoring',
    completed: false,
    description: 'Configure alerts and dashboard'
  },
  {
    item: 'Test automation runs',
    completed: false,
    description: 'Run manual tests for each automation component'
  },
  {
    item: 'Verify competitor monitoring',
    completed: false,
    description: 'Ensure OLX and eMAG monitoring is working'
  },
  {
    item: 'Validate local SEO campaigns',
    completed: false,
    description: 'Test local SEO campaigns for Romanian cities'
  },
  {
    item: 'Check performance tracking',
    completed: false,
    description: 'Verify all performance metrics are being collected'
  },
  {
    item: 'Generate initial report',
    completed: false,
    description: 'Run first comprehensive SEO performance report'
  }
];

// Success Metrics
export const SUCCESS_METRICS = {
  immediate: {
    automationActive: true,
    contentGenerationWorking: true,
    keywordTrackingActive: true,
    competitorMonitoringActive: true
  },
  shortTerm: {
    organicTrafficIncrease: 15, // percentage within 30 days
    keywordRankingImprovement: 3, // average position improvement
    technicalSEOIssuesResolved: 80, // percentage
    contentGenerated: 50, // pieces per month
    localSEOCampaignsActive: 5 // Romanian cities
  },
  longTerm: {
    organicTrafficIncrease: 50, // percentage within 90 days
    keywordRankingImprovement: 8, // average position improvement
    conversionRateIncrease: 25, // percentage
    marketShareIncrease: 3, // percentage points
    localVisibilityIncrease: 60 // percentage
  }
};

// Export configuration
export const SEO_DEPLOYMENT_CONFIG = {
  DEFAULT_SEO_CONFIG,
  DEPLOYMENT_SCRIPTS,
  ENVIRONMENT_TEMPLATE,
  PACKAGE_JSON_SCRIPTS,
  DOCKER_CONFIG,
  NGINX_CONFIG,
  DATABASE_SCHEMA,
  MONITORING_CONFIG,
  DEPLOYMENT_CHECKLIST,
  SUCCESS_METRICS
};