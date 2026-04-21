import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { record } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch listing with seller profile and match info
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('id, section, seller:profiles!seller_id(full_name, email:id), match:matches(team1, team2, city, match_date)')
      .eq('id', record.listing_id)
      .single()

    if (listingErr || !listing) {
      console.error('Listing fetch error:', listingErr)
      return new Response('Listing not found', { status: 200 })
    }

    // Get seller email via auth admin API
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: sellerUser } = await adminClient.auth.admin.getUserById(
      (listing.seller as { id: string }).id ?? '',
    )
    const sellerEmail = sellerUser?.user?.email
    const sellerName = (listing.seller as { full_name?: string | null })?.full_name ?? 'Seller'

    if (!sellerEmail) {
      console.log('No seller email found, skipping notification')
      return new Response('No seller email', { status: 200 })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — skipping email notification')
      return new Response('No email key configured', { status: 200 })
    }

    const match = listing.match as { team1?: string | null; team2?: string | null; city?: string | null; match_date?: string | null } | null
    const matchLabel = match
      ? `${match.team1 ?? 'TBD'} vs ${match.team2 ?? 'TBD'}`
      : 'your listing'
    const matchDate = match?.match_date
      ? new Date(match.match_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : null

    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'
    const offerAmount = record.amount != null
      ? `${record.currency ?? 'USD'} ${Number(record.amount).toLocaleString()}`
      : 'Price on request'

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WC Tickets 2026 <notifications@wctickets2026.com>',
        to: sellerEmail,
        subject: `New offer on your ticket: ${matchLabel}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <div style="background: linear-gradient(135deg, #0033A0, #E30613); border-radius: 16px; padding: 24px; color: white; margin-bottom: 24px;">
              <h1 style="margin: 0 0 4px; font-size: 24px;">⚽ New Offer Received!</h1>
              <p style="margin: 0; opacity: 0.85;">Someone wants your World Cup ticket</p>
            </div>

            <p style="color: #374151;">Hi ${sellerName},</p>
            <p style="color: #374151;">You received a new offer on your listing:</p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 0;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #0033A0; font-size: 18px;">${matchLabel}</p>
              ${matchDate ? `<p style="margin: 0 0 4px; color: #64748b; font-size: 14px;">📅 ${matchDate}</p>` : ''}
              ${match?.city ? `<p style="margin: 0; color: #64748b; font-size: 14px;">📍 ${match.city}</p>` : ''}
            </div>

            <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center;">
              <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">Offer Amount</p>
              <p style="margin: 0; font-size: 32px; font-weight: 700; color: #0033A0;">${offerAmount}</p>
              ${record.message ? `<p style="margin: 12px 0 0; color: #475569; font-size: 14px; font-style: italic;">"${record.message}"</p>` : ''}
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${appUrl}/profile?tab=offers-received"
                style="background: #0033A0; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
                View &amp; Respond to Offer →
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
              WC Tickets 2026 · Fan-to-fan marketplace · Not affiliated with FIFA
            </p>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const body = await emailRes.text()
      console.error('Resend error:', body)
      return new Response('Email send failed', { status: 500 })
    }

    console.log(`Email sent to ${sellerEmail} for offer ${record.id}`)
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('notify-new-offer error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
