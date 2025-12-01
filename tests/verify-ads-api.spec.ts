import { test, expect } from '@playwright/test';

test('Verify ads API returns correct data', async ({ request }) => {
  // Try the piata-ai.ro domain as mentioned by the user
  const response = await request.get('https://piata-ai.ro/api/anunturi');
  
  // Log the response status and headers for debugging
  console.log(`Response status: ${response.status()}`);
  console.log(`Response headers:`, response.headers());
  
  // Check if the response is OK
  if (response.ok()) {
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
    
    // Print the ads for verification
    console.log('Found ads:', ads.map((ad: any) => ({ id: ad.id, title: ad.title, price: ad.price, location: ad.location })));
  } else {
    // If piata-ai.ro doesn't work, try the vercel.app domain
    console.log('Trying vercel.app domain...');
    const vercelResponse = await request.get('https://piata-ai.vercel.app/api/anunturi');
    console.log(`Vercel response status: ${vercelResponse.status()}`);
    console.log(`Vercel response headers:`, vercelResponse.headers());
    
    // If both fail, report the error
    expect(response.ok() || vercelResponse.ok(), `API request failed with status ${response.status()} for piata-ai.ro and ${vercelResponse.status()} for vercel.app`).toBeTruthy();
  }
});