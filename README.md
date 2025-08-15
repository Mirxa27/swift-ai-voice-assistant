# Newomen - AI Conversational Platform for Personal Growth

![Newomen](public/opengraph-image.png)

## 🌟 Overview

Newomen is a production-ready AI conversational platform designed to support women's personal growth journeys through emotionally intelligent conversations, assessments, and transformative guidance. Built with cutting-edge technology and a beautiful glassmorphic UI.

## ✨ Features

### Core Capabilities
- **🎙️ Real-time Speech-to-Speech Conversations** - WebRTC-powered voice interactions with < 100ms latency
- **🤖 Multi-Provider AI Integration** - OpenAI, Gemini, Deepgram, ElevenLabs with automatic failover
- **💎 Gamification System** - Crystals, levels, achievements, and progress tracking
- **📊 Comprehensive Assessments** - Balance wheel visualization with 8 life areas
- **🧘 Wellness Library** - Guided breathing exercises and meditation resources
- **👥 Community Features** - User connections and compatibility matching
- **📖 Narrative Exploration** - AI-powered personal story analysis
- **💳 Subscription Management** - PayPal integration with three-tier pricing
- **📱 Progressive Web App** - Offline support and mobile-optimized experience
- **🎨 Glassmorphic Design** - Beautiful, modern UI with smooth animations

### Technical Highlights
- **Database**: PostgreSQL with Prisma ORM + Redis caching
- **Authentication**: JWT-based with secure sessions
- **Real-time**: WebRTC for voice, Socket.io for messaging
- **AI Providers**: Unified abstraction layer with usage tracking
- **Admin Dashboard**: Complete control panel with analytics
- **PWA**: Service workers with intelligent caching strategies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Redis server
- AI provider API keys (at least one)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/newomen.git
cd newomen
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📦 Deployment to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/newomen)

### Manual Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Configure environment variables**
```bash
# Set up required environment variables in Vercel dashboard or via CLI
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production
# ... add all required variables
```

3. **Deploy to production**
```bash
vercel --prod
```

### Required Environment Variables

#### Database
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

#### Authentication
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin panel password

#### AI Providers (at least one required)
- `OPENAI_API_KEY` - OpenAI API key
- `GEMINI_API_KEY` - Google Gemini API key
- `DEEPGRAM_API_KEY` - Deepgram API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key

#### Payment (optional)
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret

See `.env.example` for complete list.

## 🏗️ Architecture

```
newomen/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── balance/           # Assessment system
│   ├── chat/              # Chat interface
│   ├── journey/           # Gamification display
│   └── wellness/          # Wellness library
├── components/            # React components
│   └── ui/               # Glassmorphic UI components
├── lib/                   # Core libraries
│   ├── ai/               # AI provider integrations
│   ├── auth/             # Authentication system
│   ├── gamification/     # Rewards & achievements
│   ├── payments/         # PayPal integration
│   └── webrtc/           # Real-time voice
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🔧 Configuration

### Database Setup

1. **PostgreSQL**
```sql
CREATE DATABASE newomen;
```

2. **Run migrations**
```bash
npx prisma migrate deploy
```

3. **Seed initial data (optional)**
```bash
npx prisma db seed
```

### Redis Setup
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu
```

### AI Provider Configuration

Configure at least one AI provider in your environment variables:

```env
# OpenAI (recommended)
OPENAI_API_KEY=sk-...

# Or Google Gemini
GEMINI_API_KEY=...
```

## 📱 Progressive Web App

The application is a fully functional PWA with:
- Offline support
- Install prompts
- Push notifications (coming soon)
- Background sync

To install on mobile:
1. Open in Chrome/Safari
2. Tap "Add to Home Screen"
3. Launch from home screen

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📊 Admin Dashboard

Access the admin dashboard at `/admin` with your configured password.

Features:
- User management
- AI provider configuration
- Revenue analytics
- Content management
- Environment variables
- System monitoring

## 🔐 Security

- JWT-based authentication
- Encrypted sessions in Redis
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection
- CORS configuration

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components with [Framer Motion](https://www.framer.com/motion/)
- Database with [Prisma](https://www.prisma.io/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

For support, email support@newomen.ai or open an issue on GitHub.

---

**Built with 💜 by the Newomen Team**
