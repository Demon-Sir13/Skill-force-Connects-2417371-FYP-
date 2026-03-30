// ── Crash guards (must be first) ──────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
  process.exit(1);
});

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Init socket (wrapped in try/catch for safety)
try {
  const { initSocket } = require('./socket/socket');
  initSocket(httpServer);
} catch (err) {
  console.warn('[Socket] Failed to initialize:', err.message);
}

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Serve uploaded files ──────────────────────────────────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── NoSQL injection sanitization ──────────────────────────────────────────────
app.use(mongoSanitize());

// ── Global rate limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// ── Strict limiter for auth endpoints ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/resend-otp', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/jobs',          require('./routes/job.routes'));
app.use('/api/messages',      require('./routes/message.routes'));
app.use('/api/organizations', require('./routes/organization.routes'));
app.use('/api/providers',     require('./routes/provider.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/upload',        require('./routes/upload.routes'));
app.use('/api/applications',  require('./routes/application.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/subscriptions', require('./routes/subscription.routes'));
app.use('/api/reviews',       require('./routes/review.routes'));
app.use('/api/contracts',     require('./routes/contract.routes'));
app.use('/api/matching',      require('./routes/matching.routes'));
app.use('/api/work-updates', require('./routes/workupdate.routes'));

app.use('/api/payments', require('./routes/payment.routes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ message: 'SkillForce API running', status: 'ok' }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is empty
  try {
    const { seedDatabase } = require('./seed/seed');
    await seedDatabase();
  } catch (err) {
    console.warn('[Seed] Skipped:', err.message);
  }

  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
