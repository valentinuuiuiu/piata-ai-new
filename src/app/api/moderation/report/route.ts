import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveAdminChatId, telegramSendMessage } from '@/lib/telegram';

// Public endpoint: anyone can report a listing.
// Stores report in DB and notifies admin via Telegram.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const listingId = Number(body.listing_id);
    const reason = String(body.reason || '').trim();
    const details = body.details ? String(body.details).trim() : null;

    if (!listingId || Number.isNaN(listingId)) {
      return NextResponse.json({ error: 'listing_id is required' }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Ensure listing exists
    const { data: listing } = await supabase
      .from('anunturi')
      .select('id,title,status,price,location,user_id,created_at')
      .eq('id', listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'listing not found' }, { status: 404 });
    }

    // Insert report
    const { data: report, error: reportErr } = await supabase
      .from('listing_reports')
      .insert({
        listing_id: listingId,
        reporter_user_id: null,
        reason,
        details,
        status: 'new',
        metadata: {
          source: 'web',
          user_agent: req.headers.get('user-agent'),
        },
      })
      .select('*')
      .single();

    if (reportErr) {
      console.error('report insert error', reportErr);
      return NextResponse.json({ error: 'failed to create report' }, { status: 500 });
    }

    // Notify admin
    const chatId = await resolveAdminChatId();

    const msg = [
      `🚩 *Raport nou pentru anunț* #${listing.id}`,
      `*Titlu:* ${listing.title}`,
      `*Motiv:* ${reason}`,
      details ? `*Detalii:* ${details}` : null,
      `*Status anunț:* ${listing.status}`,
      `*Link:* https://www.piata-ai.ro/anunt/${listing.id}`,
      '',
      `Comenzi:`,
      `• /hide ${listing.id} ${report.id}`,
      `• /reject ${report.id}`,
      `• /resolve ${report.id}`,
    ].filter(Boolean).join('\n');

    await telegramSendMessage({ chat_id: chatId, text: msg });

    return NextResponse.json({ success: true, report_id: report.id });
  } catch (e: any) {
    console.error('moderation/report error', e);
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}
