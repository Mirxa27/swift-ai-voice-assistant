#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps you configure all required environment variables for Vercel deployment

echo "🔧 Vercel Environment Variables Setup"
echo "====================================="
echo ""
echo "This script will help you add environment variables to your Vercel project."
echo "Make sure you have already logged in with 'vercel login'"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_description=$2
    local is_required=$3
    local default_value=$4
    
    echo -e "${BLUE}${var_description}${NC}"
    if [ "$is_required" = "true" ]; then
        echo -e "${RED}(Required)${NC}"
    else
        echo -e "${YELLOW}(Optional)${NC}"
    fi
    
    if [ ! -z "$default_value" ]; then
        echo "Default: $default_value"
    fi
    
    read -p "Enter value for $var_name (or press Enter to skip): " value
    
    if [ ! -z "$value" ]; then
        echo "Adding $var_name to Vercel..."
        vercel env add "$var_name" production <<< "$value"
        vercel env add "$var_name" preview <<< "$value"
        vercel env add "$var_name" development <<< "$value"
        echo -e "${GREEN}✓ Added $var_name${NC}"
    elif [ "$is_required" = "true" ]; then
        echo -e "${RED}⚠️  Warning: $var_name is required for the app to function${NC}"
    fi
    echo ""
}

echo "📋 Starting environment variable configuration..."
echo ""

# Database Configuration
echo -e "${YELLOW}=== Database Configuration ===${NC}"
add_env_var "DATABASE_URL" "PostgreSQL connection string (e.g., postgresql://user:pass@host/db)" "true"
add_env_var "REDIS_URL" "Redis connection string (e.g., redis://default:pass@host:port)" "true"

# Authentication
echo -e "${YELLOW}=== Authentication ===${NC}"
add_env_var "JWT_SECRET" "Secret key for JWT tokens (32+ characters)" "true"
add_env_var "NEXT_PUBLIC_ADMIN_PASSWORD" "Admin panel password" "true"

# Application URLs
echo -e "${YELLOW}=== Application URLs ===${NC}"
echo "Note: NEXT_PUBLIC_APP_URL will be automatically set to your Vercel deployment URL"
read -p "Enter your Vercel app URL (e.g., https://newomen.vercel.app): " app_url
if [ ! -z "$app_url" ]; then
    vercel env add "NEXT_PUBLIC_APP_URL" production <<< "$app_url"
    vercel env add "NEXT_PUBLIC_APP_URL" preview <<< "$app_url"
    vercel env add "NEXT_PUBLIC_APP_URL" development <<< "http://localhost:3000"
    echo -e "${GREEN}✓ Added NEXT_PUBLIC_APP_URL${NC}"
fi
echo ""

# AI Providers
echo -e "${YELLOW}=== AI Provider Configuration ===${NC}"
echo "You need at least ONE AI provider configured"
echo ""

add_env_var "OPENAI_API_KEY" "OpenAI API key (recommended)" "false"
add_env_var "GEMINI_API_KEY" "Google Gemini API key" "false"
add_env_var "DEEPGRAM_API_KEY" "Deepgram API key for speech-to-text" "false"
add_env_var "ELEVENLABS_API_KEY" "ElevenLabs API key for text-to-speech" "false"

# PayPal (Optional)
echo -e "${YELLOW}=== PayPal Configuration (Optional) ===${NC}"
add_env_var "PAYPAL_CLIENT_ID" "PayPal Client ID" "false"
add_env_var "PAYPAL_CLIENT_SECRET" "PayPal Client Secret" "false"

# Feature Flags (Optional)
echo -e "${YELLOW}=== Feature Flags (Optional) ===${NC}"
add_env_var "ENABLE_VOICE_MODE" "Enable voice mode (true/false)" "false" "true"
add_env_var "ENABLE_GAMIFICATION" "Enable gamification (true/false)" "false" "true"

echo ""
echo -e "${GREEN}✅ Environment variable configuration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'vercel' to deploy your application"
echo "2. Run 'npx prisma migrate deploy' after deployment to set up database"
echo "3. Visit your deployment URL to test the application"
echo ""
echo "To view or modify environment variables later:"
echo "- Visit: https://vercel.com/dashboard/[your-project]/settings/environment-variables"
echo "- Or use: vercel env ls"
echo ""