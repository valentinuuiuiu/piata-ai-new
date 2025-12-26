import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const supabase = createServiceClient();

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, content, excerpt, author, tags, views, published_at, created_at, metadata')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase blog error:', error);
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }

    // Generate excerpts and set category
    const postsWithDetails = (posts || []).map(post => {
      const metadata = post.metadata || {};
      return {
        ...post,
        excerpt: post.excerpt || (post.content ? post.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...' : ''),
        category: post.tags?.[0] || 'General',
        image_url: metadata.image_url || '/blog-placeholder.jpg' // Fallback
      };
    });

    return NextResponse.json(postsWithDetails);

  } catch (error: any) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

  } catch (error: any) {
    console.error('Blog API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blog posts',
      details: error.message 
    }, { status: 500 });
  }
}
