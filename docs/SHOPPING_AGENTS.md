# Shopping Agents - AI-Powered Marketplace Monitoring

## Overview

The Shopping Agents system is an AI-powered feature that automatically monitors multiple marketplaces (Publi24, OLX, Autovit) for listings that match user-defined criteria. Each agent uses web browsing subagents with Puppeteer to scrape real listings and applies intelligent matching algorithms.

## Architecture

### Core Components

1. **Shopping Agent API** (`/api/shopping-agents/`)
   - Create, read, update, and delete shopping agents
   - Run agents manually
   - Fetch agent matches

2. **Web Browsing Subagents** (`src/lib/web-browsing-subagents.ts`)
   - Puppeteer-based web scrapers for different marketplaces
   - Automatic pagination and filtering
   - Robust error handling

3. **Shopping Agent Runner** (`src/lib/shopping-agent-runner.ts`)
   - Orchestrates multiple subagents
   - Filters and processes scraped listings
   - Stores matches in database

4. **Database Triggers** (`supabase/migrations/008_shopping_agent_triggers.sql`)
   - Automatic matching when new listings are created
   - Intelligent match scoring algorithm
   - RLS-protected data access

5. **Frontend UI** (`src/app/shopping-agents/page.tsx`)
   - Create and manage shopping agents
   - View matches and agent statistics
   - Run agents manually

## Features

### 🤖 AI-Powered Matching
- Intelligent match scoring based on price, description, images, and keywords
- Automatic filtering based on user-defined criteria
- Smart duplicate detection

### 🌐 Multi-Marketplace Support
- **Publi24**: General marketplace listings
- **OLX**: Second-hand goods and services
- **Autovit**: Vehicle listings

### 🔄 Automatic Monitoring
- Database triggers automatically check new listings against active agents
- Manual agent execution for on-demand searches
- Real-time match notifications

### 🛡️ Security & Privacy
- Row Level Security (RLS) ensures users only see their own agents
- Secure API endpoints with authentication
- Protected database access

## Database Schema

### Shopping Agents Table
```sql
CREATE TABLE shopping_agents (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  matches_found INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Agent Matches Table
```sql
CREATE TABLE agent_matches (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES shopping_agents(id),
  listing_id BIGINT NOT NULL REFERENCES anunturi(id),
  match_score INTEGER NOT NULL, -- 0-100
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, listing_id)
);
```

## API Endpoints

### Shopping Agents Management

#### GET /api/shopping-agents
Get all shopping agents for the current user.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": "user-uuid",
    "name": "Car Finder",
    "description": "Finds cars under 10000 RON",
    "filters": {
      "keywords": ["car", "vehicle"],
      "minPrice": 1000,
      "maxPrice": 10000,
      "location": "Bucharest"
    },
    "is_active": true,
    "matches_found": 5,
    "last_checked_at": "2024-11-30T10:30:00Z"
  }
]
```

#### POST /api/shopping-agents
Create a new shopping agent.

**Request Body:**
```json
{
  "name": "Car Finder",
  "description": "Finds cars under 10000 RON",
  "filters": {
    "keywords": ["car", "vehicle"],
    "minPrice": 1000,
    "maxPrice": 10000,
    "location": "Bucharest"
  },
  "user_id": "user-uuid"
}
```

#### POST /api/shopping-agents/run
Run a specific shopping agent.

**Request Body:**
```json
{
  "agentId": 1,
  "forceRun": false
}
```

**Response:**
```json
{
  "success": true,
  "agentId": 1,
  "matches": [...],
  "subagentResults": [...],
  "totalListingsScanned": 150,
  "newMatches": 3,
  "timestamp": "2024-11-30T10:30:00Z"
}
```

### Agent Matches

#### GET /api/shopping-agents/matches?agentId=1
Get all matches for a specific agent.

#### POST /api/shopping-agents/matches/mark-notified
Mark specific matches as notified.

## Configuration

### Environment Variables
```bash
# OpenRouter API for PAI assistant
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="x-ai/grok-4-fast"

# XAI API for direct Grok access
XAI_API_KEY="your-xai-api-key"

# Puppeteer configuration
PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
```

### Supabase Setup
1. Run the migration: `supabase/migrations/008_shopping_agent_triggers.sql`
2. Enable RLS on `shopping_agents` and `agent_matches` tables
3. Create RLS policies for user access control

## Usage Examples

