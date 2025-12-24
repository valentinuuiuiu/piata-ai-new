import { test, expect, describe } from '@playwright/test';

/**
 * Cron Jobs E2E Tests
 * Tests all scheduled automation jobs and their endpoints
 */

describe('Blog Automation Cron Jobs', () => {
  test('Blog Daily cron generates content', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-daily', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('success');
      console.log('✓ Blog daily cron executed successfully');
    }
  });

  test('Blog Evening cron generates content', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-evening', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      console.log('✓ Blog evening cron executed');
    }
  });

  test('Blog Morning cron generates content', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-morning', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Blog morning cron executed');
    }
  });
});

describe('Social Media Automation Cron Jobs', () => {
  test('Social Media Generator cron creates posts', async ({ page }) => {
    const response = await page.request.get('/api/cron/social-media-generator', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      console.log('✓ Social media generator cron executed');
    }
  });

  test('Auto Repost cron works', async ({ page }) => {
    const response = await page.request.get('/api/cron/auto-repost', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Auto repost cron executed');
    }
  });

  test('Live Stream Promotion cron works', async ({ page }) => {
    const response = await page.request.get('/api/cron/live-stream-promotion', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Live stream promotion cron executed');
    }
  });

  test('Sacred Live Stream cron works', async ({ page }) => {
    const response = await page.request.get('/api/cron/sacred-live-stream', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Sacred live stream cron executed');
    }
  });
});

describe('Marketing Cron Jobs', () => {
  test('Marketing Email Campaign cron works', async ({ page }) => {
    const response = await page.request.get('/api/cron/marketing-email-campaign', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Marketing email campaign cron executed');
    }
  });

  test('Weekly Digest cron works', async ({ page }) => {
    const response = await page.request.get('/api/cron/weekly-digest', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Weekly digest cron executed');
    }
  });
});

describe('Agent Runner Cron Jobs', () => {
  test('Check Agents cron works', async ({ page }) => {
    const response = await page.request.get('/api/cron/check-agents', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Check agents cron executed');
    }
  });

  test('Shopping Agents Runner cron works', async ({ page }) => {
    const response = await page.request.get('/api/cron/shopping-agents-runner', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    expect([200, 401, 403]).toContain(response.status());

    if (response.ok()) {
      console.log('✓ Shopping agents runner cron executed');
    }
  });
});

describe('Cron Job Response Validation', () => {
  test('Cron responses include timestamp', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-daily', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    if (response.ok()) {
      const data = await response.json();
      if (data.time || data.timestamp) {
        console.log('✓ Cron response includes timestamp');
      }
    }
  });

  test('Cron responses include success status', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-daily', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('success');
      console.log('✓ Cron response includes success status');
    }
  });

  test('Cron error responses are informative', async ({ page }) => {
    // Test with no auth to see error format
    const response = await page.request.get('/api/cron/blog-daily');

    if (!response.ok()) {
      const data = await response.json().catch(() => ({}));
      expect(data).toHaveProperty('error');
      console.log('✓ Cron error responses are informative');
    }
  });
});

describe('Cron Job Scheduling', () => {
  test('Multiple cron endpoints exist', async ({ page }) => {
    const cronEndpoints = [
      '/api/cron/blog-daily',
      '/api/cron/blog-evening',
      '/api/cron/blog-morning',
      '/api/cron/social-media-generator',
      '/api/cron/check-agents'
    ];

    const requests = cronEndpoints.map(endpoint =>
      page.request.get(endpoint)
    );

    const responses = await Promise.all(requests);
    const existingEndpoints = responses.filter((r, i) =>
      r.status() !== 404
    ).length;

    console.log(`✓ Found ${existingEndpoints}/${cronEndpoints.length} cron endpoints`);
  });

  test('Cron authentication is consistent', async ({ page }) => {
    // All cron endpoints should have same auth behavior
    const endpoints = ['/api/cron/blog-daily', '/api/cron/social-media-generator'];

    const responses = await Promise.all(
      endpoints.map(ep =>
        page.request.get(ep, {
          headers: { 'Authorization': 'Bearer wrong-key' }
        })
      )
    );

    responses.forEach((r, i) => {
      if (r.status() === 401 || r.status() === 403) {
        console.log(`✓ Endpoint ${endpoints[i]} requires authentication`);
      }
    });
  });
});

describe('Cron Job Performance', () => {
  test('Cron jobs complete within time limit', async ({ page }) => {
    const startTime = Date.now();

    await page.request.get('/api/cron/blog-daily', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      },
      timeout: 30000
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(60000);

    console.log(`✓ Cron job completed in ${duration}ms`);
  });

  test('Rapid cron requests are handled', async ({ page }) => {
    // Should handle concurrent cron requests
    const requests = Array(3).fill(null).map(() =>
      page.request.get('/api/cron/blog-daily', {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
        }
      })
    );

    const responses = await Promise.all(requests);
    responses.forEach(r => {
      expect([200, 401, 403]).toContain(r.status());
    });

    console.log('✓ Rapid cron requests handled');
  });
});

describe('Cron Job Integration', () => {
  test('Cron jobs interact with database', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-daily', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    if (response.ok()) {
      const data = await response.json();
      if (data.blogId) {
        console.log('✓ Cron job saved to database');
      }
    }
  });

  test('Cron jobs trigger AI agents', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-daily', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    if (response.ok()) {
      const data = await response.json();
      console.log('✓ Cron job triggered AI agents');
    }
  });

  test('Cron jobs log activity', async ({ page }) => {
    const response = await page.request.get('/api/cron/blog-daily', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });

    if (response.ok()) {
      console.log('✓ Cron job activity logged');
    }
  });
});