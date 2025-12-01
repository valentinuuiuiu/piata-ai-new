import { test, expect } from '@playwright/test';

test('Verify ads are displayed correctly with full browser monitoring', async ({ page }) => {
  // Listen for console logs
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Listen for network requests
  const networkRequests: any[] = [];
  page.on('request', (request) => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
    });
  });

  // Listen for network responses
  const networkResponses: any[] = [];
  page.on('response', (response) => {
    networkResponses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
    });
  });

  // Navigate to the live site
  await page.goto('https://piata-ai.ro');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check if ads are displayed on the page
  // Look for elements that might contain ads
  const pageContent = await page.content();
  expect(pageContent).toContain('Test bike for sale');
  expect(pageContent).toContain('Test piano lessons');
  expect(pageContent).toContain('Test sofa free pickup');

  // Make a direct API call to verify the ads
  const response = await page.request.get('https://piata-ai.ro/api/anunturi');
  
  // Log the response status and headers for debugging
  console.log(`Response status: ${response.status()}`);
  console.log(`Response headers:`, response.headers());
  
  // Check if the response is OK
  expect(response.ok(), `API request failed with status ${response.status()}`).toBeTruthy();

  const ads = await response.json();
  expect(Array.isArray(ads)).toBeTruthy();

  // Log the number of ads found
  console.log(`Found ${ads.length} ads in the response`);

  // Check if we have at least the 3 ads we created
  expect(ads.length).toBeGreaterThanOrEqual(3);

  // Check for the specific ads we created
  const testBikeAd = ads.find((ad: any) => ad.title === 'Test bike for sale');
  const testPianoAd = ads.find((ad: any) => ad.title === 'Test piano lessons');
  const testSofaAd = ads.find((ad: any) => ad.title === 'Test sofa free pickup');

  // Log what we found
  console.log('Test bike ad:', testBikeAd);
  console.log('Test piano ad:', testPianoAd);
  console.log('Test sofa ad:', testSofaAd);

  // Verify that the ads exist
  expect(testBikeAd, 'Test bike ad should exist').toBeDefined();
  expect(testPianoAd, 'Test piano ad should exist').toBeDefined();
  expect(testSofaAd, 'Test sofa ad should exist').toBeDefined();

  // Verify ad properties if they exist
  if (testBikeAd) {
    expect(testBikeAd.title).toBe('Test bike for sale');
    expect(testBikeAd.description).toContain('bicycle');
    expect(testBikeAd.price).toBe(120);
    expect(testBikeAd.location).toBe('București');
  }

  if (testPianoAd) {
    expect(testPianoAd.title).toBe('Test piano lessons');
    expect(testPianoAd.description).toContain('piano');
    expect(testPianoAd.price).toBe(30);
    expect(testPianoAd.location).toBe('Cluj-Napoca');
  }

  if (testSofaAd) {
    expect(testSofaAd.title).toBe('Test sofa free pickup');
    expect(testSofaAd.description).toContain('sofa');
    expect(testSofaAd.price).toBe(0);
    expect(testSofaAd.location).toBe('Iași');
  }

  // Check for console errors
  const errorLogs = consoleLogs.filter(log => log.includes('[error]') || log.includes('[Error]') || log.includes('Error'));
  console.log('Console error logs:', errorLogs);
  expect(errorLogs).toHaveLength(0);

  // Print console logs for debugging
  console.log('All console logs:', consoleLogs);
  console.log('Network requests:', networkRequests);
  console.log('Network responses:', networkResponses);
  
  // Print the ads for verification
  console.log('Found ads:', ads.map((ad: any) => ({ id: ad.id, title: ad.title, price: ad.price, location: ad.location })));

  // Check that the API request for ads was made
  const apiRequest = networkRequests.find(req => req.url.includes('/api/anunturi') && req.method === 'GET');
  expect(apiRequest, 'API request for anunturi should be made').toBeDefined();

  // Check that the API response was successful
  const apiResponse = networkResponses.find(res => res.url.includes('/api/anunturi') && res.status === 200);
  expect(apiResponse, 'API response for anunturi should be successful').toBeDefined();
});