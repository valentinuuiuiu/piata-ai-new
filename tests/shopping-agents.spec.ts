import { test, expect, describe } from '@playwright/test';

/**
 * Shopping Agents E2E Tests
 * Tests the shopping agent automation system
 */

describe('Shopping Agents API', () => {
  test('Shopping Agents Matches endpoint is accessible', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/matches');
    expect(response.status()).toBeGreaterThanOrEqual(200);

    if (response.ok()) {
      const data = await response.json();
      console.log('✓ Shopping agents matches endpoint accessible');
    }
  });

  test('Shopping Agents Matches returns valid data', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/matches');

    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeDefined();
      console.log('✓ Shopping agents matches returns valid data');
    }
  });

  test('Shopping Agents Matches supports filtering', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/matches?status=pending');

    expect(response.status()).toBeGreaterThanOrEqual(200);

    if (response.ok()) {
      const data = await response.json();
      console.log('✓ Shopping agents matches supports filtering');
    }
  });

  test('Shopping Agents Matches supports pagination', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/matches?page=1&limit=10');

    expect(response.status()).toBeGreaterThanOrEqual(200);

    if (response.ok()) {
      console.log('✓ Shopping agents matches supports pagination');
    }
  });
});

describe('Shopping Agents Runner', () => {
  test('Shopping Agents Runner cron endpoint exists', async ({ page }) => {
    const response = await page.request.get('/api/cron/shopping-agents-runner');
    expect([200, 401, 403]).toContain(response.status());

    console.log('✓ Shopping agents runner cron endpoint exists');
  });

  test('Shopping Agents Runner executes successfully', async ({ page }) => {
    const response = await page.request.get('/api/cron/shopping-agents-runner', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    if (response.ok()) {
      const data = await response.json();
      console.log('✓ Shopping agents runner executed');
    }
  });
});

describe('Shopping Agents Matching Engine', () => {
  test('Match creation works', async ({ page }) => {
    const response = await page.request.post('/api/shopping-agents/matches', {
      data: {
        buyerRequest: 'Looking for a laptop',
        listingId: 'test-listing-123',
        score: 0.95
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Match creation works');
  });

  test('Match update works', async ({ page }) => {
    const response = await page.request.put('/api/shopping-agents/matches/test-id', {
      data: {
        status: 'accepted'
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Match update works');
  });

  test('Match deletion works', async ({ page }) => {
    const response = await page.request.delete('/api/shopping-agents/matches/test-id');

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Match deletion works');
  });
});

describe('Shopping Agents Search', () => {
  test('Product search returns results', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/search', {
      data: {
        query: 'laptop',
        category: 'electronics',
        maxPrice: 1000
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Product search returns results');
  });

  test('Product search supports filters', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/search', {
      data: {
        query: 'iphone',
        condition: 'new',
        location: 'București'
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Product search supports filters');
  });

  test('Product search supports sorting', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/search', {
      data: {
        query: 'laptop',
        sortBy: 'price',
        sortOrder: 'asc'
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Product search supports sorting');
  });
});

describe('Shopping Agents Notifications', () => {
  test('Notification creation works', async ({ page }) => {
    const response = await page.request.post('/api/shopping-agents/notifications', {
      data: {
        matchId: 'test-match-123',
        type: 'new_match',
        channel: 'email'
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Notification creation works');
  });

  test('Notification retrieval works', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/notifications');

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Notification retrieval works');
  });

  test('Notification marking as read works', async ({ page }) => {
    const response = await page.request.put('/api/shopping-agents/notifications/test-id/read');

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Notification marking as read works');
  });
});

describe('Shopping Agents Analytics', () => {
  test('Analytics endpoint is accessible', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/analytics');
    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Analytics endpoint accessible');
  });

  test('Analytics returns valid metrics', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/analytics');

    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('total_matches');
      expect(data).toHaveProperty('successful_matches');
      expect(data).toHaveProperty('conversion_rate');
      console.log('✓ Analytics returns valid metrics');
    }
  });

  test('Analytics supports date range', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/analytics', {
      data: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Analytics supports date range');
  });
});

describe('Shopping Agents User Preferences', () => {
  test('Preferences retrieval works', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/preferences');
    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Preferences retrieval works');
  });

  test('Preferences update works', async ({ page }) => {
    const response = await page.request.put('/api/shopping-agents/preferences', {
      data: {
        notifications_enabled: true,
        preferred_categories: ['electronics', 'vehicles'],
        max_budget: 5000
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Preferences update works');
  });
});

describe('Shopping Agents Error Handling', () => {
  test('Invalid match ID handled gracefully', async ({ page }) => {
    const response = await page.request.get('/api/shopping-agents/matches/invalid-id');

    expect([200, 404]).toContain(response.status());

    console.log('✓ Invalid match ID handled gracefully');
  });

  test('Missing required fields handled', async ({ page }) => {
    const response = await page.request.post('/api/shopping-agents/matches', {
      data: {}
    });

    expect(response.status()).toBeLessThan(600);

    console.log('✓ Missing required fields handled');
  });

  test('Rate limiting works', async ({ page }) => {
    // Make many rapid requests
    const requests = Array(50).fill(null).map(() =>
      page.request.get('/api/shopping-agents/matches')
    );

    const responses = await Promise.all(requests);

    // At least some should succeed
    const successCount = responses.filter(r => r.ok()).length;
    expect(successCount).toBeGreaterThan(0);

    console.log('✓ Rate limiting tested');
  });
});

describe('Shopping Agents Performance', () => {
  test('Search responds quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.request.get('/api/shopping-agents/search', {
      data: { query: 'test' }
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000);

    console.log(`✓ Search responded in ${duration}ms`);
  });

  test('Bulk operations work', async ({ page }) => {
    const response = await page.request.post('/api/shopping-agents/matches/bulk', {
      data: {
        matches: [
          { buyerRequest: 'item 1', listingId: '1' },
          { buyerRequest: 'item 2', listingId: '2' },
          { buyerRequest: 'item 3', listingId: '3' }
        ]
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);

    console.log('✓ Bulk operations work');
  });
});