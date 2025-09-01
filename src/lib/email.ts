import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
