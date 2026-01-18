# 🚀 VaultBank Deployment Guide

## Overview

This guide covers deploying VaultBank to production:
- **Frontend**: Vercel (recommended)
- **Backend**: Railway or Render (recommended)
- **Database**: Neon PostgreSQL (free tier available)

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository with latest code
- [ ] Neon/Supabase account for PostgreSQL database
- [ ] Railway/Render account for backend hosting
- [ ] Vercel account for frontend hosting
- [ ] Gmail account with App Password for email/OTP

---

## Step 1: Set Up PostgreSQL Database (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project named `vaultbank`
3. Copy the connection string (looks like `postgresql://user:pass@host/db`)
4. Run the database schema:
   ```bash
   # Connect using psql or Neon's SQL editor
   # Run the contents of: backend/database/schema.sql
   # Then run: backend/database/seed.sql (optional, for test data)
   ```

---

## Step 2: Deploy Backend (Railway)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository and choose the `backend` folder
4. Add environment variables in Railway dashboard:

```env
DATABASE_URL=your-neon-connection-string
JWT_ACCESS_SECRET=generate-32-char-secret
JWT_REFRESH_SECRET=generate-32-char-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

5. Railway will auto-detect the Node.js project and deploy
6. Copy the generated URL (e.g., `https://vaultbank-api.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com) and sign in
2. Create a **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add the same environment variables as above

---

## Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → Import your repository
3. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add environment variable:
   ```
   VITE_API_URL = https://your-backend-url.railway.app
   ```

5. Click **Deploy**

---

## Step 4: Update CORS Settings

After getting your Vercel URL, update the backend's `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🔐 Generating Secure Secrets

For JWT secrets, use:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## 📧 Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate a new app password for "Mail"
5. Use this 16-character password as `EMAIL_PASSWORD`

---

## 🧪 Post-Deployment Testing

1. Visit your Vercel URL
2. Test registration flow
3. Test login flow (customer and banker)
4. Verify OTP emails are received
5. Test all dashboard features

---

## 🔧 Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` includes your Vercel domain
- Check browser console for specific error messages

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if SSL is required (add `?sslmode=require` if needed)

### Email Not Sending
- Verify Gmail App Password is correct
- Check spam folder for OTP emails
- Ensure "Less secure apps" is not the issue (use App Password)

### Build Failures
- Check build logs in Vercel/Railway dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to verify

---

## 📁 Project Structure for Deployment

```
vaultbank/
├── frontend/           # Deploy to Vercel
│   ├── vercel.json     # Vercel configuration
│   ├── package.json
│   └── ...
│
└── backend/            # Deploy to Railway/Render
    ├── package.json
    ├── tsconfig.json
    └── ...
```

---

## 🌐 Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Railway
1. Go to Service Settings → Domains
2. Add custom domain
3. Update DNS CNAME record

---

## ✅ Deployment Complete!

Your VaultBank application should now be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-api.railway.app`
- **Health Check**: `https://your-api.railway.app/health`
