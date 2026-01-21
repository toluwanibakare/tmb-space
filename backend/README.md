TMB Backend
============

Simple Node.js + Express backend for TMB using MySQL and Nodemailer.

Setup
-----

1. Copy `.env.example` to `.env` and fill in your DB and SMTP credentials.

2. Install dependencies:

```bash
cd backend
npm install
```

3. Create the MySQL database `tmb` and run `supabase/schema.sql` (converted MySQL schema) or apply migrations manually.

4. Start server:

```bash
npm run dev
# or
npm start
```

API Endpoints
-------------
- `POST /api/contact` — send contact form (body: `name,email,phone,whatsapp,brand_about,goals,services,message`)
- `POST /api/bookings` — create booking (body: `name,contact,booking_date,booking_time,email?`)
- `POST /api/newsletter` — subscribe (body: `email`)
- `POST /api/reviews` — submit review (body: `name,project_type,rating,review,is_anonymous,email?`)

Notes
-----
- RLS and Supabase auth features are not implemented; enforce auth/roles in your app layer.
- Update SMTP values in `.env` to enable emails.
