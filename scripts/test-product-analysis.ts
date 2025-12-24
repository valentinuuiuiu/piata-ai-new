
import { analyzeProductUrl } from '../src/app/services/geminiService';

const url = process.argv[2] || 'https://www.olx.ro/oferte/q-iphone-13/'; 

async function main() {
  console.log(`Testing product analysis for: ${url}`);
  try {
    const result = await analyzeProductUrl(url);
    console.log('---------------------------------------------------');
    console.log('GEMINI MARKET INTELLIGENCE REPORT');
    console.log('---------------------------------------------------');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
