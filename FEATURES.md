# SkillForce — Complete Feature List

## 🎯 Core Features
- Professional job application workflow (CV, portfolio, cover letter, expected salary)
- Application management (Pending → Shortlisted → Interview → Approved → Contracted)
- Contract generation with digital signing
- Real-time messaging with Socket.io
- 10 free messages, then premium unlock via PeriPay
- Subscription plans: Free, Pro (₨150/mo), Business (₨999/mo)
- Admin panel with stats, user management, verification

## 🔐 Authentication
- 2-step login: email/password → 6-digit OTP
- OTP logged to console in dev mode
- JWT with role in payload
- Trusted device support (skip OTP for 30 days)
- Account lockout after 5 failed attempts
- Refresh token rotation

## 💼 Job System
- Nepal-specific categories (Healthcare, Security, IT, Construction, etc.)
- District-based location filters
- Budget in NPR, urgency levels, job types
- Admin approval system

## 📊 Admin Panel
- Total users, providers, organizations
- Revenue tracking, subscription analytics
- User verification, suspension
- Job approval, report management
- Activity logs

## 💳 Payments
- PeriPay integration (NPR)
- Dev mode auto-approve
- Payment history tracking
- Subscription management
