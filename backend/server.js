const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const { sendMail, verifyTransporter } = require('./mail');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'mosesbakare48@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Test email (useful to verify SMTP/Gmail settings)
app.post('/api/test-email', async (req, res) => {
  const { to } = req.body || {};
  const recipient = to || CONTACT_EMAIL;
  try {
    // verify transporter first
    await verifyTransporter();
  } catch (err) {
    console.warn('SMTP verify failed:', err && err.message ? err.message : err);
    // still attempt to send and return any send errors
  }

  try {
    await sendMail({
      to: recipient,
      subject: 'TMB SMTP Test Email',
      html: `<p>This is a test email from TMB backend. If you received this, SMTP is working.</p>`,
    });
    res.json({ ok: true, message: `Test email sent to ${recipient}` });
  } catch (err) {
    console.error('Test email failed:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Failed to send test email', details: err && err.message ? err.message : String(err) });
  }
});

// Contact submissions
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, whatsapp, brand_about, goals, services, message } = req.body;
  if (!name || !email || !whatsapp || !brand_about || !goals || !services) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conn = await pool.getConnection();
  try {
    const insertSql = `INSERT INTO contact_submissions
      (id, name, email, phone, whatsapp, brand_about, goals, services, message, submitted_at)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    await conn.query(insertSql, [name, email, phone || null, whatsapp, brand_about, goals, services, message || null]);

    // Email admin
    const adminHtml = `<p>New contact submission</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone || 'N/A'}</li>
        <li><strong>WhatsApp:</strong> ${whatsapp}</li>
        <li><strong>Brand About:</strong> ${brand_about}</li>
        <li><strong>Goals:</strong> ${goals}</li>
        <li><strong>Services:</strong> ${services}</li>
        <li><strong>Message:</strong> ${message || ''}</li>
      </ul>`;

    // notify site contact address
    await sendMail({ to: CONTACT_EMAIL, subject: `Contact: ${name}`, html: adminHtml });

    // Email user
    const userHtml = `<p>Hi ${name},</p>
      <p>Thanks for contacting TMB. We've received your message and will get back to you shortly.</p>
      <p>Summary of your submission:</p>
      ${adminHtml}
      <p>— TMB</p>`;

    await sendMail({ to: email, subject: `Thanks for contacting TMB`, html: userHtml });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Bookings
app.post('/api/bookings', async (req, res) => {
  const { name, contact, booking_date, booking_time, email } = req.body;
  if (!name || !contact || !booking_date || !booking_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conn = await pool.getConnection();
  try {
    const insertSql = `INSERT INTO bookings (id, name, contact, booking_date, booking_time, created_at)
      VALUES (UUID(), ?, ?, ?, ?, NOW())`;

    await conn.query(insertSql, [name, contact, booking_date, booking_time]);

    // Email admin
    const adminHtml = `<p>New booking</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Contact:</strong> ${contact}</li>
        <li><strong>Date:</strong> ${booking_date}</li>
        <li><strong>Time:</strong> ${booking_time}</li>
      </ul>`;

    // notify site contact address
    await sendMail({ to: CONTACT_EMAIL, subject: `New booking: ${name}`, html: adminHtml });

    // Email user
    const userEmail = email || contact;
    const userHtml = `<p>Hi ${name},</p>
      <p>Your booking with TMB for ${booking_date} at ${booking_time} is scheduled.</p>
      <p>We will send the Google Meet link and meeting details within a few hours to this email address.</p>
      <p>If you have questions reply to this email.</p>
      <p>— TMB</p>`;

    if (userEmail) await sendMail({ to: userEmail, subject: `Booking scheduled with TMB`, html: userHtml });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Slot already booked' });
    }
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// GET bookings (for frontend to fetch booked slots)
app.get('/api/bookings', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT booking_date, booking_time FROM bookings');
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Newsletter subscribe
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const conn = await pool.getConnection();
  try {
    const insertSql = `INSERT INTO newsletter_subscriptions (id, email, subscribed_at) VALUES (UUID(), ?, NOW())`;
    await conn.query(insertSql, [email]);

    // Admin notify
    await sendMail({ to: CONTACT_EMAIL, subject: `New newsletter subscriber`, html: `<p>${email} subscribed</p>` });

    // Thank you to subscriber
    const userHtml = `<p>Hi,</p>
      <p>Thanks for subscribing to the TMB newsletter. We'll share updates, news and exclusive offers with you.</p>
      <p>— TMB</p>`;
    await sendMail({ to: email, subject: `Thanks for subscribing to TMB`, html: userHtml });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already subscribed' });
    }
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Reviews
app.post('/api/reviews', async (req, res) => {
  const { name, project_type, rating, review, is_anonymous, email } = req.body;
  if (!name || !project_type || !rating || !review) return res.status(400).json({ error: 'Missing fields' });

  const conn = await pool.getConnection();
  try {
    const insertSql = `INSERT INTO reviews (id, name, project_type, rating, review, is_anonymous, created_at)
      VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`;
    await conn.query(insertSql, [name, project_type, rating, review, is_anonymous ? 1 : 0]);

    // Admin notify
    await sendMail({ to: CONTACT_EMAIL, subject: `New review from ${name}`, html: `<p>Rating: ${rating}</p><p>${review}</p>` });

    // Thank the user and encourage sharing
    if (email) {
      const shareLink = FRONTEND_URL; // You can add a specific referral path
      const userHtml = `<p>Hi ${name},</p>
        <p>Thanks for your review! We appreciate your feedback.</p>
        <p>If you'd like to support TMB, please share this link with friends: <a href="${shareLink}">${shareLink}</a></p>
        <p>— TMB</p>`;
      await sendMail({ to: email, subject: `Thanks for your review`, html: userHtml });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`TMB backend running on port ${PORT}`));

// --- Admin endpoints (basic token-based check using ADMIN_SECRET) ---
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

function checkAdmin(req) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  if (!token) return false;
  const t = Array.isArray(token) ? token[0] : token;
  // allow either bare token or Bearer <token>
  if (typeof t === 'string' && t.startsWith('Bearer ')) return t.slice(7) === ADMIN_SECRET;
  return t === ADMIN_SECRET;
}

app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  if (password === ADMIN_SECRET) {
    return res.json({ ok: true, token: ADMIN_SECRET });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/admin/bookings', async (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.get('/api/admin/contacts', async (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM contact_submissions ORDER BY submitted_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.get('/api/admin/newsletter', async (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.get('/api/admin/reviews', async (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Public reviews listing
app.get('/api/reviews', async (req, res) => {
  const limit = req.query && req.query.limit ? parseInt(String(req.query.limit), 10) : null;
  const conn = await pool.getConnection();
  try {
    const sql = limit ? 'SELECT * FROM reviews ORDER BY created_at DESC LIMIT ?' : 'SELECT * FROM reviews ORDER BY created_at DESC';
    const params = limit ? [limit] : [];
    const [rows] = await conn.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});
