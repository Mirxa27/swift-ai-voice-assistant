'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  HeartIcon,
  FaceSmileIcon,
  StopIcon,
} from '@heroicons/react/24/outline'
import { MicrophoneIcon as MicrophoneSolid } from '@heroicons/react/24/solid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  emotion?: string
  audioUrl?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Dynamic headlines
  const headlines = [
    "Let's explore your inner world together ✨",
    "Your safe space for transformation 🌙",
    "Every conversation is a step forward 🌱",
    "Discover the wisdom within you 💫",
    "Your journey to clarity starts here 🦋",
  ]
  const [currentHeadline] = useState(() => 
    headlines[Math.floor(Math.random() * headlines.length)]
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        emotion: data.emotion,
      }

      setMessages(prev => [...prev, assistantMessage])
      if (data.emotion) setCurrentEmotion(data.emotion)
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (!isVoiceMode) {
      // Start voice mode
      setIsRecording(true)
    } else {
      // Stop voice mode
      setIsRecording(false)
    }
  }

  const EmotionIndicator = ({ emotion }: { emotion: string }) => {
    const emotions: Record<string, { icon: any; color: string }> = {
      happy: { icon: '😊', color: 'text-yellow-400' },
      sad: { icon: '😢', color: 'text-blue-400' },
      angry: { icon: '😠', color: 'text-red-400' },
      neutral: { icon: '😐', color: 'text-gray-400' },
      excited: { icon: '🤩', color: 'text-purple-400' },
    }

    const current = emotions[emotion] || emotions.neutral

    return (
      <motion.span
        className={cn('text-2xl', current.color)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
      >
        {current.icon}
      </motion.span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pt-20 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with dynamic headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {currentHeadline}
          </h1>
          <p className="text-white/60">
            {isVoiceMode ? 'Speaking mode active' : 'Text mode active'}
          </p>
        </motion.div>

        {/* Emotion indicator */}
        <div className="flex justify-center mb-6">
          <GlassCard className="inline-flex items-center gap-3 px-6 py-3">
            <span className="text-white/80">Current vibe:</span>
            <EmotionIndicator emotion={currentEmotion} />
          </GlassCard>
        </div>

        {/* Chat messages */}
        <GlassCard className="h-[500px] md:h-[600px] mb-6 p-6 overflow-hidden">
          <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/20">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <SparklesIcon className="w-16 h-16 text-purple-400 mb-4" />
                <p className="text-white/80 text-lg mb-2">Ready to begin?</p>
                <p className="text-white/60">
                  Share what's on your mind, or tap the mic to speak
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] md:max-w-[70%]',
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                          : 'bg-white/10 border-white/20',
                        'backdrop-blur-md rounded-2xl px-4 py-3 border'
                      )}
                    >
                      <p className="text-white whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-white/40">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.emotion && (
                          <span className="text-xs">
                            <EmotionIndicator emotion={message.emotion} />
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
                  <div className="flex gap-2">
                    <motion.div
                      className="w-2 h-2 bg-white/60 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-white/60 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-white/60 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </GlassCard>

        {/* Input area */}
        <div className="space-y-4">
          {/* Voice mode toggle */}
          <div className="flex justify-center">
            <motion.button
              onClick={toggleVoiceMode}
              className={cn(
                'relative w-24 h-24 rounded-full',
                'bg-gradient-to-br from-purple-500/30 to-pink-500/30',
                'border-2 border-purple-500/50',
                'backdrop-blur-md transition-all duration-300',
                'hover:scale-110 active:scale-95',
                isVoiceMode && 'animate-pulse'
              )}
              whileHover={{ rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRecording ? (
                <StopIcon className="w-10 h-10 text-white mx-auto" />
              ) : (
                <MicrophoneIcon className="w-10 h-10 text-white mx-auto" />
              )}
              
              {/* Ripple effect when recording */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-400"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-pink-400"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}
            </motion.button>
          </div>

          {/* Text input */}
          {!isVoiceMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Share what's on your mind..."
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-white/10 backdrop-blur-md',
                    'border border-white/20',
                    'text-white placeholder-white/40',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                    'resize-none'
                  )}
                  rows={2}
                />
              </div>
              
              <GlassButton
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="self-end"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </GlassButton>
            </motion.div>
          )}

          {/* Quick actions */}
          <div className="flex justify-center gap-2">
            <GlassButton variant="ghost" size="sm">
              <HeartIcon className="w-4 h-4" />
              Affirmation
            </GlassButton>
            <GlassButton variant="ghost" size="sm">
              <FaceSmileIcon className="w-4 h-4" />
              Mood Check
            </GlassButton>
            <GlassButton variant="ghost" size="sm">
              <SparklesIcon className="w-4 h-4" />
              Daily Wisdom
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  )
}