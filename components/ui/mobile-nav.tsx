'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  SparklesIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  UserCircleIcon as UserIconSolid,
  SparklesIcon as SparklesIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid'

const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatIconSolid,
  },
  {
    name: 'Journey',
    href: '/journey',
    icon: SparklesIcon,
    activeIcon: SparklesIconSolid,
  },
  {
    name: 'Wellness',
    href: '/wellness',
    icon: HeartIcon,
    activeIcon: HeartIconSolid,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserCircleIcon,
    activeIcon: UserIconSolid,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-xl" />
      
      {/* Nav content */}
      <div className="relative flex items-center justify-around px-4 py-3 safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.activeIcon : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-3 py-2"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 w-1 h-1 bg-purple-400 rounded-full"
                    initial={{ scale: 0, x: '-50%' }}
                    animate={{ scale: 1, x: '-50%' }}
                    exit={{ scale: 0, x: '-50%' }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Icon with animation */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors duration-200',
                    isActive
                      ? 'text-purple-400'
                      : 'text-white/60 hover:text-white/80'
                  )}
                />
              </motion.div>
              
              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'text-purple-400'
                    : 'text-white/60'
                )}
              >
                {item.name}
              </span>
              
              {/* Hover effect */}
              <AnimatePresence>
                {hoveredItem === item.name && !isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Desktop navigation bar with glassmorphic design
export function DesktopNav() {
  const pathname = usePathname()
  
  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-xl" />
      
      {/* Nav content */}
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <SparklesIcon className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white">Newomen</span>
          </Link>
          
          {/* Nav items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 rounded-xl transition-all duration-200',
                    'flex items-center gap-2',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-8 h-0.5 bg-purple-400 rounded-full"
                      initial={{ scaleX: 0, x: '-50%' }}
                      animate={{ scaleX: 1, x: '-50%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}