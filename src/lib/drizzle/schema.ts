import { pgTable, integer, varchar, text, decimal, timestamp, jsonb, boolean, serial } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Matches Supabase Auth UUID
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  password: varchar('password', { length: 255 }), // Optional now

  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  icon: varchar('icon', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});


export const anunturi = pgTable('anunturi', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 12, scale: 2 }),
  location: varchar('location', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  images: jsonb('images').$type<string[] | null>(),
  status: varchar('status', { length: 20 }).default('active'),
  isPremium: boolean('is_premium').default(false),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const creditPackages = pgTable('credit_packages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  credits: integer('credits').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  isActive: boolean('is_active').default(true),
});


export const creditsTransactions = pgTable('credits_transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  packageId: integer('package_id').references(() => creditPackages.id),
  amount: integer('credits_amount').notNull(),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  status: varchar('status', { length: 20 }).default('pending'),
  amountEur: decimal('amount_eur', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = InferSelectModel<typeof users>;
export type Anunt = InferSelectModel<typeof anunturi>;
export type CreditPackage = InferSelectModel<typeof creditPackages>;
export type CreditTransaction = InferSelectModel<typeof creditsTransactions>;

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  creditsBalance: integer('credits_balance').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const listingBoosts = pgTable('listing_boosts', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').references(() => anunturi.id, { onDelete: 'cascade' }).notNull(),
  boostType: varchar('boost_type', { length: 20 }).notNull(),
  startsAt: timestamp('starts_at').defaultNow(),
  durationDays: integer('duration_days').notNull(),
  isActive: boolean('is_active').default(true),
  autoRepost: boolean('auto_repost').default(false),
  paymentId: varchar('payment_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type UserProfile = InferSelectModel<typeof userProfiles>;
export type ListingBoost = InferSelectModel<typeof listingBoosts>;

// Shopping Agents - AI-powered listing monitoring
export const shoppingAgents = pgTable('shopping_agents', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  filters: jsonb('filters').$type<{
    category?: string;
    priceMin?: number;
    priceMax?: number;
    location?: string;
  }>().default({}),
  isActive: boolean('is_active').default(true),
  lastCheckedAt: timestamp('last_checked_at'),
  matchesFound: integer('matches_found').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentMatches = pgTable('agent_matches', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => shoppingAgents.id, { onDelete: 'cascade' }).notNull(),
  listingId: integer('listing_id').references(() => anunturi.id, { onDelete: 'cascade' }).notNull(),
  matchScore: integer('match_score').notNull(), // 0-100
  notifiedAt: timestamp('notified_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type ShoppingAgent = InferSelectModel<typeof shoppingAgents>;
export type NewShoppingAgent = InferInsertModel<typeof shoppingAgents>;
export type AgentMatch = InferSelectModel<typeof agentMatches>;