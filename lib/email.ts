// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(to: string, orderId: string) {
  // TODO: Integrate Resend email service when API key is available
  console.log(`[STUB] Would send order confirmation email to ${to} for order ${orderId}`);
  return Promise.resolve();
} 