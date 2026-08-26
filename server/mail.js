import nodemailer from 'nodemailer'

let transporter = null
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
}

export function mailerEnabled() {
  return !!transporter
}

export async function sendMail({ to, subject, text, html }) {
  if (!transporter) return false
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@amyskitchen.com',
    to,
    subject,
    text,
    html,
  })
  return true
}
