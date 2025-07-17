import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, subject, feedbackData } = await req.json()

    const emailHTML = `
        <h2>New Feedback from TextAndPlay</h2>
        <p><strong>User:</strong> ${feedbackData.user_email || 'Anonymous'}</p>
        <p><strong>Message:</strong></p>
        <p>${feedbackData.message}</p>
        <p><strong>Page:</strong> ${feedbackData.page_url}</p>
        <p><strong>Timestamp:</strong> ${feedbackData.timestamp}</p>
        <p><strong>User Agent:</strong> ${feedbackData.user_agent}</p>
        ${feedbackData.screenshot ? '<p><strong>Screenshot:</strong> Attached</p>' : ''}
      `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'feedback@trama.app',
        to: [to],
        subject: subject,
        html: emailHTML,
      }),
    })

    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
