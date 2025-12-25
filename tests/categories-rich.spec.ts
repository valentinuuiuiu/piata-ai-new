import { test, expect } from '@playwright/test';

test('GET /api/categories?format=rich returns categories and subcategories', async ({ request }) => {
  const res = await request.get('/api/categories?format=rich');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();

  expect(Array.isArray(json.categories)).toBeTruthy();
  expect(Array.isArray(json.subcategories)).toBeTruthy();
});
