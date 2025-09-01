// Email sending via Logic App / Power Automate endpoint defined in SEND_EMAIL_API.
// Keeps the same public function signature used elsewhere in the codebase.

interface SendEmailResponse {
  ok: boolean;
  status: number;
  bodyText?: string;
}

export async function sendMail(to: string, subject: string, html: string): Promise<SendEmailResponse> {
  const endpoint = process.env.SEND_EMAIL_API;
  if (!endpoint) {
    throw new Error('SEND_EMAIL_API env var is not set');
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        cc: '', // per requirement: send empty CC
        subject,
        htmlBody: html,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => undefined);
      console.error('Email API responded with non-OK status', res.status, text);
      throw new Error(`Email API error: ${res.status} ${text ?? ''}`.trim());
    }

    const bodyText = await res.text().catch(() => undefined);
    return { ok: true, status: res.status, bodyText };
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}
