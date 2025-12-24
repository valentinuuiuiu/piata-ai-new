import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Telegram webhook receiver OR simple polling forwarder.
// Supports commands:
// /hide <listingId> <reportId>
// /unhide <listingId> <reportId>
// /reject <reportId>
// /resolve <reportId>
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
      const incoming = req.headers.get('x-telegram-bot-api-secret-token');
      if (incoming !== secret) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
    }

    const update = await req.json();
    const text: string | undefined = update?.message?.text;

    if (!text) {
      return NextResponse.json({ ok: true });
    }

    const parts = text.trim().split(/\s+/);
    const cmd = parts[0];

    const supabase = createServiceClient();

    if (cmd === '/hide' || cmd === '/unhide') {
      const listingId = Number(parts[1]);
      const reportId = Number(parts[2]);
      if (!listingId || !reportId) return NextResponse.json({ error: 'usage: /hide <listingId> <reportId>' }, { status: 400 });

      const newStatus = cmd === '/hide' ? 'inactive' : 'active';

      await supabase.from('anunturi').update({ status: newStatus }).eq('id', listingId);
      await supabase.from('listing_reports').update({ status: 'resolved', reviewed_at: new Date().toISOString(), resolution: cmd }).eq('id', reportId);
      await supabase.from('moderation_actions').insert({ report_id: reportId, listing_id: listingId, action: cmd === '/hide' ? 'hide_listing' : 'unhide_listing' });

      return NextResponse.json({ ok: true });
    }

    if (cmd === '/reject' || cmd === '/resolve') {
      const reportId = Number(parts[1]);
      if (!reportId) return NextResponse.json({ error: 'usage: /reject <reportId>' }, { status: 400 });

      const status = cmd === '/reject' ? 'rejected' : 'resolved';
      await supabase.from('listing_reports').update({ status, reviewed_at: new Date().toISOString(), resolution: cmd }).eq('id', reportId);
      await supabase.from('moderation_actions').insert({ report_id: reportId, action: cmd === '/reject' ? 'reject_report' : 'resolve_report' });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (e: any) {
    console.error('telegram moderation webhook error', e);
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}
