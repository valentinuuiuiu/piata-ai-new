import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, content, excerpt, author, tags, views, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Note: category filtering removed since our table doesn't have a category column
    // Tags can be used for categorization instead

    const { data: posts, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Generate excerpts if missing
    const postsWithExcerpts = (posts || []).map(post => ({
      ...post,
      excerpt: post.excerpt || (post.content ? post.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...' : ''),
      category: post.tags?.[0] || 'General' // Use first tag as category
    }));

    return NextResponse.json(postsWithExcerpts);

  } catch (error: any) {
    console.error('Blog API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blog posts',
      details: error.message 
    }, { status: 500 });
  }
}
