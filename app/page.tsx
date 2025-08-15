'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import {
  SparklesIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Conversations',
      description: 'Engage in meaningful dialogue with your emotionally intelligent companion',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: SparklesIcon,
      title: 'Personal Journey',
      description: 'Track your transformation with gamified progress and achievements',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: HeartIcon,
      title: 'Wellness Practices',
      description: 'Access guided breathing exercises and mindfulness resources',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Community',
      description: 'Connect with others on similar journeys of growth',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrophyIcon,
      title: 'Achievements',
      description: 'Earn crystals and unlock new levels as you progress',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: ChartBarIcon,
      title: 'Insights',
      description: 'Gain deep understanding of your patterns and growth areas',
      color: 'from-indigo-500 to-purple-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20"
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Newomen
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              Your emotionally intelligent AI companion for personal transformation and growth
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <GlassButton size="xl" className="min-w-[200px]">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Start Conversation
                </GlassButton>
              </Link>
              <Link href="/onboarding">
                <GlassButton variant="secondary" size="xl" className="min-w-[200px]">
                  <SparklesIcon className="w-5 h-5" />
                  Begin Journey
                </GlassButton>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">10K+</div>
              <div className="text-white/60 mt-1">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">500K+</div>
              <div className="text-white/60 mt-1">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">4.9★</div>
              <div className="text-white/60 mt-1">User Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need for Growth
            </h2>
            <p className="text-white/60 text-lg">
              Comprehensive tools and support for your transformation journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Path
            </h2>
            <p className="text-white/60 text-lg">
              Flexible plans to support your growth journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Discovery Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Discovery</h3>
                  <div className="text-3xl font-bold text-white">
                    Free
                    <span className="text-lg text-white/60 ml-2">10 minutes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    AI conversations
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Basic assessments
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Limited voice mode
                  </li>
                </ul>
                <GlassButton variant="secondary" fullWidth>
                  Start Free
                </GlassButton>
              </GlassCard>
            </motion.div>

            {/* Growth Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard variant="elevated" className="p-6 h-full flex flex-col border-purple-500/50">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
                  <div className="text-3xl font-bold text-white">
                    $22
                    <span className="text-lg text-white/60 ml-2">/100 minutes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Everything in Discovery
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Unlimited voice mode
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Progress tracking
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Community access
                  </li>
                </ul>
                <GlassButton fullWidth>
                  Most Popular
                </GlassButton>
              </GlassCard>
            </motion.div>

            {/* Transformation Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Transformation</h3>
                  <div className="text-3xl font-bold text-white">
                    $222
                    <span className="text-lg text-white/60 ml-2">/1000 minutes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Everything in Growth
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Priority support
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Advanced analytics
                  </li>
                  <li className="text-white/80 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Custom AI training
                  </li>
                </ul>
                <GlassButton variant="secondary" fullWidth>
                  Best Value
                </GlassButton>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard variant="elevated" className="p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Life?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of women on their journey to self-discovery and personal growth
              </p>
              <Link href="/onboarding">
                <GlassButton size="xl">
                  <SparklesIcon className="w-5 h-5" />
                  Start Your Journey Today
                </GlassButton>
              </Link>
            </motion.div>
          </GlassCard>
        </div>
      </section>
    </div>
  )
}