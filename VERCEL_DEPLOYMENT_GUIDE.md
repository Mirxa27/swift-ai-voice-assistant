# 🚀 Vercel Deployment Guide for Newomen AI Platform

## ✅ Pre-Deployment Checklist
- [x] Build successful locally
- [x] Environment variables configured
- [x] Database schema ready
- [ ] Vercel account created
- [ ] Database services set up

## 📋 Step-by-Step Deployment Instructions

### Step 1: Authenticate with Vercel
```bash
vercel login
```
Enter your email and follow the authentication link.

### Step 2: Deploy to Vercel
```bash
vercel --prod
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (for first deployment)
- **Project name?** → newomen-ai (or your preferred name)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

### Step 3: Set Environment Variables

#### Option A: Using Vercel CLI (Recommended)
Run our setup script:
```bash
./scripts/setup-vercel-env.sh
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add these required variables:

```env
# 🔴 REQUIRED - Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
REDIS_URL=redis://default:[password]@[host]:[port]

# 🔴 REQUIRED - Authentication
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password

# 🔴 REQUIRED - Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 🟡 REQUIRED - At least ONE AI Provider
OPENAI_API_KEY=sk-...
# OR
GEMINI_API_KEY=...

# 🟢 OPTIONAL - Additional AI Providers
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...

# 🟢 OPTIONAL - Payment Processing
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### Step 4: Get Free Database Services

#### PostgreSQL Options:

**Option 1: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add `?pgbouncer=true&sslmode=require` to the end

Example:
```
postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=true&sslmode=require
```

**Option 2: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create a database
3. Copy the connection string

**Option 3: Vercel Postgres**
1. In Vercel Dashboard → Storage
2. Create PostgreSQL database
3. It will auto-configure DATABASE_URL

#### Redis Options:

**Option 1: Upstash (Recommended)**
1. Go to [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the Redis URL from Details

Example:
```
redis://default:[password]@[endpoint].upstash.io:6379
```

**Option 2: Vercel KV**
1. In Vercel Dashboard → Storage
2. Create KV Store
3. Use the REST API URL as REDIS_URL

### Step 5: Initialize Database

After deployment, run migrations:

```bash
# Set your production database URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Optional: Seed initial data
npx prisma db seed
```

### Step 6: Verify Deployment

1. **Visit your app**: https://[your-project].vercel.app
2. **Test registration**: Create a new account
3. **Test AI chat**: Send a message
4. **Check admin panel**: /admin (use NEXT_PUBLIC_ADMIN_PASSWORD)

## 🔧 Troubleshooting

### Build Fails
```bash
# Check logs
vercel logs

# Force rebuild
vercel --prod --force
```

### Database Connection Issues
- Ensure `?sslmode=require` is in PostgreSQL URL
- For Supabase, add `?pgbouncer=true`
- Check if database is in the same region as Vercel deployment

### Environment Variables Not Working
```bash
# List all env vars
vercel env ls

# Pull to local .env
vercel env pull
```

### Redis Connection Issues
- Upstash: Use the Redis URL, not REST URL
- Ensure password is included in URL
- Check firewall/network settings

## 📊 Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] User registration works
- [ ] Login functionality works
- [ ] AI chat responds
- [ ] Database operations work
- [ ] Redis caching works
- [ ] Admin panel accessible
- [ ] PWA installable
- [ ] SSL certificate active

## 🎯 Quick Start Commands

```bash
# Full deployment from scratch
vercel login
vercel --prod

# Add all required env vars at once (example)
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production
vercel env add NEXT_PUBLIC_ADMIN_PASSWORD production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add OPENAI_API_KEY production

# Deploy with env vars
vercel --prod

# Check deployment
vercel ls
vercel inspect [deployment-url]
```

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase](https://supabase.com) - Free PostgreSQL
- [Upstash](https://upstash.com) - Free Redis
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini API

## 💡 Pro Tips

1. **Use Vercel's Edge Network**: Your app will be fast globally
2. **Enable Analytics**: Free with Vercel
3. **Set up Monitoring**: Use Vercel's built-in monitoring
4. **Configure Domains**: Add custom domain in Settings → Domains
5. **Enable Speed Insights**: Free performance monitoring

## 🆘 Need Help?

- Check build logs: `vercel logs`
- View function logs: `vercel logs [function-name]`
- Discord: [Vercel Discord](https://vercel.com/discord)
- Documentation: [vercel.com/docs](https://vercel.com/docs)

---

**Ready to deploy!** Follow the steps above and your Newomen AI Platform will be live in minutes! 🎉