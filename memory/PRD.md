# Olivo Cards - Product Requirements Document

## Original Problem Statement
SaaS application for digital business cards called "Olivo Cards" that allows users to create digital business cards (vCards) accessible via QR codes.

## Core Features

### 1. User Management
- User registration and login (JWT-based authentication)
- Password reset functionality
- User roles: `user` and `admin`
- Admin can manage all users

### 2. Digital Business Cards (vCards)
- Create, edit, delete digital business cards
- **REQUIRES ACTIVE SUBSCRIPTION** - Users must subscribe before creating cards
- QR code generation for each card
- Public card view accessible without login
- vCard format export for contact saving
- **Image upload from device** for profile photos

### 3. Subscription Plans
- **Básico ($2.99/month):** 1 card, basic features, **15 días gratis**
- **Profesional ($9.99/month):** 5 cards, full features (MÁS POPULAR)
- **Empresarial ($29.99/month):** 25 cards, dedicated support
- **Trial Period:** Configurable free trial days per plan

### 4. PayPal Recurring Payments ✅ FULLY WORKING
- **Dual credentials:** Sandbox (testing) AND Live (production)
- Automatic mode selection based on selected mode
- Trial periods with PayPal native billing cycles
- Users must link PayPal to activate trial
- Automatic payment after trial ends
- Webhook handling for payment events
- **Re-sync plans** button when changing modes

### 5. Email Notifications (Pending Configuration)
- Welcome email on registration
- Subscription confirmation email
- New card creation notification
- Plan expiration warnings
- Gmail SMTP integration ready

### 6. Admin Dashboard
- User management (view, edit role, delete)
- Plan management (CRUD + trial_days configuration)
- **PayPal configuration with Sandbox/Live credentials**
- Email SMTP configuration
- Statistics dashboard

## Technical Stack

### Backend
- FastAPI (Python)
- MongoDB (Motor async driver)
- JWT authentication
- PayPal Subscriptions API (dual mode)
- File uploads (local storage)
- aiosmtplib for emails

### Frontend
- React 18
- React Router
- Tailwind CSS
- shadcn/ui components

## Deployment Notes

### When deploying to production:
1. Update `APP_URL` in `/app/backend/.env` with your custom domain
2. Go to Admin → Configuración → PayPal
3. Switch mode to "Live (Producción)"
4. Verify your Live credentials are entered
5. Click "Re-sincronizar Planes" to create plans in PayPal Live
6. PayPal will automatically use the Live credentials

### Custom Domain Configuration
- PayPal will work with any domain
- Just update APP_URL and re-sync plans after changing modes

## Test Credentials
- **Admin:** admin@vcardpro.com / admin123

## Database Collections
- `users` - User accounts
- `vcards` - Digital business cards
- `plans` - Subscription plans (includes trial_days, paypal_plan_id)
- `subscriptions` - User subscriptions
- `settings` - PayPal and email configuration (includes sandbox/live credentials)

---

*Last Updated: March 4, 2026*
*Developed by MW Digital Estate - https://maldivasweb.com*

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

### File Upload
- `POST /api/upload/image` - Upload profile image (returns URL)

### Plans
- `GET /api/plans` - List all plans (includes trial_days)
- `GET /api/plans/{id}` - Get plan details
- `POST /api/plans` - Create plan (admin)
- `PUT /api/plans/{id}` - Update plan (admin) - auto-resets paypal_plan_id if trial_days changes
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
- `POST /api/admin/paypal/sync-plan` - Sync plan with PayPal (includes trial)
- `POST /api/admin/paypal/sync-all-plans` - Sync all plans
- `GET /api/admin/settings` - Get PayPal settings
- `PUT /api/admin/settings/paypal` - Update PayPal config
- `PUT /api/admin/settings/email` - Update email config

### Webhooks
- `POST /api/webhooks/paypal` - PayPal webhook handler

## Completed Features (as of Feb 20, 2026)

### ✅ Core Application
- Full authentication system
- vCard CRUD operations
- QR code generation
- Public card viewing
- **Image upload from device**

### ✅ Admin Dashboard
- User management with delete functionality
- Plan management with **trial_days** configuration
- PayPal configuration page
- Email configuration page

### ✅ PayPal Recurring Payments
- PayPal Subscriptions API integration
- Plan synchronization with PayPal
- **Trial period support (native PayPal TRIAL billing cycles)**
- Recurring subscription flow
- Automatic payment renewal
- Webhook handling for payment events
- Auto-reset paypal_plan_id when trial_days changes

### ✅ UI/Branding
- Olivo Cards branding
- Custom logo
- Olive green color scheme
- Footer with MW Digital Estate link
- **Trial badges on pricing cards**
- **"Probar X días gratis" buttons**
- **Trial checkout notices**
- **Site title: "Business Cards by Olivo Recicla"**
- **"Made with Emergent" badge hidden via CSS**

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
- **When trial_days changes, PayPal plan is automatically reset**

### Image Upload
- Files stored in `/app/backend/uploads/`
- Served at `/uploads/{filename}`
- Max file size: 5MB
- Allowed types: JPG, PNG, GIF, WebP

### Email Setup
- Requires Gmail App Password (16-character code)
- NOT the regular Gmail password
- Instructions in Admin Dashboard → Configuración

## Test Credentials
- **Admin:** admin@vcardpro.com / admin123
- **Test Users:** testupload@test.com, testtrial@test.com (password: Test123!)

## Database Collections
- `users` - User accounts
- `vcards` - Digital business cards
- `plans` - Subscription plans (includes trial_days, paypal_plan_id)
- `subscriptions` - User subscriptions
- `settings` - PayPal and email configuration

---

*Last Updated: December 2025*
*Developed by MW Digital Estate - https://maldivasweb.com*
