import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Email regex pattern for strict validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Sanitize text inputs (prevent control characters, trim, limit length)
function sanitizeInput(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/json' },
        { status: 415 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    // Bot protection: honeypot field check
    // If hidden field '_gotcha' is filled, silently succeed to neutralize automated spam bots
    if (body._gotcha) {
      console.warn('Bot submission blocked via honeypot field');
      return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    }

    const name = sanitizeInput(body.name, 100);
    const email = sanitizeInput(body.email, 100);
    const subject = sanitizeInput(body.subject, 150);
    const message = sanitizeInput(body.message, 5000);

    // Validate presence and minimum lengths
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!subject || subject.length < 2) {
      return NextResponse.json(
        { error: 'Please provide an inquiry subject.' },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { error: 'Please provide a message with at least 5 characters.' },
        { status: 400 }
      );
    }

    // If RESEND_API_KEY is configured in Vercel environment variables, dispatch email
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL || 'hkanjer@gmail.com';
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Dr. Hanif Kanjer Contact <onboarding@resend.dev>';

    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [notificationEmail],
            reply_to: email,
            subject: `[Website Inquiry] ${subject} - from ${name}`,
            html: `
              <h2>New Website Inquiry</h2>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <h3>Message:</h3>
              <p style="white-space:pre-wrap;background:#f9fafb;padding:15px;border-radius:8px;">${escapeHtml(message)}</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errData = await emailResponse.text();
          console.error('Failed to send email via Resend:', errData);
        }
      } catch (emailErr) {
        console.error('Email dispatch error:', emailErr);
      }
    } else {
      console.log('Contact form inquiry received:', {
        name,
        email,
        subject,
        messageLength: message.length,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending your message. Please try again later.' },
      { status: 500 }
    );
  }
}
