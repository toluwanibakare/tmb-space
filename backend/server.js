const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const { sendMail, verifyTransporter } = require('./mail');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CONTACT_EMAIL = 'mosesbakare48@gmail.com';
const FROM_EMAIL = '"TMB" <mosesbakare48@gmail.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const EMAIL_FOOTER = `
<div style="
  margin-top:32px;
  background:#0b3c78;
  color:#ffffff;
  padding:24px;
  border-radius:6px;
  font-family:Arial, Helvetica, sans-serif;
  font-size:14px;
">
  <p style="margin:0 0 8px 0; font-weight:bold; font-size:16px;">
    I AM TMB
  </p>
  <p style="margin:0 0 12px 0; line-height:1.6;">
    Web Developer<br>
    Brand Designer<br>
    Online Growth Strategist
  </p>
  <p style="margin:0; line-height:1.6;">
    Website:
    <a href="https://tmb.it.com" style="color:#ffffff; text-decoration:underline;">
      https://tmb.it.com
    </a><br>
    Email: mosesbakare48@gmail.com<br>
    Phone: +2348026322742
  </p>
</div>
`;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Test email
app.post('/api/test-email', async (req, res) => {
  try {
    await verifyTransporter();
    await sendMail({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: 'TMB SMTP Test Email',
      html: `<p>Email delivery is working.</p>${EMAIL_FOOTER}`,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Email test failed' });
  }
});

// Contact
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, whatsapp, brand_about, goals, services, message } = req.body;
  if (!name || !email || !whatsapp || !brand_about || !goals || !services) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO contact_submissions
       (id, name, email, phone, whatsapp, brand_about, goals, services, message, submitted_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, phone || null, whatsapp, brand_about, goals, services, message || null]
    );

    await sendMail({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: `New Contact from ${name}`,
      html: `<p>New contact submission.</p>${EMAIL_FOOTER}`,
    });

    await sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Message received',
      html: `<p>Hi ${name}, I received your message.</p>${EMAIL_FOOTER}`,
    });

    res.json({ ok: true });
  } finally {
    conn.release();
  }
});

// Bookings POST
app.post('/api/bookings', async (req, res) => {
  const { name, contact, booking_date, booking_time, email } = req.body;
  if (!name || !contact || !booking_date || !booking_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO bookings (id, name, contact, booking_date, booking_time, created_at)
       VALUES (UUID(), ?, ?, ?, ?, NOW())`,
      [name, contact, booking_date, booking_time]
    );

    await sendMail({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: `New Booking from ${name}`,
      html: `<p>New booking received.</p>${EMAIL_FOOTER}`,
    });

    if (email) {
      await sendMail({
        from: FROM_EMAIL,
        to: email,
        subject: 'Session confirmed',
        html: `<p>Your session is confirmed.</p>${EMAIL_FOOTER}`,
      });
    }

    res.json({ ok: true });
  } finally {
    conn.release();
  }
});

// Bookings GET (this fixes your 404)
app.get('/api/bookings', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM bookings ORDER BY created_at DESC'
    );
    res.json({ data: rows });
  } finally {
    conn.release();
  }
});

// Reviews POST
app.post('/api/reviews', async (req, res) => {
  const { name, project_type, rating, review, is_anonymous, email } = req.body;
  if (!name || !project_type || !rating || !review) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO reviews
       (id, name, project_type, rating, review, is_anonymous, approved, created_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, 0, NOW())`,
      [name, project_type, rating, review, is_anonymous ? 1 : 0]
    );

    await sendMail({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: 'New Review Submitted',
      html: `<p>New review pending approval.</p>${EMAIL_FOOTER}`,
    });

    if (email) {
      await sendMail({
        from: FROM_EMAIL,
        to: email,
        subject: 'Thank you for your review',
        html: `<p>Your review was received.</p>${EMAIL_FOOTER}`,
      });
    }

    res.json({ ok: true });
  } finally {
    conn.release();
  }
});

// Reviews GET (approved only)
app.get('/api/reviews', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT id, name, project_type, rating, review, is_anonymous, created_at
       FROM reviews
       WHERE approved = 1
       ORDER BY created_at DESC`
    );
    res.json({ data: rows });
  } finally {
    conn.release();
  }
});

// Approve review
app.patch('/api/admin/reviews/:id/approve', async (req, res) => {
  const { approved } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'UPDATE reviews SET approved = ? WHERE id = ?',
      [approved ? 1 : 0, req.params.id]
    );
    res.json({ ok: true });
  } finally {
    conn.release();
  }
});

// Newsletter
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO newsletter_subscriptions (id, email, subscribed_at)
       VALUES (UUID(), ?, NOW())
       ON DUPLICATE KEY UPDATE email = email`,
      [email]
    );

    await sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Newsletter Subscription Confirmed',
      html: `<p>Welcome to the TMB newsletter.</p>${EMAIL_FOOTER}`,
    });

    res.json({ ok: true });
  } finally {
    conn.release();
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
