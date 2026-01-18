# WorkForce — Quick Start Guide

Get up and running in 5 minutes.

---

## 🚀 Local Development Setup

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

```bash
# Backend
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

**Minimum required `.env` values:**
```bash
PORT=5001
MONGO_URI=mongodb://localhost:27017/workforce
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
CLIENT_URL=http://localhost:5173
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Free)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

### Step 4: Start Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

### Step 5: Access Application

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5001

---

## 👤 Create Your First Admin User

### Option 1: Via MongoDB

```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@test.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEHK.5W", // "admin123"
  role: "admin",
  profileImage: "",
  suspended: false,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Option 2: Register + Update

1. Register normally at http://localhost:5173/register
2. Update role in MongoDB:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
);
```

---

## 🧪 Test the Application

### 1. Register as Organization

1. Go to http://localhost:5173/register
2. Select "Organization"
3. Fill form and submit
4. You'll be redirected to Organization Dashboard

### 2. Post a Job

1. Click "Post a Job" button
2. Fill in job details:
   - Title: "Frontend Developer Needed"
   - Description: "Looking for React developer..."
   - Category: Development
   - Budget: 2000
   - Deadline: Future date
3. Submit

### 3. Register as Provider

1. Logout
2. Register new account as "Provider"
3. Go to "Browse Jobs"
4. See the job you posted

### 4. Test Messaging

1. As provider, click on a job
2. Click "Message Organization"
3. Send a message
4. Login as organization
5. Check messages

### 5. Access Admin Panel

1. Login with admin account
2. Click "Admin" in navbar
3. View platform analytics
4. Manage users and jobs

---

## 🔧 Common Issues & Fixes

### Backend won't start

**Error:** `MongooseError: connect ECONNREFUSED`

**Fix:** Start MongoDB or check `MONGO_URI` in `.env`

```bash
# Check if MongoDB is running
mongosh

# Or use MongoDB Atlas connection string
```

### Frontend can't connect to backend

**Error:** `Network Error` or `CORS error`

**Fix:** Ensure backend is running on port 5001

```bash
# Check backend logs
cd server
npm run dev
```

### Port already in use

**Error:** `EADDRINUSE: address already in use`

**Fix:** Kill process on that port

```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5001 | xargs kill -9
```

### JWT Secret Error

**Error:** `secretOrPrivateKey must have a value`

**Fix:** Add `JWT_SECRET` to `.env`

```bash
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
```

---

## 📧 Email Setup (Optional)

### Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Search "App passwords"
4. Generate password for "Mail"
5. Add to `.env`:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=WorkForce <no-reply@workforce.app>
```

---

## 💳 Stripe Setup (Optional)

### Get Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy "Publishable key" and "Secret key"
3. Add to `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

### Test Payment

Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

---

## 🎯 Quick Feature Tour

### Organization Flow
1. Register as organization
2. Post a job
3. Browse providers
4. Assign provider to job
5. Change job status
6. Rate provider
7. View analytics

### Provider Flow
1. Register as provider
2. Complete profile
3. Browse jobs
4. View assigned jobs
5. Update job status
6. View earnings
7. Check ratings

### Admin Flow
1. Login as admin
2. View platform stats
3. Manage users
4. Suspend/delete accounts
5. View all jobs
6. Handle reports
7. Monitor activity

---

## 📚 Next Steps

1. ✅ **Read [README.md](./README.md)** — Full documentation
2. ✅ **Read [DEPLOYMENT.md](./DEPLOYMENT.md)** — Deploy to production
3. ✅ **Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** — Complete overview
4. ✅ **Customize** — Add your branding and features
5. ✅ **Deploy** — Go live with Vercel + Render

---

## 🆘 Need Help?

### Documentation
- [README.md](./README.md) — Full documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment guide
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) — Project overview

### Check Logs
```bash
# Backend logs
cd server
npm run dev

# Frontend logs
cd client
npm run dev
```

### Common Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✅ Verification Checklist

- [ ] MongoDB running
- [ ] Backend running on port 5001
- [ ] Frontend running on port 5173
- [ ] Can register new user
- [ ] Can login
- [ ] Can post job (as org)
- [ ] Can browse jobs (as provider)
- [ ] Can send messages
- [ ] Can access admin panel (as admin)

---

## 🎉 You're Ready!

Your WorkForce platform is now running locally. Start building amazing features!

**Happy coding! 🚀**
