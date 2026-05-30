# SkillForce Deployment Guide

Deploy to **Vercel** (frontend) + **Render** (backend) + **MongoDB Atlas** (database).

---

## Prerequisites

- Node.js 18+ locally
- GitHub repo with this code pushed
- Accounts: [Vercel](https://vercel.com), [Render](https://render.com), [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Gmail account with 2FA enabled (for email)

---

## Part 1: MongoDB Atlas

1. Create a free M0 cluster (AWS, region closest to users)
2. **Database Access** → Add user: `skillforce_admin` with a strong password
3. **Network Access** → Add IP `0.0.0.0/0` (allow all — Render uses dynamic IPs)
4. **Connect** → "Connect your application" → copy the URI:
   ```
   mongodb+srv://skillforce_admin:<password>@cluster0.xxxxx.mongodb.net/skillforce?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

---

## Part 2: Backend on Render

### 2.1 Create Web Service

1. Render Dashboard → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Node version:** 18+

### 2.2 Environment Variables (set in Render dashboard)

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_EXPIRES_IN` | `7d` |
| `JWT_SECRET` | 64-char random string (`openssl rand -hex 32`) |
| `MONGO_URI` | Your Atlas connection string |
| `CLIENT_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `SERVER_URL` | This Render service URL, e.g. `https://skillforce-backend.onrender.com` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password (see below) |
| `EMAIL_FROM` | `SkillForce Nepal <no-reply@skillforce.com.np>` |
| `KHALTI_SECRET_KEY` | Khalti live secret key |
| `ESEWA_MERCHANT_ID` | eSewa merchant code |
| `ESEWA_SECRET_KEY` | eSewa HMAC secret |

> **Note:** `SERVER_URL` is used to build absolute URLs for uploaded images. Without it, image URLs may be incorrect behind Render's reverse proxy.

### 2.3 Gmail App Password

1. [Google Account Security](https://myaccount.google.com/security) → Enable 2-Step Verification
2. Search "App passwords" → Generate for "Mail"
3. Use the 16-character password as `EMAIL_PASS`

### 2.4 Deploy

Click **Create Web Service**. First deploy takes ~5 min. Copy your URL:
`https://skillforce-backend.onrender.com`

---

## Part 3: Frontend on Vercel

### 3.1 Import Project

1. Vercel Dashboard → **Add New → Project**
2. Import your GitHub repo
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.2 Environment Variables (set in Vercel dashboard)

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Render URL, e.g. `https://skillforce-backend.onrender.com` |

> **Important:** Do NOT include `/api` at the end — the client code appends it automatically.

### 3.3 Deploy

Click **Deploy**. Copy your Vercel URL: `https://your-app.vercel.app`

### 3.4 Update Render with Vercel URL

Go back to Render → Environment → set `CLIENT_URL` to your Vercel URL → **Save** (triggers redeploy).

---

## Part 4: Verify Deployment

### Health check
```
GET https://skillforce-backend.onrender.com/
→ { "message": "SkillForce API running", "status": "ok" }
```

### Functional checklist
- [ ] Register as organization
- [ ] Register as provider
- [ ] Login (OTP email received)
- [ ] Post a job
- [ ] Apply to a job
- [ ] Upload a profile image
- [ ] Test messaging
- [ ] Test Khalti/eSewa payment flow
- [ ] Admin panel accessible at `/admin`

---

## Part 5: Troubleshooting

**Frontend can't reach backend**
- Verify `VITE_API_URL` in Vercel env vars (no trailing slash, no `/api`)
- Check CORS: `CLIENT_URL` on Render must exactly match your Vercel URL

**Emails not sending**
- Verify `EMAIL_USER` + `EMAIL_PASS` are set on Render
- Gmail App Password must be used (not your account password)
- Check Render logs: `[Email] Gmail SMTP connected` should appear on startup

**Images not loading after upload**
- Set `SERVER_URL` on Render to your Render service's public URL
- Render free tier has an ephemeral filesystem — uploaded images are lost on redeploy.
  For persistent uploads, configure Cloudinary (set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

**Socket.io not connecting**
- Render free tier supports WebSockets
- `CLIENT_URL` on Render must match the Vercel origin exactly

**Render cold starts (free tier)**
- Free tier sleeps after 15 min of inactivity; first request takes ~30s to wake
- Upgrade to Render Starter ($7/mo) to avoid cold starts

---

## Part 6: Ephemeral Filesystem Warning

Render's free tier does **not** persist files between deploys. Uploaded images (avatars, banners, portfolio) stored in `server/uploads/` will be lost on each deploy.

**Solution:** Configure Cloudinary for persistent cloud storage:
1. Create a free [Cloudinary](https://cloudinary.com) account
2. Add to Render env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. The upload routes will need to be updated to use `multer-storage-cloudinary` instead of disk storage.

---

## Environment Variables Summary

### Render (backend)
```
NODE_ENV=production
PORT=10000
JWT_EXPIRES_IN=7d
JWT_SECRET=<64-char-random>
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://your-app.vercel.app
SERVER_URL=https://skillforce-backend.onrender.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=<gmail-app-password>
EMAIL_FROM=SkillForce Nepal <no-reply@skillforce.com.np>
KHALTI_SECRET_KEY=<khalti-live-key>
ESEWA_MERCHANT_ID=<esewa-merchant-id>
ESEWA_SECRET_KEY=<esewa-secret>
```

### Vercel (frontend)
```
VITE_API_URL=https://skillforce-backend.onrender.com
```
