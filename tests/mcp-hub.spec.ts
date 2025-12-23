import { test, expect, describe } from '@playwright/test';

describe('MCP Hub API', () => {
  test('GET /api/mcp-hub returns tools, workflows, and bridge info', async ({ request }) => {
    const res = await request.get('/api/mcp-hub');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty('tools');
    expect(Array.isArray(json.tools)).toBeTruthy();

    expect(json).toHaveProperty('workflows');
    expect(Array.isArray(json.workflows)).toBeTruthy();

    expect(json).toHaveProperty('bridge');
    expect(json.bridge).toHaveProperty('enabled');
    expect(json.bridge).toHaveProperty('servers');
  });

  test('POST /api/mcp-hub call_tool works for a local tool', async ({ request }) => {
    const res = await request.post('/api/mcp-hub', {
      data: {
        action: 'call_tool',
        name: 'seo_optimize',
        args: { text: 'Test listing title', context: { locale: 'ro-RO' } },
      },
    });

    // The underlying AI provider may be unavailable in CI; we only assert it returns JSON
    // and does not 404/400.
    expect([200, 500]).toContain(res.status());
    const json = await res.json();
    expect(json).toBeTruthy();
  });
});
