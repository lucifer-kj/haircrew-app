import { Resend } from 'resend'
import { env } from './env'

const resend = new Resend(env.RESEND_API_KEY)

const BRAND_LOGO_URL = `${env.NEXT_PUBLIC_BASE_URL || ''}/favicon.ico`
const BRAND_PRIMARY = '#9929EA'
const BRAND_SECONDARY = '#891997'
const BRAND_FONT =
  'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'

function emailBase({ body }: { body: string }) {
  return `
  <div style="background:#f8f9fa;padding:32px 0;font-family:${BRAND_FONT};">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 16px 0 rgba(0,0,0,0.08);overflow:hidden;">
      <div style="background:${BRAND_PRIMARY};padding:24px 0;text-align:center;">
        <img src="${BRAND_LOGO_URL}" alt="HairCrew Logo" style="height:48px;margin-bottom:8px;border-radius:12px;" />
        <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;letter-spacing:1px;">HairCrew</h1>
      </div>
      <div style="padding:32px 24px 24px 24px;">
        ${body}
      </div>
      <div style="background:${BRAND_SECONDARY};color:#fff;text-align:center;padding:16px 0;font-size:14px;">
        &copy; ${new Date().getFullYear()} HairCrew. All rights reserved.
      </div>
    </div>
  </div>
  `
}

export function orderConfirmationTemplate({
  name,
  orderId,
}: {
  name: string
  orderId: string
}) {
  return emailBase({
    body: `
      <h2 style="color:${BRAND_PRIMARY};font-size:20px;font-weight:600;margin-bottom:12px;">Order Confirmed</h2>
      <p style="font-size:16px;color:#333;">Hi ${name},</p>
      <p style="font-size:16px;color:#333;">Thank you for your purchase! Your order <b>#${orderId}</b> has been confirmed and is being processed.</p>
      <p style="margin:24px 0 0 0;font-size:15px;color:#555;">You will receive another email when your order ships.</p>
      <a href="${env.NEXT_PUBLIC_BASE_URL || ''}/order-received/${orderId}" style="display:inline-block;margin-top:24px;padding:12px 32px;background:${BRAND_PRIMARY};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View Order</a>
    `,
  })
}

export function shippingUpdateTemplate({
  name,
  orderId,
  status,
}: {
  name: string
  orderId: string
  status: string
}) {
  return emailBase({
    body: `
      <h2 style="color:${BRAND_PRIMARY};font-size:20px;font-weight:600;margin-bottom:12px;">Order Update</h2>
      <p style="font-size:16px;color:#333;">Hi ${name},</p>
      <p style="font-size:16px;color:#333;">Your order <b>#${orderId}</b> status has changed to <b>${status}</b>.</p>
      <p style="margin:24px 0 0 0;font-size:15px;color:#555;">You can track your order status in your account dashboard.</p>
      <a href="${env.NEXT_PUBLIC_BASE_URL || ''}/order-received/${orderId}" style="display:inline-block;margin-top:24px;padding:12px 32px;background:${BRAND_PRIMARY};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Track Order</a>
    `,
  })
}

export function passwordResetTemplate({
  name,
  resetUrl,
}: {
  name: string
  resetUrl: string
}) {
  return emailBase({
    body: `
      <h2 style="color:${BRAND_PRIMARY};font-size:20px;font-weight:600;margin-bottom:12px;">Password Reset</h2>
      <p style="font-size:16px;color:#333;">Hi ${name},</p>
      <p style="font-size:16px;color:#333;">We received a request to reset your password. Click the button below to set a new password.</p>
      <a href="${resetUrl}" style="display:inline-block;margin-top:24px;padding:12px 32px;background:${BRAND_PRIMARY};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
      <p style="margin-top:24px;font-size:14px;color:#888;">If you did not request this, you can safely ignore this email.</p>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderId: string
) {
  if (!to) throw new Error('No recipient email')
  const subject = 'Your Order is Confirmed!'
  const html = orderConfirmationTemplate({ name, orderId })
  await resend.emails.send({
    from: 'no-reply@haircrew.com',
    to,
    subject,
    html,
  })
}

export async function sendShippingUpdateEmail(
  to: string,
  name: string,
  orderId: string,
  status: string
) {
  if (!to) throw new Error('No recipient email')
  const subject = 'Your Order Status Update'
  const html = shippingUpdateTemplate({ name, orderId, status })
  await resend.emails.send({
    from: 'no-reply@haircrew.com',
    to,
    subject,
    html,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  if (!to) throw new Error('No recipient email')
  const subject = 'Reset Your Password'
  const html = passwordResetTemplate({ name, resetUrl })
  await resend.emails.send({
    from: 'no-reply@haircrew.com',
    to,
    subject,
    html,
  })
}
