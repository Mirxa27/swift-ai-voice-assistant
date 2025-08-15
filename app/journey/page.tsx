'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import {
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  StarIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'

interface UserStats {
  level: number
  title: string
  perks: string[]
  crystals: number
  experiencePoints: number
  xpProgress: number
  xpNeeded: number
  xpPercentage: number
  streakDays: number
  achievements: any[]
  totalAchievements: number
  completedAchievements: number
}

interface NarrativeQuestion {
  id: number
  question: string
  category: string
}

export default function JourneyPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [activeTab, setActiveTab] = useState<'progress' | 'narrative' | 'achievements'>('progress')
  const [narrativeStarted, setNarrativeStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [narrativeAnswers, setNarrativeAnswers] = useState<Record<number, string>>({})

  const narrativeQuestions: NarrativeQuestion[] = [
    { id: 1, question: "What story have you been telling yourself about who you are?", category: "identity" },
    { id: 2, question: "What limiting beliefs have held you back from your dreams?", category: "beliefs" },
    { id: 3, question: "Describe a moment when you felt most authentically yourself.", category: "authenticity" },
    { id: 4, question: "What patterns keep repeating in your relationships?", category: "relationships" },
    { id: 5, question: "What would you do if you knew you couldn't fail?", category: "potential" },
    { id: 6, question: "What parts of yourself have you been hiding from the world?", category: "shadow" },
    { id: 7, question: "What does success truly mean to you?", category: "values" },
    { id: 8, question: "What childhood experiences still influence your decisions today?", category: "past" },
    { id: 9, question: "What new story would you like to write about your life?", category: "future" },
    { id: 10, question: "What gifts do you have that the world needs?", category: "purpose" },
  ]

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const handleNarrativeAnswer = (answer: string) => {
    setNarrativeAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }))

    if (currentQuestionIndex < narrativeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      completeNarrativeExploration()
    }
  }

  const completeNarrativeExploration = async () => {
    try {
      const response = await fetch('/api/narrative/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: narrativeAnswers })
      })

      if (response.ok) {
        const result = await response.json()
        // Show results
        setNarrativeStarted(false)
        setActiveTab('progress')
      }
    } catch (error) {
      console.error('Failed to complete narrative exploration:', error)
    }
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-white">Loading your journey...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pt-20 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with User Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Level & Title */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{userStats.level}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userStats.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <FireIcon className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 font-medium">{userStats.streakDays} day streak</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{userStats.crystals}</span>
                  </div>
                  <p className="text-white/60 text-sm">Crystals</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <TrophyIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">
                      {userStats.completedAchievements}/{userStats.totalAchievements}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">Achievements</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <BoltIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{userStats.experiencePoints}</span>
                  </div>
                  <p className="text-white/60 text-sm">Total XP</p>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Level {userStats.level}</span>
                <span>{userStats.xpProgress}/{userStats.xpNeeded} XP</span>
                <span>Level {userStats.level + 1}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.xpPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <GlassButton
            variant={activeTab === 'progress' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('progress')}
          >
            <ChartBarIcon className="w-5 h-5" />
            Progress
          </GlassButton>
          <GlassButton
            variant={activeTab === 'narrative' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('narrative')}
          >
            <SparklesIcon className="w-5 h-5" />
            Narrative
          </GlassButton>
          <GlassButton
            variant={activeTab === 'achievements' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('achievements')}
          >
            <TrophyIcon className="w-5 h-5" />
            Achievements
          </GlassButton>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Perks & Benefits */}
              <GlassCard className="p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Your Perks</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {userStats.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      <span className="text-white/80">{perk}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Next Level Preview */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Next Level Rewards</h3>
                <p className="text-white/60 mb-4">
                  Reach Level {userStats.level + 1} to unlock:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LockClosedIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white/80">New title and badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-white/80">100 bonus crystals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-white/80">Exclusive features</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'narrative' && (
            <motion.div
              key="narrative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {!narrativeStarted ? (
                <GlassCard className="p-8 text-center">
                  <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Narrative Identity Exploration</h3>
                  <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                    Discover your personal narrative through 10 transformative questions. 
                    Uncover limiting beliefs, identify patterns, and rewrite your story 
                    for authentic growth and empowerment.
                  </p>
                  <GlassButton size="lg" onClick={() => setNarrativeStarted(true)}>
                    Begin Your Journey
                  </GlassButton>
                </GlassCard>
              ) : (
                <GlassCard className="p-8">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-white/60 mb-2">
                      <span>Question {currentQuestionIndex + 1} of {narrativeQuestions.length}</span>
                      <span>{Math.round(((currentQuestionIndex) / narrativeQuestions.length) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex) / narrativeQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {narrativeQuestions[currentQuestionIndex].category.charAt(0).toUpperCase() + 
                       narrativeQuestions[currentQuestionIndex].category.slice(1)}
                    </h3>
                    <p className="text-lg text-white/90 mb-6">
                      {narrativeQuestions[currentQuestionIndex].question}
                    </p>

                    <textarea
                      className="w-full h-32 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="Take your time to reflect and share your thoughts..."
                      value={narrativeAnswers[currentQuestionIndex] || ''}
                      onChange={(e) => setNarrativeAnswers(prev => ({
                        ...prev,
                        [currentQuestionIndex]: e.target.value
                      }))}
                    />
                  </div>

                  <div className="flex justify-between">
                    <GlassButton
                      variant="ghost"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </GlassButton>
                    <GlassButton
                      onClick={() => handleNarrativeAnswer(narrativeAnswers[currentQuestionIndex] || '')}
                      disabled={!narrativeAnswers[currentQuestionIndex]}
                    >
                      {currentQuestionIndex === narrativeQuestions.length - 1 ? 'Complete' : 'Next'}
                    </GlassButton>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {userStats.achievements.map((achievement) => (
                <GlassCard
                  key={achievement.id}
                  className={cn(
                    "p-4",
                    achievement.completed ? "border-yellow-400/30" : "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{achievement.iconUrl}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{achievement.name}</h4>
                      <p className="text-white/60 text-sm mb-2">{achievement.description}</p>
                      
                      {achievement.completed ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between text-xs text-white/40 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}