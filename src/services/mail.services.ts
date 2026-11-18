import nodemailer from "nodemailer";

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false" },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

export const sendMail = (opts: { subject: string; text: string; replyTo?: string }) =>
  transporter().sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "NYMPH International LLP"}" <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_ADMIN_TO,
    ...opts,
  });