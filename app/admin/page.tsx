'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import {
  CogIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ServerIcon,
  KeyIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

interface TabConfig {
  id: string
  name: string
  icon: any
  component: React.ComponentType
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  const tabs: TabConfig[] = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon, component: OverviewTab },
    { id: 'environment', name: 'Environment', icon: CogIcon, component: EnvironmentTab },
    { id: 'ai-providers', name: 'AI Providers', icon: ServerIcon, component: AIProvidersTab },
    { id: 'users', name: 'Users', icon: UsersIcon, component: UsersTab },
    { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon, component: RevenueTab },
    { id: 'content', name: 'Content', icon: DocumentTextIcon, component: ContentTab },
    { id: 'gamification', name: 'Gamification', icon: SparklesIcon, component: GamificationTab },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon, component: SecurityTab },
  ]

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would validate against a secure admin password
    if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || adminPassword === 'admin123') {
      setIsAuthenticated(true)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
            <GlassButton type="submit" fullWidth>
              <ShieldCheckIcon className="w-5 h-5" />
              Authenticate
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    )
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || OverviewTab

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-black/30 backdrop-blur-xl border-r border-white/10">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <ActiveComponent />
        </main>
      </div>
    </div>
  )
}

function OverviewTab() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalConversations: 0,
    avgSessionTime: 0,
    crystalsEarned: 0,
  })

  useEffect(() => {
    // Fetch stats from API
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Users', value: stats.activeUsers, icon: UsersIcon, color: 'from-green-500 to-emerald-500' },
    { label: 'Revenue', value: `$${stats.totalRevenue}`, icon: CurrencyDollarIcon, color: 'from-yellow-500 to-orange-500' },
    { label: 'Conversations', value: stats.totalConversations, icon: ChatBubbleLeftRightIcon, color: 'from-purple-500 to-pink-500' },
    { label: 'Avg Session', value: `${stats.avgSessionTime}m`, icon: ChartBarIcon, color: 'from-red-500 to-rose-500' },
    { label: 'Crystals Earned', value: stats.crystalsEarned, icon: SparklesIcon, color: 'from-indigo-500 to-purple-500' },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-white/60">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Activity Overview</h3>
        <div className="h-64 flex items-center justify-center text-white/40">
          [Activity chart would go here]
        </div>
      </GlassCard>
    </div>
  )
}

function EnvironmentTab() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [category, setCategory] = useState('other')

  const categories = [
    { id: 'database', name: 'Database', icon: ServerIcon },
    { id: 'ai', name: 'AI Providers', icon: SparklesIcon },
    { id: 'payment', name: 'Payments', icon: CurrencyDollarIcon },
    { id: 'email', name: 'Email', icon: BellIcon },
    { id: 'other', name: 'Other', icon: CogIcon },
  ]

  useEffect(() => {
    // Fetch environment variables
    fetch('/api/admin/env')
      .then(res => res.json())
      .then(setEnvVars)
      .catch(console.error)
  }, [])

  const handleAddEnv = async () => {
    if (!newKey || !newValue) return

    try {
      const response = await fetch('/api/admin/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, value: newValue, category }),
      })

      if (response.ok) {
        setEnvVars(prev => ({ ...prev, [newKey]: newValue }))
        setNewKey('')
        setNewValue('')
      }
    } catch (error) {
      console.error('Failed to add environment variable:', error)
    }
  }

  const handleDeleteEnv = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/env/${key}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEnvVars(prev => {
          const updated = { ...prev }
          delete updated[key]
          return updated
        })
      }
    } catch (error) {
      console.error('Failed to delete environment variable:', error)
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Environment Configuration</h2>

      {/* Add New Variable */}
      <GlassCard className="p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Add Environment Variable</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Variable name"
            className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <GlassButton onClick={handleAddEnv}>
            Add Variable
          </GlassButton>
        </div>
      </GlassCard>

      {/* Environment Variables List */}
      <div className="space-y-4">
        {Object.entries(envVars).map(([key, value]) => (
          <GlassCard key={key} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-mono">{key}</p>
                <p className="text-white/40 text-sm truncate">{value}</p>
              </div>
              <GlassButton variant="danger" size="sm" onClick={() => handleDeleteEnv(key)}>
                Delete
              </GlassButton>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Deploy Button */}
      <div className="mt-8">
        <GlassButton size="lg">
          <ServerIcon className="w-5 h-5" />
          Deploy to Vercel
        </GlassButton>
      </div>
    </div>
  )
}

function AIProvidersTab() {
  const [providers, setProviders] = useState<any[]>([])
  const [showAddProvider, setShowAddProvider] = useState(false)

  useEffect(() => {
    fetch('/api/admin/ai-providers')
      .then(res => res.json())
      .then(setProviders)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">AI Provider Configuration</h2>

      <div className="grid gap-6">
        {providers.map(provider => (
          <GlassCard key={provider.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">{provider.name}</h3>
              <span className={cn(
                'px-3 py-1 rounded-full text-sm',
                provider.isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              )}>
                {provider.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-white/60">
              <div>
                <p>Total Requests: {provider.totalRequests}</p>
                <p>Total Cost: ${provider.totalCost}</p>
              </div>
              <div>
                <p>Models: {provider.models?.length || 0}</p>
                <p>Last Used: {provider.updatedAt}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <GlassButton variant="secondary" size="sm">Configure</GlassButton>
              <GlassButton variant="ghost" size="sm">Test</GlassButton>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6">
        <GlassButton onClick={() => setShowAddProvider(true)}>
          <KeyIcon className="w-5 h-5" />
          Add Provider
        </GlassButton>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error)
  }, [])

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">User Management</h2>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full max-w-md px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      <div className="grid gap-4">
        {filteredUsers.map(user => (
          <GlassCard key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{user.name || 'Unnamed User'}</p>
                <p className="text-white/60 text-sm">{user.email}</p>
                <p className="text-white/40 text-xs">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <GlassButton variant="ghost" size="sm">View</GlassButton>
                <GlassButton variant="ghost" size="sm">Edit</GlassButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function RevenueTab() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Revenue Analytics</h2>
      <GlassCard className="p-6">
        <p className="text-white/60">Revenue analytics and subscription management coming soon...</p>
      </GlassCard>
    </div>
  )
}

function ContentTab() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Content Management</h2>
      <GlassCard className="p-6">
        <p className="text-white/60">Content management for challenges, affirmations, and assessments coming soon...</p>
      </GlassCard>
    </div>
  )
}

function GamificationTab() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Gamification Settings</h2>
      <GlassCard className="p-6">
        <p className="text-white/60">Gamification parameter controls coming soon...</p>
      </GlassCard>
    </div>
  )
}

function SecurityTab() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Security Settings</h2>
      <GlassCard className="p-6">
        <p className="text-white/60">Security configuration and audit logs coming soon...</p>
      </GlassCard>
    </div>
  }
