'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 text-white',
      secondary: 'bg-white/10 border-white/20 hover:bg-white/20 text-white',
      ghost: 'bg-transparent border-transparent hover:bg-white/10 text-white/80 hover:text-white',
      danger: 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-200',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative rounded-xl border backdrop-blur-md transition-all duration-300',
          'font-medium tracking-wide',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
        {...props}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-[-200%] hover:translate-x-[200%] pointer-events-none" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {children}
        </span>
      </motion.button>
    )
  }
)

GlassButton.displayName = 'GlassButton'