import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const posts = await query(
      `SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug]
    );

    if (!posts || (posts as any[]).length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = (posts as any[])[0];

    // Increment view count
    await query('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [post.id]);

    // Parse JSON fields
    const postWithParsedJSON = {
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
      source_urls: typeof post.source_urls === 'string' ? JSON.parse(post.source_urls) : post.source_urls
    };

    return NextResponse.json(postWithParsedJSON);

  } catch (error) {
    console.error('Blog post API error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}
