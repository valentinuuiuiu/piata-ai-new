import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const supabase = createServiceClient();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !post) {
      console.error('Blog post not found or error:', error);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Map fields for frontend
    const postForFrontend = {
      ...post,
      category: post.tags?.[0] || 'General',
      image_url: post.metadata?.image_url || '/blog-placeholder.jpg'
    };

    // Increment view count (fire and forget)
    supabase
      .from('blog_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id)
      .then(res => {
        if (res.error) console.error('Error incrementing views:', res.error);
      });

    return NextResponse.json(postForFrontend);

  } catch (error) {
    console.error('Blog post API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
