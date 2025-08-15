#!/bin/bash

# Newomen Deployment Script
# This script prepares and deploys the application to Vercel

echo "🚀 Starting Newomen deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
        npm i -g vercel
    fi
    
    echo -e "${GREEN}✅ All requirements met${NC}"
}

# Validate environment variables
validate_env() {
    echo "🔐 Validating environment variables..."
    
    if [ ! -f .env.local ]; then
        echo -e "${RED}❌ .env.local file not found${NC}"
        echo "Please copy .env.example to .env.local and configure it"
        exit 1
    fi
    
    # Check for required variables
    required_vars=("DATABASE_URL" "REDIS_URL" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.local; then
            echo -e "${YELLOW}⚠️  Warning: $var not found in .env.local${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Environment variables configured${NC}"
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Generate Prisma client
generate_prisma() {
    echo "🗄️ Generating Prisma client..."
    npx prisma generate
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to generate Prisma client${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prisma client generated${NC}"
}

# Build the application
build_app() {
    echo "🔨 Building application..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Build successful${NC}"
}

# Deploy to Vercel
deploy_vercel() {
    echo "☁️ Deploying to Vercel..."
    
    if [ "$1" == "production" ]; then
        echo "Deploying to production..."
        vercel --prod
    else
        echo "Deploying to preview..."
        vercel
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Deployment successful!${NC}"
}

# Main deployment flow
main() {
    check_requirements
    validate_env
    install_deps
    generate_prisma
    build_app
    
    # Ask for deployment target
    echo ""
    echo "Select deployment target:"
    echo "1) Preview"
    echo "2) Production"
    read -p "Enter choice [1-2]: " choice
    
    case $choice in
        1)
            deploy_vercel "preview"
            ;;
        2)
            deploy_vercel "production"
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Newomen deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Configure environment variables in Vercel dashboard"
    echo "2. Set up database with: npx prisma migrate deploy"
    echo "3. Configure custom domain (optional)"
    echo "4. Monitor application at: https://vercel.com/dashboard"
}

# Run main function
main