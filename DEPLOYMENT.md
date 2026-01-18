# WorkForce Deployment Guide

Complete guide for deploying to **Vercel** (frontend), **Render** (backend), and **MongoDB Atlas** (database).

---

## Prerequisites

- Node.js 18+ installed locally
- Git repository (GitHub/GitLab)
- Accounts created:
  - [Vercel](https://vercel.com)
  - [Render](https://render.com)
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - [Stripe](https://dashboard.stripe.com) (for payments)
  - Gmail or SendGrid (for emails)

---

## Part 1: MongoDB Atlas Setup

### 1.1 Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster (select AWS, region closest to your users)
3. Create database user:
   - Username: `workforce_admin`
   - Password: Generate strong password (save it!)
4. Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)

### 1.2 Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string:
   ```
   mongodb+srv://workforce_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `mongodb+srv://...mongodb.net/workforce?retryWrites=true&w=majority`

---

## Part 2: Backend Deployment (Render)

### 2.1 Prepare Backend

1. Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: workforce-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: CLIENT_URL
        sync: false
      - key: EMAIL_HOST
        value: smtp.gmail.com
      - key: EMAIL_PORT
        value: 587
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
      - key: EMAIL_FROM
        value: WorkForce <no-reply@workforce.app>
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
```

2. Update `server/package.json` scripts:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

### 2.2 Deploy to Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. New → Web Service
4. Connect your GitHub repo
5. Configure:
   - **Name:** workforce-api
   - **Region:** Oregon (or closest)
   - **Branch:** main
   - **Root Directory:** server
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   - `MONGO_URI`: Your Atlas connection string
   - `JWT_SECRET`: Generate random 32+ char string
   - `CLIENT_URL`: (will add after Vercel deploy)
   - `EMAIL_USER`: your@gmail.com
   - `EMAIL_PASS`: Gmail App Password (see below)
   - `STRIPE_SECRET_KEY`: From Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET`: (will add after webhook setup)
7. Click "Create Web Service"
8. Wait for deployment (5-10 min)
9. Copy your API URL: `https://workforce-api-xxxx.onrender.com`

### 2.3 Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Search "App passwords"
4. Generate password for "Mail"
5. Copy 16-character password → use as `EMAIL_PASS`

---

## Part 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend

1. Create `vercel.json` in `client/` folder:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

2. Update `client/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'react-hot-toast'],
          socket: ['socket.io-client'],
        },
      },
    },
  },
});
```

3. Update `client/src/utils/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// ... rest of file
```

### 3.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import Project → Select your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
4. Add Environment Variable:
   - `VITE_API_URL`: Your Render API URL (e.g., `https://workforce-api-xxxx.onrender.com/api`)
5. Click "Deploy"
6. Wait for deployment (2-3 min)
7. Copy your Vercel URL: `https://workforce-xxxx.vercel.app`

### 3.3 Update Backend with Frontend URL

1. Go back to Render dashboard
2. Environment → Add/Update:
   - `CLIENT_URL`: Your Vercel URL
3. Trigger manual deploy

---

## Part 4: Stripe Webhook Setup

### 4.1 Configure Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://workforce-api-xxxx.onrender.com/api/payments/webhook`
3. Select events:
   - `checkout.session.completed`
4. Copy "Signing secret" (starts with `whsec_`)
5. Add to Render env vars:
   - `STRIPE_WEBHOOK_SECRET`: Your signing secret
6. Redeploy backend

---

## Part 5: Database Seeding (Optional)

### 5.1 Create Admin User

Connect to MongoDB Atlas using MongoDB Compass or CLI:

```javascript
// Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@workforce.app",
  password: "$2a$12$...", // Use bcrypt to hash "admin123"
  role: "admin",
  profileImage: "",
  suspended: false,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

Or register normally and update role:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
);
```

### 5.2 Seed Sample Data (Optional)

```javascript
// Sample organizations
db.users.insertMany([
  {
    name: "Summit Media Strategies",
    email: "summit@example.com",
    password: "$2a$12$...",
    role: "organization",
    createdAt: new Date()
  },
  {
    name: "City Hospital",
    email: "hospital@example.com",
    password: "$2a$12$...",
    role: "organization",
    createdAt: new Date()
  }
]);

// Sample jobs
db.jobs.insertMany([
  {
    organizationId: ObjectId("..."),
    title: "Video Editor Needed",
    description: "Looking for experienced video editor for social media content",
    category: "Design",
    budget: 1500,
    deadline: new Date("2024-12-31"),
    status: "open",
    createdAt: new Date()
  }
]);
```

---

## Part 6: Post-Deployment Checklist

### 6.1 Test Everything

- [ ] Visit your Vercel URL
- [ ] Register as organization
- [ ] Register as provider
- [ ] Post a job
- [ ] Apply to job
- [ ] Test messaging
- [ ] Test payments (use Stripe test card: `4242 4242 4242 4242`)
- [ ] Test admin panel
- [ ] Test email notifications

### 6.2 Monitor

- **Render Logs:** Check for errors in Render dashboard
- **Vercel Logs:** Check deployment logs
- **MongoDB Atlas:** Monitor connections and queries

### 6.3 Custom Domain (Optional)

**Vercel:**
1. Domains → Add Domain
2. Add DNS records from your provider

**Render:**
1. Settings → Custom Domain
2. Add CNAME record

---

## Part 7: Environment Variables Reference

### Backend (Render)

```bash
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/workforce
JWT_SECRET=your_super_secret_key_min_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=https://workforce-xxxx.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=WorkForce <no-reply@workforce.app>
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

### Frontend (Vercel)

```bash
VITE_API_URL=https://workforce-api-xxxx.onrender.com/api
```

---

## Part 8: Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all env vars are set

### Frontend can't connect to backend
- Check CORS settings in `server/src/index.js`
- Verify `VITE_API_URL` is correct
- Check browser console for errors

### Emails not sending
- Verify Gmail App Password
- Check spam folder
- Review Render logs for email errors

### Stripe webhook failing
- Verify webhook URL is correct
- Check signing secret matches
- Test with Stripe CLI locally first

### Socket.io not connecting
- Ensure WebSocket support on Render (free tier supports it)
- Check CORS configuration includes Socket.io

---

## Part 9: Scaling & Production Tips

### Performance
- Enable MongoDB Atlas indexes
- Use Render's paid tier for better performance
- Add Redis for caching (optional)
- Implement CDN for static assets

### Security
- Rotate JWT secret regularly
- Use strong passwords
- Enable MongoDB Atlas IP whitelist
- Set up rate limiting (already configured)
- Regular security audits

### Monitoring
- Set up Sentry for error tracking
- Use LogRocket for session replay
- Monitor Render metrics
- Set up uptime monitoring (UptimeRobot)

### Backup
- Enable MongoDB Atlas automated backups
- Export critical data regularly
- Version control all code

---

## Support

For issues:
1. Check Render/Vercel logs
2. Review MongoDB Atlas metrics
3. Test locally first
4. Check environment variables

---

## Cost Breakdown (Free Tier)

- **MongoDB Atlas:** Free (M0 cluster, 512MB)
- **Render:** Free (750 hours/month, sleeps after 15min inactivity)
- **Vercel:** Free (100GB bandwidth, unlimited deployments)
- **Stripe:** Free (2.9% + $0.30 per transaction)
- **Total:** $0/month for development/testing

**Note:** Render free tier sleeps after inactivity. First request after sleep takes ~30s to wake up.

---

## Next Steps

1. Deploy and test thoroughly
2. Add custom domain
3. Set up monitoring
4. Create user documentation
5. Plan feature roadmap
6. Gather user feedback

🚀 **Your WorkForce platform is now live!**
