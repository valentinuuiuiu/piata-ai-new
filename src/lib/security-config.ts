/**
 * Security Configuration for Piata AI RO
 * 
 * This file contains security utilities and configurations
 * to prevent common vulnerabilities in web applications.
 */

import { NextRequest } from 'next/server';

/**
 * Security headers to be applied to all responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.supabase.co;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: *.stripe.com *.supabase.co;
    font-src 'self';
    connect-src 'self' api.openai.com *.stripe.com *.supabase.co;
    frame-src *.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' *.stripe.com;
  `.replace(/\s+/g, ' ').trim(),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, (match) => {
      return match === '<' ? '<' : '>';
    })
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Prea multe cereri. Vă rugăm să așteptați 15 minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Password validation
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Parola trebuie să aibă cel puțin 6 caractere');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o literă mică');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o literă mare');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o cifră');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if request is from a bot
 */
export function isBotRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /curl/i,
    /wget/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate structured data for XSS
 */
export function validateStructuredData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const jsonStr = JSON.stringify(data);
  
  // Check for dangerous content
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onmouseover=/gi
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(jsonStr));
}

/**
 * Sanitize structured data
 */
export function sanitizeStructuredData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeStructuredData);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeStructuredData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): void {
  const required = [
    'DB_HOST',
    'DB_USER', 
    'DB_PASS',
    'DB_NAME',
    'NEXTAUTH_SECRET',
    'OPENROUTER_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default {
  securityHeaders,
  sanitizeInput,
  isValidEmail,
  rateLimitConfig,
  validatePassword,
  isBotRequest,
  generateSecureToken,
  validateStructuredData,
  sanitizeStructuredData,
  isProduction,
  validateEnvironment
};