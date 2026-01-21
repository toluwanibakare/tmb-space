const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const defaultHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const defaultPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const secureFlag = typeof process.env.SMTP_SECURE !== 'undefined' ? (process.env.SMTP_SECURE === 'true') : (defaultPort === 465);

const transporter = nodemailer.createTransport({
  host: defaultHost,
  port: defaultPort,
  secure: secureFlag,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

// verify transporter on startup (best-effort)
transporter.verify().then(() => {
  console.log('SMTP transporter verified');
}).catch((err) => {
  console.warn('SMTP transporter verification failed:', err && err.message ? err.message : err);
});

async function sendMail({ to, subject, html, text }) {
  if (!to) throw new Error('`to` is required for sendMail');
  const fromAddress = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'mosesbakare48@gmail.com';
  try {
    const info = await transporter.sendMail({
      from: `${fromAddress}`,
      to,
      subject,
      html,
      text,
    });
    return info;
  } catch (err) {
    console.error('sendMail error:', err && err.message ? err.message : err);
    throw err;
  }
}

async function verifyTransporter() {
  return transporter.verify();
}

module.exports = { sendMail, transporter, verifyTransporter };