### Creating a Shopping Agent
```javascript
const agent = {
  name: "Car Finder",
  description: "Finds used cars in Bucharest",
  filters: {
    keywords: ["car", "vehicle", "automobile"],
    minPrice: 5000,
    maxPrice: 15000,
    location: "Bucharest"
  }
};

const response = await fetch('/api/shopping-agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(agent)
});
```

### Running an Agent
```javascript
const response = await fetch('/api/shopping-agents/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agentId: 1 })
});

const result = await response.json();
console.log(`Found ${result.newMatches} new matches!`);
```

## Web Browsing Subagents

### Supported Marketplaces

1. **Publi24**
   - General marketplace
   - Selector-based scraping
   - Automatic pagination

2. **OLX**
   - Second-hand goods
   - Advanced filtering
   - Location-based searches

3. **Autovit**
   - Vehicle listings
   - Detailed car information
   - Price history tracking

### Subagent Configuration
```javascript
const config = {
  name: 'publi24-scraper',
  source: 'Publi24',
  baseUrl: 'https://www.publi24.ro/adaugate',
  selectors: {
    listings: '.announcement-item',
    title: '.announcement-title',
    price: '.announcement-price',
    description: '.announcement-description',
    location: '.announcement-location',
    image: '.announcement-image img',
    link: '.announcement-link'
  },
  pagination: {
    nextButton: '.pagination-next',
    maxPages: 5
  }
};
```

## Match Scoring Algorithm

The system uses a sophisticated scoring algorithm that considers:

1. **Price Factors** (0-30 points)
   - Price range matching
   - Price competitiveness

2. **Keyword Matching** (0-15 points)
   - Title keyword matches
   - Description relevance

3. **Content Quality** (0-15 points)
   - Description length and detail
   - Image presence and quantity

4. **Location Matching** (0-10 points)
   - Geographic proximity
   - Location specificity

5. **Base Score** (50 points)
   - Starting score for all listings

**Total Score Range: 0-100**

## Performance Considerations

### Web Scraping
- Puppeteer runs in headless mode for speed
- Automatic timeout handling (30 seconds per page)
- Concurrent subagent execution
- Maximum 5 pages per marketplace

### Database Optimization
- Indexed foreign keys for fast lookups
- RLS policies for security without performance impact
- Efficient JSONB queries for filter matching

### Caching
- Consider implementing Redis for:
  - Agent configuration caching
  - Listing deduplication
  - Match history

## Security

### Row Level Security (RLS)
- Users can only access their own agents
- Match data is isolated by user
- Admin access for system management

### Input Validation
- All API inputs are validated
- SQL injection protection via parameterized queries
- XSS protection for scraped content

### Rate Limiting
- Consider implementing rate limiting on API endpoints
- Puppeteer concurrency limits to avoid overwhelming target sites

## Monitoring & Debugging

### Logging
- Structured logging for all operations
- Error tracking for failed scrapes
- Performance metrics for agent execution

### Metrics
- Agent success rate
- Match quality scores
- Scraping performance (pages/minute)

### Debug Mode
Enable debug logging:
```javascript
process.env.DEBUG = 'shopping-agents:*';
```

## Future Enhancements

### Planned Features
1. **Email Notifications** - Notify users of new matches
2. **Mobile App Integration** - Push notifications for matches
3. **Advanced AI Matching** - Use OpenRouter models for smarter matching
4. **Price Trend Analysis** - Historical price tracking
5. **Image Recognition** - AI-powered image analysis for quality scoring

### Additional Marketplaces
- Mobile.de (German car marketplace)
- OLX Poland
- Locanto Romania
- Gumtree

## Troubleshooting

### Common Issues

1. **Puppeteer Timeout**
   - Increase timeout values
   - Check network connectivity
   - Verify target site accessibility

2. **Selector Changes**
   - Update selectors in subagent configs
   - Test selectors manually
   - Monitor target site changes

3. **Database Performance**
   - Add indexes for frequently queried columns
   - Monitor query performance
   - Consider partitioning for large datasets

### Debug Commands
```bash
# Test shopping agents
node scripts/test-shopping-agents.js

# Check database triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%agent%';

# Monitor agent matches
SELECT * FROM agent_matches ORDER BY created_at DESC LIMIT 10;
```

## Contributing

1. Add new marketplace configurations to `SUBAGENT_CONFIGS`
2. Update the scraping logic for new site structures
3. Add tests for new functionality
4. Update documentation for any changes

## License

This feature is part of the Piata AI RO project and follows the same license terms.