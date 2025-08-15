'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

interface BreathingExercise {
  id: string
  name: string
  description: string
  duration: number // in seconds
  pattern: {
    inhale: number
    hold1: number
    exhale: number
    hold2: number
  }
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  benefits: string[]
}

interface WellnessStats {
  totalSessions: number
  totalMinutes: number
  currentStreak: number
  favoriteExercise: string
}

export default function WellnessPage() {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [wellnessStats, setWellnessStats] = useState<WellnessStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    favoriteExercise: '',
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const breathingExercises: BreathingExercise[] = [
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      description: 'A calming technique used by Navy SEALs to reduce stress and improve focus',
      duration: 240,
      pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
      category: 'Stress Relief',
      difficulty: 'beginner',
      benefits: ['Reduces stress', 'Improves focus', 'Lowers blood pressure'],
    },
    {
      id: '478-breathing',
      name: '4-7-8 Breathing',
      description: 'Dr. Andrew Weil\'s technique for falling asleep and reducing anxiety',
      duration: 180,
      pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
      category: 'Sleep',
      difficulty: 'beginner',
      benefits: ['Promotes sleep', 'Reduces anxiety', 'Calms nervous system'],
    },
    {
      id: 'coherent-breathing',
      name: 'Coherent Breathing',
      description: 'Balanced breathing for heart rate variability and emotional regulation',
      duration: 300,
      pattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
      category: 'Balance',
      difficulty: 'beginner',
      benefits: ['Improves HRV', 'Emotional balance', 'Reduces depression'],
    },
    {
      id: 'energizing-breath',
      name: 'Bellows Breath',
      description: 'Stimulating breath work to increase energy and alertness',
      duration: 120,
      pattern: { inhale: 1, hold1: 0, exhale: 1, hold2: 0 },
      category: 'Energy',
      difficulty: 'intermediate',
      benefits: ['Increases energy', 'Improves alertness', 'Boosts metabolism'],
    },
    {
      id: 'wim-hof',
      name: 'Wim Hof Method',
      description: 'Power breathing technique for immune system and cold resistance',
      duration: 600,
      pattern: { inhale: 2, hold1: 0, exhale: 2, hold2: 15 },
      category: 'Performance',
      difficulty: 'advanced',
      benefits: ['Boosts immunity', 'Increases energy', 'Improves cold tolerance'],
    },
    {
      id: 'alternate-nostril',
      name: 'Alternate Nostril',
      description: 'Ancient yogic technique for balancing left and right brain hemispheres',
      duration: 360,
      pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
      category: 'Balance',
      difficulty: 'intermediate',
      benefits: ['Balances hemispheres', 'Reduces anxiety', 'Improves focus'],
    },
  ]

  useEffect(() => {
    // Load wellness stats
    const savedStats = localStorage.getItem('wellnessStats')
    if (savedStats) {
      setWellnessStats(JSON.parse(savedStats))
    }
  }, [])

  useEffect(() => {
    if (isPlaying && selectedExercise) {
      runBreathingCycle()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentPhase, selectedExercise])

  const runBreathingCycle = () => {
    if (!selectedExercise) return

    const pattern = selectedExercise.pattern
    let duration = 0

    switch (currentPhase) {
      case 'inhale':
        duration = pattern.inhale
        break
      case 'hold1':
        duration = pattern.hold1
        break
      case 'exhale':
        duration = pattern.exhale
        break
      case 'hold2':
        duration = pattern.hold2
        break
    }

    setTimeRemaining(duration)

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next phase
          moveToNextPhase()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const moveToNextPhase = () => {
    if (!selectedExercise) return

    setCurrentPhase(prev => {
      switch (prev) {
        case 'inhale':
          return selectedExercise.pattern.hold1 > 0 ? 'hold1' : 'exhale'
        case 'hold1':
          return 'exhale'
        case 'exhale':
          return selectedExercise.pattern.hold2 > 0 ? 'hold2' : 'inhale'
        case 'hold2':
          setCycleCount(c => c + 1)
          return 'inhale'
        default:
          return 'inhale'
      }
    })
  }

  const startExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise)
    setIsPlaying(true)
    setCurrentPhase('inhale')
    setCycleCount(0)
  }

  const stopExercise = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Save progress
    if (selectedExercise && cycleCount > 0) {
      const stats = { ...wellnessStats }
      stats.totalSessions += 1
      stats.totalMinutes += Math.round((cycleCount * getTotalCycleDuration(selectedExercise)) / 60)
      setWellnessStats(stats)
      localStorage.setItem('wellnessStats', JSON.stringify(stats))
      
      // Award XP for wellness activity
      fetch('/api/gamification/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 30,
          source: 'wellness_activity'
        })
      })
    }
  }

  const getTotalCycleDuration = (exercise: BreathingExercise) => {
    const p = exercise.pattern
    return p.inhale + p.hold1 + p.exhale + p.hold2
  }

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In'
      case 'hold1':
        return 'Hold'
      case 'exhale':
        return 'Breathe Out'
      case 'hold2':
        return 'Hold'
    }
  }

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'from-blue-500 to-cyan-500'
      case 'hold1':
      case 'hold2':
        return 'from-purple-500 to-pink-500'
      case 'exhale':
        return 'from-green-500 to-emerald-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pt-20 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Wellness Library
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Guided breathing exercises and meditation practices for stress relief, better sleep, and emotional balance
          </p>
        </motion.div>

        {/* Stats Bar */}
        <GlassCard className="p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <HeartIcon className="w-5 h-5 text-red-400" />
                <span className="text-xl font-bold text-white">{wellnessStats.totalSessions}</span>
              </div>
              <p className="text-white/60 text-sm">Sessions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                <span className="text-xl font-bold text-white">{wellnessStats.totalMinutes}</span>
              </div>
              <p className="text-white/60 text-sm">Minutes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <FireIcon className="w-5 h-5 text-orange-400" />
                <span className="text-xl font-bold text-white">{wellnessStats.currentStreak}</span>
              </div>
              <p className="text-white/60 text-sm">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <span className="text-xl font-bold text-white">+30</span>
              </div>
              <p className="text-white/60 text-sm">XP per Session</p>
            </div>
          </div>
        </GlassCard>

        {/* Active Exercise Display */}
        <AnimatePresence>
          {isPlaying && selectedExercise && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <GlassCard className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedExercise.name}</h2>
                <p className="text-white/60 mb-6">Cycle {cycleCount + 1}</p>

                {/* Breathing Circle Animation */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full bg-gradient-to-br",
                      getPhaseColor()
                    )}
                    animate={{
                      scale: currentPhase === 'inhale' ? [1, 1.3] : 
                             currentPhase === 'exhale' ? [1.3, 1] : 1.15,
                    }}
                    transition={{
                      duration: timeRemaining,
                      ease: 'linear',
                    }}
                    style={{ opacity: 0.3 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white mb-2">{getPhaseInstruction()}</p>
                      <p className="text-5xl font-bold text-white">{timeRemaining}</p>
                    </div>
                  </div>
                </div>

                <GlassButton variant="danger" size="lg" onClick={stopExercise}>
                  <PauseIcon className="w-5 h-5" />
                  Stop Exercise
                </GlassButton>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise Library */}
        {!isPlaying && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breathingExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{exercise.name}</h3>
                      <p className="text-white/60 text-sm">{exercise.category}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      exercise.difficulty === 'beginner' && "bg-green-500/20 text-green-400",
                      exercise.difficulty === 'intermediate' && "bg-yellow-500/20 text-yellow-400",
                      exercise.difficulty === 'advanced' && "bg-red-500/20 text-red-400"
                    )}>
                      {exercise.difficulty}
                    </span>
                  </div>

                  <p className="text-white/70 text-sm mb-4 flex-grow">{exercise.description}</p>

                  <div className="space-y-3">
                    {/* Pattern Display */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Pattern:</span>
                      <span className="text-white/80">
                        {exercise.pattern.inhale}-{exercise.pattern.hold1}-{exercise.pattern.exhale}-{exercise.pattern.hold2}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Duration:</span>
                      <span className="text-white/80">{exercise.duration / 60} min</span>
                    </div>

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-1">
                      {exercise.benefits.map((benefit, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/60">
                          {benefit}
                        </span>
                      ))}
                    </div>

                    <GlassButton
                      fullWidth
                      size="sm"
                      onClick={() => startExercise(exercise)}
                    >
                      <PlayIcon className="w-4 h-4" />
                      Start Exercise
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Guided Meditations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Guided Meditations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <MusicalNoteIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Morning Meditation</h3>
                  <p className="text-white/60 text-sm">10 min • Start your day with clarity</p>
                </div>
                <GlassButton variant="ghost" size="sm">
                  <PlayIcon className="w-4 h-4" />
                </GlassButton>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MusicalNoteIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Sleep Stories</h3>
                  <p className="text-white/60 text-sm">20 min • Drift into peaceful sleep</p>
                </div>
                <GlassButton variant="ghost" size="sm">
                  <PlayIcon className="w-4 h-4" />
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  )
}