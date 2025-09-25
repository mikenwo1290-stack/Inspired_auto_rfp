# AutoRFP Deployment Guide

## 🚀 Production Deployment Checklist

### 1. Required Services Setup

#### Database (PostgreSQL)
- **Option A**: Supabase Database (Recommended)
  - Go to your Supabase project → Settings → Database
  - Copy the connection string for `DATABASE_URL` and `DIRECT_URL`
  
- **Option B**: Other PostgreSQL providers
  - Railway, Neon, PlanetScale, or AWS RDS
  - Ensure connection pooling is enabled

#### Supabase Authentication
- Create a Supabase project at [supabase.com](https://supabase.com)
- Go to Settings → API
- Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Copy Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Configure Authentication → Providers (Email)
- Set up Email Templates

#### OpenAI API
- Create account at [platform.openai.com](https://platform.openai.com)
- Generate API key in API Keys section
- Add credits to your account
- Copy key to `OPENAI_API_KEY`

#### LlamaCloud Integration
- Create account at [cloud.llamaindex.ai](https://cloud.llamaindex.ai)
- Create a new project
- Generate API key
- Copy key to `LLAMACLOUD_API_KEY`

### 2. Environment Variables for Production

Set these in your deployment platform (Vercel):

```bash
# Database
DATABASE_URL="postgresql://username:password@your-db-host:5432/auto_rfp"
DIRECT_URL="postgresql://username:password@your-db-host:5432/auto_rfp"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# LlamaCloud
LLAMACLOUD_API_KEY="your-llamacloud-api-key"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 3. Deployment Steps

#### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Database Migration**
   ```bash
   # Run this after deployment
   npx prisma migrate deploy
   ```

#### Alternative Platforms
- **Railway**: Connect GitHub repo, add PostgreSQL addon
- **Heroku**: Use Heroku Postgres addon
- **Digital Ocean**: App Platform with managed database

### 4. Post-Deployment Setup

1. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Verify Environment Variables**
   - Check all variables are set correctly
   - Test API connections

3. **Test Core Features**
   - User registration/login
   - Organization creation
   - Document upload
   - AI response generation

### 5. Production Optimizations

#### Next.js Configuration
The app is already configured with:
- React Strict Mode
- Proper caching headers
- Server external packages configuration

#### Performance Considerations
- Database connection pooling (handled by Prisma)
- API rate limiting (implement if needed)
- File upload size limits
- AI response caching (consider implementing)

### 6. Monitoring & Maintenance

#### Health Checks
- Monitor API endpoints
- Check database connections
- Monitor AI API usage and costs

#### Security
- Regular dependency updates
- Environment variable security
- API key rotation
- User access monitoring

## 🎯 Quick Start Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.production.example .env.local
# Edit .env.local with your actual values

# 3. Generate Prisma client
pnpm prisma generate

# 4. Run database migrations
pnpm prisma migrate deploy

# 5. Build for production
pnpm build

# 6. Start production server
pnpm start
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection**
- Verify DATABASE_URL format
- Check network access
- Ensure database is running

**Authentication Issues**
- Verify Supabase URL and keys
- Check email template configuration
- Ensure redirect URLs are correct

**AI Processing**
- Verify OpenAI API key and credits
- Check LlamaCloud API key
- Monitor API rate limits

**Build Errors**
- Check Node.js version (18.x+)
- Verify all dependencies installed
- Check TypeScript errors

## 📞 Support

- Check the main README.md for detailed setup
- Review API documentation
- Test with sample RFP document provided
- Monitor application logs for errors
