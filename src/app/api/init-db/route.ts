import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();

    // Create categories table if it doesn't exist
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          icon VARCHAR(10),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create users table if it doesn't exist
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          password VARCHAR(255),
          role VARCHAR(20) DEFAULT 'user',
          is_admin BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create anunturi table if it doesn't exist
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS anunturi (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          category_id INTEGER NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          location VARCHAR(255),
          phone VARCHAR(20),
          images JSONB,
          status VARCHAR(20) DEFAULT 'pending_ai',
          is_premium BOOLEAN DEFAULT FALSE,
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ai_validation_score INTEGER,
          ai_validation_issues JSONB,
          ai_validation_suggestions JSONB,
          ai_approved BOOLEAN DEFAULT FALSE,
          ai_validated_at TIMESTAMP WITH TIME ZONE,
          ai_reasoning TEXT
        );
      `
    });

    // Insert basic categories
    await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO categories (id, name, slug, icon) VALUES
        (1, 'Imobiliare', 'imobiliare', '🏠'),
        (2, 'Auto Moto', 'auto-moto', '🚗'),
        (3, 'Electronice', 'electronice', '📱'),
        (4, 'Modă și Accesorii', 'moda-si-accesorii', '👗'),
        (5, 'Servicii', 'servicii', '🔧'),
        (6, 'Casă și Grădină', 'casa-si-gradina', '🏡'),
        (7, 'Sport & Hobby', 'sport-hobby', '⚽'),
        (8, 'Animale', 'animale', '🐾'),
        (9, 'Locuri de Muncă', 'locuri-de-munca', '💼'),
        (10, 'Mama și Copilul', 'mama-si-copilul', '👶'),
        (11, 'Matrimoniale', 'matrimoniale', '💑'),
        (12, 'Cazare și Turism', 'cazare-turism', '✈️️'),
        (13, 'Diverse', 'diverse', '📦')
        ON CONFLICT (id) DO NOTHING;
      `
    });

    // Insert admin users
    await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO users (id, email, name, password, role, is_admin, is_active) VALUES
        ('admin_ionut', 'ionutbaltag3@gmail.com', 'Ionut Admin', 'ionela_2B', 'admin', TRUE, TRUE),
        ('admin_claude', 'claude.dev@mail.com', 'Claude Admin', 'ionela_2B', 'admin', TRUE, TRUE)
        ON CONFLICT (id) DO NOTHING;
      `
    });

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Failed to initialize database',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}