import { Resend } from 'resend';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);

  try {
    const data = await resend.emails.send({
      from: 'FTraker Security <no-reply@eka-dev.cloud>', // You should change this to your verified domain later
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
