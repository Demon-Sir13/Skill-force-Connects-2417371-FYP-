# WorkForce — Premium SaaS Job Portal

A modern, full-stack job marketplace connecting organizations with skilled service providers. Built with React, Node.js, MongoDB, and Socket.io.

![WorkForce](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🎨 Premium Dark UI
- Modern SaaS aesthetic (Stripe/Linear/Notion style)
- Glassmorphism cards with neon glow effects
- Smooth animations and micro-interactions
- Fully responsive mobile-first design
- Collapsible sidebar navigation
- Skeleton loaders and loading states

### 👥 User Roles

**Organizations:**
- Post and manage jobs
- Browse provider profiles
- Assign providers to jobs
- Track job status and progress
- Rate providers after completion
- Real-time messaging
- Payment processing (Stripe)
- Analytics dashboard

**Providers:**
- Create detailed profiles with skills
- Browse and apply to jobs
- Track application status
- View earnings and ratings
- Real-time messaging
- Portfolio management
- Job recommendations

**Admins:**
- User management (suspend/delete)
- Platform analytics and charts
- View all jobs and users
- Handle reports
- Activity logs
- Revenue tracking

### 🔐 Security & Performance
- JWT authentication with auto-refresh
- Role-based access control (RBAC)
- Rate limiting (200 req/15min global, 20 req/15min auth)
- NoSQL injection prevention
- Helmet security headers
- Input validation (client + server)
- Duplicate job prevention
- Suspended user blocking
- XSS protection

### 💬 Real-Time Features
- Socket.io messaging
- Online/offline status
- Unread message badges
- Live notifications
- Instant updates

### 📧 Email Notifications
- Welcome emails
- Job assignment alerts
- Payment confirmations
- Account suspension notices
- Customizable HTML templates

### 💳 Payment Integration
- Stripe Checkout (sandbox mode)
- Secure payment processing
- Webhook handling
- Payment history
- Transaction tracking

### 📊 Analytics & Charts
- User growth trends
- Job statistics
- Revenue tracking
- Role distribution
- Monthly breakdowns
- Interactive charts (Recharts)

### 🎯 Advanced UX
- Debounced search
- Form validation with inline errors
- Toast notifications
- Modal animations
- Smooth page transitions
- Hover effects and tooltips
- Empty states
- Error boundaries

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI library
- **Vite** — Build tool
- **React Router v6** — Routing
- **Tailwind CSS** — Styling
- **Axios** — HTTP client
- **Socket.io Client** — Real-time
- **Lucide React** — Icons
- **React Hot Toast** — Notifications
- **Recharts** — Charts
- **Stripe.js** — Payments

### Backend
- **Node.js** — Runtime
- **Express** — Web framework
- **MongoDB** — Database
- **Mongoose** — ODM
- **Socket.io** — WebSockets
- **JWT** — Authentication
- **Bcrypt** — Password hashing
- **Nodemailer** — Emails
- **Stripe** — Payments
- **Helmet** — Security
- **Express Rate Limit** — Rate limiting
- **Mongo Sanitize** — Injection prevention

---

## 📁 Project Structure

```
workforce-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── DashboardSidebar.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── ProviderCard.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── RouteGuard.jsx
│   │   ├── context/       # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── OrgDashboard.jsx
│   │   │   ├── ProviderDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── PostJob.jsx
│   │   │   ├── MyJobs.jsx
│   │   │   ├── MyAssignedJobs.jsx
│   │   │   ├── Providers.jsx
│   │   │   ├── ProviderProfile.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Earnings.jsx
│   │   │   ├── Ratings.jsx
│   │   │   └── ChangePassword.jsx
│   │   ├── utils/         # Utilities
│   │   │   ├── api.js
│   │   │   ├── useSEO.js
│   │   │   └── useDebounce.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/       # Configuration
│   │   │   └── db.js
│   │   ├── controllers/  # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── job.controller.js
│   │   │   ├── message.controller.js
│   │   │   ├── organization.controller.js
│   │   │   ├── provider.controller.js
│   │   │   ├── admin.controller.js
│   │   │   └── payment.controller.js
│   │   ├── middleware/   # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── models/       # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Job.js
│   │   │   ├── Message.js
│   │   │   ├── OrganizationProfile.js
│   │   │   ├── ProviderProfile.js
│   │   │   ├── Report.js
│   │   │   └── ActivityLog.js
│   │   ├── routes/       # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── job.routes.js
│   │   │   ├── message.routes.js
│   │   │   ├── organization.routes.js
│   │   │   ├── provider.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── payment.routes.js
│   │   ├── socket/       # Socket.io
│   │   │   └── socket.js
│   │   ├── utils/        # Utilities
│   │   │   ├── generateToken.js
│   │   │   ├── email.js
│   │   │   └── activityLog.js
│   │   └── index.js      # Entry point
│   ├── .env.example
│   └── package.json
│
├── DEPLOYMENT.md         # Deployment guide
└── README.md            # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/workforce-portal.git
cd workforce-portal
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

---

## 🔧 Environment Variables

### Backend (.env)

```bash
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/workforce
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=WorkForce <no-reply@workforce.app>
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:5001/api
```

---

## 📖 API Documentation

### Authentication

```bash
POST   /api/auth/register      # Register user
POST   /api/auth/login         # Login
GET    /api/auth/me            # Get current user
PUT    /api/auth/change-password  # Change password
```

### Jobs

```bash
GET    /api/jobs               # Get all jobs (with filters)
GET    /api/jobs/:id           # Get job by ID
POST   /api/jobs               # Create job (org only)
PUT    /api/jobs/:id           # Update job (org only)
DELETE /api/jobs/:id           # Delete job (org only)
PUT    /api/jobs/:id/assign    # Assign provider (org only)
PUT    /api/jobs/:id/status    # Update status (org only)
POST   /api/jobs/:id/rate      # Rate provider (org only)
PUT    /api/jobs/:id/provider-status  # Provider update status
GET    /api/jobs/provider/earnings    # Provider earnings
GET    /api/jobs/provider/ratings     # Provider ratings
```

### Messages

```bash
POST   /api/messages           # Send message
GET    /api/messages/inbox     # Get inbox
GET    /api/messages/:userId   # Get conversation
PUT    /api/messages/:userId/read  # Mark as read
GET    /api/messages/unread-count  # Unread count
```

### Admin

```bash
GET    /api/admin/stats        # Platform stats
GET    /api/admin/users        # Get all users
DELETE /api/admin/users/:id    # Delete user
PUT    /api/admin/users/:id/role      # Change role
PUT    /api/admin/users/:id/suspend   # Suspend user
PUT    /api/admin/users/:id/unsuspend # Unsuspend user
GET    /api/admin/jobs         # Get all jobs
DELETE /api/admin/jobs/:id     # Delete job
GET    /api/admin/reports      # Get reports
POST   /api/admin/reports      # Create report
PUT    /api/admin/reports/:id  # Update report
```

### Payments

```bash
POST   /api/payments/create-checkout  # Create Stripe session
POST   /api/payments/webhook          # Stripe webhook
GET    /api/payments/history          # Payment history
```

---

## 🎨 UI Components

### Buttons
```jsx
<button className="btn-primary">Primary</button>
<button className="btn-outline">Outline</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-danger">Danger</button>
```

### Cards
```jsx
<div className="card">Basic Card</div>
<div className="card-hover">Hover Card</div>
<div className="stat-card">Stat Card</div>
```

### Badges
```jsx
<span className="badge-blue">Blue</span>
<span className="badge-green">Green</span>
<span className="badge-red">Red</span>
```

### Loading
```jsx
<Spinner size="sm" />
<SkeletonGrid count={6} />
<PageLoader />
```

---

## 🧪 Testing

### Test Accounts

**Admin:**
- Email: admin@workforce.app
- Password: admin123

**Organization:**
- Email: org@test.com
- Password: test123

**Provider:**
- Email: provider@test.com
- Password: test123

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide to:
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Design inspiration: Stripe, Linear, Notion
- Icons: Lucide React
- Charts: Recharts
- Payments: Stripe
- Hosting: Vercel & Render

---

## 📧 Support

For support, email support@workforce.app or open an issue.

---

## 🗺️ Roadmap

- [ ] Video interviews
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] AI job matching
- [ ] Multi-language support
- [ ] Dark/Light mode toggle
- [ ] Advanced search filters
- [ ] Calendar integration
- [ ] File attachments
- [ ] Team collaboration features

---

**Built with ❤️ by the WorkForce Team**
