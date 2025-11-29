import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AnuntDetails from '@/components/AnuntDetails';

export default async function AnuntPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: anunt, error } = await supabase
    .from('anunturi')
    .select('*, category:categories(name)')
    .eq('id', id)
    .single();

  if (anunt) {
    const ad = anunt as any;
    console.log(`[Server] Fetched ad ${id}:`, {
      title: ad.title,
      images_raw: ad.images,
      images_type: typeof ad.images,
      is_array: Array.isArray(ad.images)
    });
  }

  if (error || !anunt) {
    console.error('Error fetching listing:', error);
    notFound();
  }

  return <AnuntDetails listing={anunt as any} />;
}