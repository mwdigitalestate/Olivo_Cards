# Olivo Cards - Product Requirements Document

## Original Problem Statement
SaaS application for digital business cards called "Olivo Cards" that allows users to create digital business cards (vCards) accessible via QR codes.

## Core Features

### 1. User Management
- User registration and login (JWT-based authentication)
- User roles: `user` and `admin`
- Admin can manage all users

### 2. Digital Business Cards (vCards)
- Create, edit, delete digital business cards
- QR code generation for each card
- Public card view accessible without login
- vCard format export for contact saving

### 3. Subscription Plans
- **Básico (Free):** 1 card, basic features
- **Profesional ($9.99/month):** 5 cards, full features
- **Empresarial ($29.99/month):** 25 cards, API access, team management

### 4. PayPal Recurring Payments ✅ IMPLEMENTED
- Automatic monthly/yearly subscription billing
- PayPal Subscriptions API integration
- Admin can sync plans with PayPal
- Users subscribe through PayPal approval flow
- Automatic payment collection by PayPal

### 5. Email Notifications (Pending Configuration)
- Welcome email on registration
- Subscription confirmation email
- New card creation notification
- Plan expiration warnings
- Gmail SMTP integration ready

### 6. Admin Dashboard
- User management (view, edit role, delete)
- Plan management (CRUD)
- PayPal configuration
- Email SMTP configuration
- Statistics dashboard

## Technical Stack

### Backend
- FastAPI (Python)
- MongoDB (Motor async driver)
- JWT authentication
- PayPal Subscriptions API
- aiosmtplib for emails

### Frontend
- React 18
- React Router
- Tailwind CSS
- shadcn/ui components
- @paypal/react-paypal-js

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### VCards
- `GET /api/vcards` - List user's cards
- `POST /api/vcards` - Create card
- `PUT /api/vcards/{id}` - Update card
- `DELETE /api/vcards/{id}` - Delete card
- `GET /api/vcard/{id}/public` - Public card view

### Plans
- `GET /api/plans` - List all plans
- `GET /api/plans/{id}` - Get plan details
- `POST /api/plans` - Create plan (admin)
- `PUT /api/plans/{id}` - Update plan (admin)
- `DELETE /api/plans/{id}` - Deactivate plan (admin)

### Subscriptions
- `GET /api/subscriptions/current` - Current subscription
- `POST /api/subscriptions` - Create subscription (one-time)
- `POST /api/subscriptions/paypal/create` - Create PayPal recurring subscription
- `POST /api/subscriptions/paypal/activate` - Activate after PayPal approval
- `POST /api/subscriptions/cancel-recurring` - Cancel recurring subscription

### Admin
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/paypal/sync-plan` - Sync plan with PayPal
- `POST /api/admin/paypal/sync-all-plans` - Sync all plans
- `GET /api/admin/settings` - Get PayPal settings
- `PUT /api/admin/settings/paypal` - Update PayPal config
- `PUT /api/admin/settings/email` - Update email config

### Webhooks
- `POST /api/webhooks/paypal` - PayPal webhook handler

## Completed Features (as of Feb 17, 2026)

### ✅ Core Application
- Full authentication system
- vCard CRUD operations
- QR code generation
- Public card viewing

### ✅ Admin Dashboard
- User management with delete functionality
- Plan management
- PayPal configuration page
- Email configuration page

### ✅ PayPal Recurring Payments
- PayPal Subscriptions API integration
- Plan synchronization with PayPal
- Recurring subscription flow
- Automatic payment renewal
- Webhook handling for payment events

### ✅ UI/Branding
- Olivo Cards branding
- Custom logo
- Olive green color scheme
- Footer with MW Digital Estate link

## Pending Features

### 🔶 Email Notifications (Blocked on Credentials)
- User needs to provide Gmail App Password (not regular password)
- All email templates ready
- Email service implemented but needs valid credentials

### 🔶 Automated Plan Expiration Check
- Manual endpoint exists: `/api/admin/check-expiring-subscriptions`
- Needs implementation as automated background job (cron/scheduler)

## Configuration Notes

### PayPal Setup
- Credentials stored in MongoDB `settings` collection
- Mode: `sandbox` (for testing) or `live` (production)
- Plans must be synced with PayPal before accepting recurring payments
- Admin Dashboard → Planes → "Sincronizar con PayPal"

### Email Setup
- Requires Gmail App Password (16-character code)
- NOT the regular Gmail password
- Instructions in Admin Dashboard → Configuración

## Test Credentials
- **Admin:** admin@vcardpro.com / admin123
- **Test User:** testpaypal@test.com / Test123!

## Database Collections
- `users` - User accounts
- `vcards` - Digital business cards
- `plans` - Subscription plans
- `subscriptions` - User subscriptions
- `settings` - PayPal and email configuration

---

*Last Updated: February 17, 2026*
*Developed by MW Digital Estate - https://maldivasweb.com*
