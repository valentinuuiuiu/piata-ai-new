/**
 * Security utilities for preventing XSS and other vulnerabilities
 */

/**
 * Safely stringify JSON for use in script tags
 * Prevents XSS by properly escaping JSON content
 */
export function safeJsonScript(jsonData: any): string {
  const jsonString = JSON.stringify(jsonData);
  // Escape any </script> tags that might break out of the script tag
  return jsonString.replace(/<\//g, '\\u003c/');
}

/**
 * Validate and sanitize structured data
 */
export function validateStructuredData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for potentially dangerous properties
  const jsonStr = JSON.stringify(data);
  if (jsonStr.includes('<script') || jsonStr.includes('javascript:')) {
    console.warn('Potentially dangerous content in structured data');
    return false;
  }
  
  return true;
}