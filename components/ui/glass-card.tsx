'use client'

import { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'subtle'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  blur = 'md',
  hover = true,
  ...props
}: GlassCardProps) {
  const blurValues = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  const variants = {
    default: 'bg-white/10 border-white/20',
    elevated: 'bg-white/20 border-white/30 shadow-2xl',
    subtle: 'bg-white/5 border-white/10',
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl border backdrop-filter transition-all duration-300',
        blurValues[blur],
        variants[variant],
        hover && 'hover:bg-white/15 hover:border-white/30 hover:shadow-xl',
        'relative overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02 } : undefined}
      {...props}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}