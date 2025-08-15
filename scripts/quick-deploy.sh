#!/bin/bash

# Quick Deploy Script for Newomen AI Platform
# This script helps you deploy to Vercel quickly

echo "🚀 Newomen AI Platform - Quick Deploy to Vercel"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Vercel CLI is installed
if ! command_exists vercel; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo "Installing Vercel CLI globally..."
    npm i -g vercel
fi

echo -e "${GREEN}✓ Vercel CLI is installed${NC}"
echo ""

# Check if user is logged in
echo "📝 Checking Vercel authentication..."
if ! vercel whoami >/dev/null 2>&1; then
    echo -e "${YELLOW}Please log in to Vercel:${NC}"
    vercel login
else
    echo -e "${GREEN}✓ Already logged in to Vercel${NC}"
fi

echo ""
echo "📦 Starting deployment process..."
echo ""

# Ask if this is first deployment
read -p "Is this your first deployment? (y/n): " first_deploy

if [ "$first_deploy" = "y" ]; then
    echo ""
    echo -e "${BLUE}🔧 First-time deployment setup${NC}"
    echo ""
    echo "We'll help you set up your project on Vercel."
    echo ""
    
    # Deploy to Vercel
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Set up your environment variables${NC}"
    echo ""
    echo "You need to add environment variables in Vercel Dashboard:"
    echo ""
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → Environment Variables"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (PostgreSQL connection string)"
    echo "  - REDIS_URL (Redis connection string)"
    echo "  - JWT_SECRET (32+ character secret)"
    echo "  - NEXT_PUBLIC_ADMIN_PASSWORD (admin password)"
    echo "  - NEXT_PUBLIC_APP_URL (your Vercel app URL)"
    echo "  - OPENAI_API_KEY or GEMINI_API_KEY (AI provider)"
    echo ""
    echo -e "${BLUE}Free Database Services:${NC}"
    echo "  PostgreSQL: https://supabase.com (recommended)"
    echo "  Redis: https://upstash.com (recommended)"
    echo ""
    read -p "Press Enter after adding environment variables to continue..."
    
    echo ""
    echo "Triggering a new deployment with environment variables..."
    vercel --prod
    
else
    echo ""
    echo "Deploying updates to existing project..."
    vercel --prod
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Get the deployment URL
echo "Getting deployment URL..."
deployment_url=$(vercel ls --json | grep -o '"url":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$deployment_url" ]; then
    echo -e "${GREEN}🌐 Your app is live at: https://$deployment_url${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Visit your app: https://$deployment_url"
    echo "2. Test user registration"
    echo "3. Try the AI chat"
    echo "4. Access admin panel at: https://$deployment_url/admin"
else
    echo "Visit your Vercel dashboard to see your deployment URL"
fi

echo ""
echo "📚 For detailed setup instructions, see: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}🎉 Congratulations! Your Newomen AI Platform is deployed!${NC}"