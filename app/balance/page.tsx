'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import {
  HeartIcon,
  BriefcaseIcon,
  UserGroupIcon,
  SparklesIcon,
  AcademicCapIcon,
  HomeIcon,
  CurrencyDollarIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'

interface LifeArea {
  id: string
  name: string
  icon: any
  color: string
  score: number
  description: string
  questions: string[]
}

export default function BalanceWheelPage() {
  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)

  const lifeAreas: LifeArea[] = [
    {
      id: 'health',
      name: 'Health & Wellness',
      icon: HeartIcon,
      color: '#ef4444',
      score: 0,
      description: 'Physical health, mental wellness, and self-care practices',
      questions: [
        'How satisfied are you with your physical health?',
        'How well do you manage stress and anxiety?',
        'How consistent are you with exercise and movement?',
        'How would you rate your sleep quality?',
        'How balanced is your nutrition and eating habits?',
      ],
    },
    {
      id: 'career',
      name: 'Career & Purpose',
      icon: BriefcaseIcon,
      color: '#3b82f6',
      score: 0,
      description: 'Professional growth, meaningful work, and life purpose',
      questions: [
        'How fulfilled are you in your current career?',
        'How aligned is your work with your values?',
        'How satisfied are you with your professional growth?',
        'How clear are you about your life purpose?',
        'How well does your work-life balance serve you?',
      ],
    },
    {
      id: 'relationships',
      name: 'Relationships',
      icon: UserGroupIcon,
      color: '#10b981',
      score: 0,
      description: 'Family, friendships, romantic partnerships, and social connections',
      questions: [
        'How satisfied are you with your close relationships?',
        'How supported do you feel by your social circle?',
        'How effective is your communication with loved ones?',
        'How much quality time do you spend with important people?',
        'How healthy are your relationship boundaries?',
      ],
    },
    {
      id: 'personal-growth',
      name: 'Personal Growth',
      icon: SparklesIcon,
      color: '#8b5cf6',
      score: 0,
      description: 'Learning, self-development, and spiritual growth',
      questions: [
        'How committed are you to personal development?',
        'How often do you step outside your comfort zone?',
        'How connected do you feel to your spiritual side?',
        'How well do you know and accept yourself?',
        'How actively do you pursue new learning?',
      ],
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: CurrencyDollarIcon,
      color: '#eab308',
      score: 0,
      description: 'Financial security, abundance mindset, and resource management',
      questions: [
        'How secure do you feel financially?',
        'How well do you manage your finances?',
        'How aligned is your spending with your values?',
        'How confident are you about your financial future?',
        'How abundant is your mindset around money?',
      ],
    },
    {
      id: 'fun-recreation',
      name: 'Fun & Recreation',
      icon: BeakerIcon,
      color: '#ec4899',
      score: 0,
      description: 'Hobbies, creativity, play, and enjoyment',
      questions: [
        'How much fun and joy do you experience regularly?',
        'How often do you engage in hobbies you love?',
        'How well do you balance work and play?',
        'How creative and expressive are you in daily life?',
        'How adventurous and spontaneous are you?',
      ],
    },
    {
      id: 'environment',
      name: 'Environment',
      icon: HomeIcon,
      color: '#06b6d4',
      score: 0,
      description: 'Living space, work environment, and surroundings',
      questions: [
        'How satisfied are you with your living space?',
        'How organized and peaceful is your environment?',
        'How inspiring is your work environment?',
        'How connected do you feel to nature?',
        'How supportive is your environment for growth?',
      ],
    },
    {
      id: 'contribution',
      name: 'Contribution',
      icon: AcademicCapIcon,
      color: '#059669',
      score: 0,
      description: 'Impact, service, and giving back to community',
      questions: [
        'How meaningful is your contribution to others?',
        'How often do you help or serve your community?',
        'How aligned are your actions with making a difference?',
        'How generous are you with your time and resources?',
        'How positive is your impact on the world?',
      ],
    },
  ]

  useEffect(() => {
    // Load saved scores from localStorage
    const savedScores = localStorage.getItem('balanceWheelScores')
    if (savedScores) {
      const scores = JSON.parse(savedScores)
      // Update life areas with saved scores
      lifeAreas.forEach(area => {
        if (scores[area.id]) {
          area.score = scores[area.id]
        }
      })
    }
  }, [])

  const startAssessment = (area: LifeArea) => {
    setSelectedArea(area)
    setAssessmentStarted(true)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setIsComplete(false)
  }

  const handleAnswer = (score: number) => {
    if (!selectedArea) return

    const questionId = `${selectedArea.id}-q${currentQuestionIndex}`
    setAnswers(prev => ({ ...prev, [questionId]: score }))

    if (currentQuestionIndex < selectedArea.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      completeAssessment()
    }
  }

  const completeAssessment = () => {
    if (!selectedArea) return

    // Calculate average score
    const scores = Object.values(answers)
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
    
    // Update area score
    selectedArea.score = Math.round(averageScore * 10) // Convert to 0-100 scale

    // Save to localStorage
    const savedScores = localStorage.getItem('balanceWheelScores') || '{}'
    const allScores = JSON.parse(savedScores)
    allScores[selectedArea.id] = selectedArea.score
    localStorage.setItem('balanceWheelScores', JSON.stringify(allScores))

    // Save to database
    saveAssessmentResults()

    setIsComplete(true)
  }

  const saveAssessmentResults = async () => {
    if (!selectedArea) return

    try {
      await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BALANCE_WHEEL',
          areaId: selectedArea.id,
          score: selectedArea.score,
          answers,
        }),
      })
    } catch (error) {
      console.error('Failed to save assessment:', error)
    }
  }

  const resetAssessment = () => {
    setSelectedArea(null)
    setAssessmentStarted(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setIsComplete(false)
  }

  // Calculate overall balance score
  const overallScore = Math.round(
    lifeAreas.reduce((sum, area) => sum + area.score, 0) / lifeAreas.length
  )

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
            Life Balance Assessment
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Discover which areas of your life need attention and create a personalized growth plan
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white">Overall Balance: </span>
            <span className={cn(
              'text-3xl font-bold',
              overallScore >= 70 ? 'text-green-400' :
              overallScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {overallScore}%
            </span>
          </div>
        </motion.div>

        {/* Balance Wheel Visualization */}
        {!assessmentStarted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <GlassCard className="p-8">
              <div className="relative w-full max-w-2xl mx-auto aspect-square">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Background circles */}
                  {[20, 40, 60, 80, 100].map((radius, i) => (
                    <circle
                      key={i}
                      cx="200"
                      cy="200"
                      r={radius * 1.8}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Life area segments */}
                  {lifeAreas.map((area, index) => {
                    const angle = (index * 360) / lifeAreas.length - 90
                    const nextAngle = ((index + 1) * 360) / lifeAreas.length - 90
                    const score = area.score || 10 // Minimum visible size
                    const radius = (score / 100) * 180

                    const x1 = 200 + radius * Math.cos((angle * Math.PI) / 180)
                    const y1 = 200 + radius * Math.sin((angle * Math.PI) / 180)
                    const x2 = 200 + radius * Math.cos((nextAngle * Math.PI) / 180)
                    const y2 = 200 + radius * Math.sin((nextAngle * Math.PI) / 180)

                    return (
                      <g key={area.id}>
                        {/* Segment line */}
                        <line
                          x1="200"
                          y1="200"
                          x2={200 + 180 * Math.cos((angle * Math.PI) / 180)}
                          y2={200 + 180 * Math.sin((angle * Math.PI) / 180)}
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="1"
                        />

                        {/* Filled area */}
                        <path
                          d={`M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                          fill={area.color}
                          fillOpacity="0.3"
                          stroke={area.color}
                          strokeWidth="2"
                          className="cursor-pointer hover:fill-opacity-50 transition-all"
                          onClick={() => startAssessment(area)}
                        />

                        {/* Label */}
                        <text
                          x={200 + 210 * Math.cos(((angle + nextAngle) / 2 * Math.PI) / 180)}
                          y={200 + 210 * Math.sin(((angle + nextAngle) / 2 * Math.PI) / 180)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="12"
                          className="pointer-events-none"
                        >
                          {area.name.split(' ')[0]}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Assessment Questions */}
        <AnimatePresence mode="wait">
          {assessmentStarted && selectedArea && !isComplete && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard className="p-8 max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <selectedArea.icon className="w-8 h-8" style={{ color: selectedArea.color }} />
                    <h2 className="text-2xl font-bold text-white">{selectedArea.name}</h2>
                  </div>
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>Question {currentQuestionIndex + 1} of {selectedArea.questions.length}</span>
                    <span>{Math.round(((currentQuestionIndex) / selectedArea.questions.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex) / selectedArea.questions.length) * 100}%`,
                        backgroundColor: selectedArea.color,
                      }}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-xl text-white mb-6">
                    {selectedArea.questions[currentQuestionIndex]}
                  </p>

                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleAnswer(score)}
                        className={cn(
                          'w-full p-4 rounded-xl border transition-all duration-200',
                          'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30',
                          'text-white text-left flex items-center justify-between'
                        )}
                      >
                        <span className="font-medium">{score}</span>
                        <span className="text-white/60 text-sm">
                          {score <= 3 ? 'Needs significant improvement' :
                           score <= 6 ? 'Room for growth' :
                           score <= 8 ? 'Good progress' : 'Excellent'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <GlassButton variant="ghost" onClick={resetAssessment}>
                  Cancel Assessment
                </GlassButton>
              </GlassCard>
            </motion.div>
          )}

          {/* Results */}
          {isComplete && selectedArea && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <GlassCard className="p-8 max-w-2xl mx-auto text-center">
                <selectedArea.icon className="w-16 h-16 mx-auto mb-4" style={{ color: selectedArea.color }} />
                <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h2>
                <p className="text-white/60 mb-6">{selectedArea.name}</p>
                
                <div className="text-5xl font-bold mb-6" style={{ color: selectedArea.color }}>
                  {selectedArea.score}%
                </div>

                <p className="text-white/80 mb-8">
                  {selectedArea.score >= 70 ? 
                    "You're doing great in this area! Keep up the excellent work." :
                   selectedArea.score >= 40 ?
                    "You're making progress. There's room for improvement to reach your full potential." :
                    "This area needs attention. Let's create a plan to help you grow."}
                </p>

                <div className="flex gap-4 justify-center">
                  <GlassButton onClick={resetAssessment}>
                    Assess Another Area
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={() => window.location.href = '/journey'}>
                    View Growth Plan
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Life Areas Grid */}
        {!assessmentStarted && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lifeAreas.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className="p-4 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => startAssessment(area)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <area.icon className="w-6 h-6" style={{ color: area.color }} />
                    <h3 className="font-semibold text-white">{area.name}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-white/10 rounded-full h-2 mr-3">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${area.score}%`,
                          backgroundColor: area.color,
                        }}
                      />
                    </div>
                    <span className="text-white/60 text-sm">{area.score}%</span>
                  </div>
                  <p className="text-white/40 text-xs mt-2">{area.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
