CREATE TABLE "anunturi" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"price" numeric(12, 2),
	"location" varchar(255),
	"phone" varchar(20),
	"images" jsonb,
	"status" varchar(20) DEFAULT 'active',
	"is_premium" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"icon" varchar(10),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "credit_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"credits" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stripe_price_id" varchar(255),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "credits_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"package_id" integer,
	"credits_amount" integer NOT NULL,
	"stripe_payment_id" varchar(255),
	"status" varchar(20) DEFAULT 'pending',
	"amount_eur" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_boosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"boost_type" varchar(20) NOT NULL,
	"starts_at" timestamp DEFAULT now(),
	"duration_days" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"auto_repost" boolean DEFAULT false,
	"payment_id" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"credits_balance" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"password" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "anunturi" ADD CONSTRAINT "anunturi_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anunturi" ADD CONSTRAINT "anunturi_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits_transactions" ADD CONSTRAINT "credits_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits_transactions" ADD CONSTRAINT "credits_transactions_package_id_credit_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."credit_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_boosts" ADD CONSTRAINT "listing_boosts_listing_id_anunturi_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."anunturi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;