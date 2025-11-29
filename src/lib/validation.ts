/**
 * Input Validation and Sanitization Utilities
 * Security-focused validation for Piata AI
 */

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string()
  .email('Adresa de email invalidă')
  .max(255, 'Adresa de email prea lungă')
  .transform(email => email.toLowerCase().trim());

export const passwordSchema = z.string()
  .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
  .max(128, 'Parola prea lungă')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Parola trebuie să conțină litere mari, mici și cifre');

export const nameSchema = z.string()
  .min(2, 'Numele trebuie să aibă cel puțin 2 caractere')
  .max(100, 'Numele prea lung')
  .regex(/^[a-zA-ZăâîșțĂÂÎȘȚ\s-]+$/, 'Numele conține caractere invalide')
  .transform(name => name.trim());

export const phoneSchema = z.string()
  .regex(/^(\+40|0)[0-9]{9}$/, 'Număr de telefon invalid (format: +40xxxxxxxxx sau 0xxxxxxxxx)')
  .transform(phone => phone.replace(/\s+/g, ''));

export const titleSchema = z.string()
  .min(5, 'Titlul trebuie să aibă cel puțin 5 caractere')
  .max(200, 'Titlul prea lung')
  .transform(title => title.trim());

export const descriptionSchema = z.string()
  .min(10, 'Descrierea trebuie să aibă cel puțin 10 caractere')
  .max(5000, 'Descrierea prea lungă')
  .transform(desc => desc.trim());

export const priceSchema = z.number()
  .positive('Prețul trebuie să fie pozitiv')
  .max(999999.99, 'Preț prea mare');

export const urlSchema = z.string()
  .url('URL invalid')
  .max(2048, 'URL prea lung');

export const categoryIdSchema = z.number()
  .int('ID categorie invalid')
  .positive('ID categorie invalid');

export const locationSchema = z.string()
  .min(2, 'Locația trebuie să aibă cel puțin 2 caractere')
  .max(100, 'Locație prea lungă')
  .transform(loc => loc.trim());

// Sanitization functions
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

export function sanitizeSql(input: string): string {
  // Basic SQL injection prevention
  return input.replace(/['";\\]/g, '');
}

// Type definitions for validation functions
export interface ListingInput {
  title: string;
  description: string;
  price: string | number;
  categoryId: number;
  subcategoryId?: number;
  location?: string;
  contactEmail?: string;
  phone?: string;
  images?: string[];
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function validateAndSanitizeListing(data: ListingInput) {
  const schema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    price: z.union([z.string(), z.number()]).transform(val =>
      typeof val === 'string' ? parseFloat(val) : val
    ).pipe(priceSchema),
    categoryId: categoryIdSchema,
    subcategoryId: categoryIdSchema.optional(),
    location: locationSchema.optional(),
    contactEmail: emailSchema.optional(),
    phone: phoneSchema.optional(),
    images: z.array(urlSchema).max(10, 'Maximum 10 imagini permise').optional(),
  });

  try {
    const validated = schema.parse(data);

    // Additional sanitization
    return {
      ...validated,
      title: sanitizeHtml(validated.title),
      description: sanitizeHtml(validated.description),
      location: validated.location ? sanitizeHtml(validated.location) : undefined,
    };
  } catch (error: any) {
    console.error('Validation error:', error.errors);
    throw error;
  }
}

export function validateAndSanitizeUser(data: UserInput) {
  const schema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema.optional(),
  });

  const validated = schema.parse(data);

  return {
    ...validated,
    name: sanitizeHtml(validated.name),
  };
}

export function validateAndSanitizeContact(data: ContactInput) {
  const schema = z.object({
    name: nameSchema,
    email: emailSchema,
    subject: z.string().min(5, 'Subiectul trebuie să aibă cel puțin 5 caractere').max(200, 'Subiect prea lung'),
    message: z.string().min(10, 'Mesajul trebuie să aibă cel puțin 10 caractere').max(2000, 'Mesaj prea lung'),
  });

  const validated = schema.parse(data);

  return {
    ...validated,
    subject: sanitizeHtml(validated.subject),
    message: sanitizeHtml(validated.message),
  };
}

// Rate limiting helper
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export singleton rate limiter
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute