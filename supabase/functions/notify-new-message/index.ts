// Supabase Edge Function: notify-new-message
// Dipanggil via Database Webhook setiap kali ada INSERT baru di tabel contact_messages.
//
// CARA DEPLOY:
// 1. Buat API key gratis di https://resend.com (free tier: 3.000 email/bulan)
// 2. Di Supabase Dashboard → Settings → Edge Functions → Secrets, tambahkan:
//    - RESEND_API_KEY   = re_xxxxxxxxxx  (API key dari Resend)
//    - NOTIFY_TO_EMAIL  = emailkamu@domain.com  (email tujuan notifikasi)
//    - NOTIFY_FROM_EMAIL = noreply@rangga.dev  (atau domain verified di Resend)
// 3. Deploy function ini:
//    supabase functions deploy notify-new-message
// 4. Di Supabase Dashboard → Database → Webhooks → Create new webhook:
//    - Name: notify_new_contact_message
//    - Table: contact_messages
//    - Events: INSERT
//    - Type: Supabase Edge Functions
//    - Function: notify-new-message

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

interface ContactMessagePayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    sender: string
    email: string
    message: string
    submitted_at: string
    read: boolean
  }
  old_record: null | Record<string, unknown>
}

serve(async (req: Request) => {
  // Verifikasi method
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Ambil environment variables
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const notifyToEmail = Deno.env.get('NOTIFY_TO_EMAIL')
  const notifyFromEmail = Deno.env.get('NOTIFY_FROM_EMAIL') ?? 'noreply@rangga.dev'

  if (!resendApiKey || !notifyToEmail) {
    console.error('Missing required environment variables: RESEND_API_KEY and/or NOTIFY_TO_EMAIL')
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: missing email credentials.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let payload: ContactMessagePayload
  try {
    payload = await req.json() as ContactMessagePayload
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Hanya proses event INSERT
  if (payload.type !== 'INSERT') {
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { sender, email, message, submitted_at } = payload.record
  const submittedDate = new Date(submitted_at).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  // Kirim email via Resend API
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Portfolio Contact Form <${notifyFromEmail}>`,
      to: [notifyToEmail],
      reply_to: email,
      subject: `💬 Pesan baru dari ${sender} — Portfolio`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f4f4f1; color: #171715;">
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #d2d2cc;">
            <p style="margin: 0; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #555550; font-family: monospace;">Portfolio / Contact Form</p>
          </div>

          <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; letter-spacing: -0.03em;">Pesan baru masuk</h1>
          <p style="margin: 0 0 28px; font-size: 13px; color: #555550;">${submittedDate} · WIB</p>

          <div style="background: #ffffff; border: 1px solid #d2d2cc; border-radius: 4px; padding: 20px 22px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0 0 2px; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #555550; font-family: monospace;">Pengirim</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600;">${sender}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0 0 2px; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #555550; font-family: monospace;">Email</p>
              <p style="margin: 0; font-size: 14px;"><a href="mailto:${email}" style="color: #171715;">${email}</a></p>
            </div>
            <div>
              <p style="margin: 0 0 8px; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #555550; font-family: monospace;">Pesan</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.65; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="mailto:${email}?subject=Re: Pesan kamu ke portfolio saya" style="display: inline-block; padding: 10px 18px; background: #171715; color: #f4f4f1; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 2px;">
              Balas via email
            </a>
          </div>

          <p style="margin: 32px 0 0; font-size: 11px; color: #686861; border-top: 1px solid #d2d2cc; padding-top: 16px;">
            Email ini dikirim otomatis dari contact form portofolio Rangga Ariansyah.
            Buka <a href="https://rangga.dev/admin/messages" style="color: #555550;">admin panel</a> untuk lihat semua pesan.
          </p>
        </div>
      `,
      text: `Pesan baru dari portfolio\n\nPengirim: ${sender}\nEmail: ${email}\nWaktu: ${submittedDate}\n\nPesan:\n${message}\n\n---\nBalas ke: ${email}`,
    }),
  })

  if (!emailRes.ok) {
    const errorBody = await emailRes.text()
    console.error('Resend API error:', emailRes.status, errorBody)
    return new Response(
      JSON.stringify({ error: 'Failed to send notification email.', detail: errorBody }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const result = await emailRes.json()
  console.log('Notification email sent:', result)

  return new Response(
    JSON.stringify({ success: true, emailId: result.id }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
