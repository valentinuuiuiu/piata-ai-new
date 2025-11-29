import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let sql = `
      SELECT id, title, slug, excerpt, category, tags, image_url, views, published_at
      FROM blog_posts
      WHERE status = 'published'
    `;

    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ` ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const posts = await query(sql, params);

    // Parse JSON fields
    const postsWithParsedJSON = (posts as any[]).map(post => ({
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags
    }));

    return NextResponse.json(postsWithParsedJSON);

  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
