import { prisma } from '../db'
import { cache } from '../redis'

export interface LevelRequirements {
  level: number
  xpRequired: number
  title: string
  perks: string[]
}

export interface AchievementType {
  id: string
  name: string
  description: string
  icon: string
  maxProgress: number
  crystalReward: number
  xpReward: number
}

export class GamificationService {
  // Level progression system
  private static readonly LEVELS: LevelRequirements[] = [
    { level: 1, xpRequired: 0, title: 'Seeker', perks: ['Basic chat access'] },
    { level: 2, xpRequired: 100, title: 'Explorer', perks: ['Voice mode unlocked'] },
    { level: 3, xpRequired: 250, title: 'Learner', perks: ['Custom themes'] },
    { level: 4, xpRequired: 500, title: 'Growth Enthusiast', perks: ['Priority support'] },
    { level: 5, xpRequired: 1000, title: 'Transformer', perks: ['Advanced analytics'] },
    { level: 6, xpRequired: 2000, title: 'Wisdom Keeper', perks: ['Exclusive content'] },
    { level: 7, xpRequired: 3500, title: 'Inner Guide', perks: ['Community moderator'] },
    { level: 8, xpRequired: 5000, title: 'Soul Navigator', perks: ['Custom AI training'] },
    { level: 9, xpRequired: 7500, title: 'Light Bearer', perks: ['Beta features'] },
    { level: 10, xpRequired: 10000, title: 'Master of Self', perks: ['All features unlocked'] },
  ]

  // Achievement definitions
  private static readonly ACHIEVEMENTS: AchievementType[] = [
    // Conversation achievements
    { id: 'first_chat', name: 'First Steps', description: 'Complete your first conversation', icon: '💬', maxProgress: 1, crystalReward: 10, xpReward: 20 },
    { id: 'chat_streak_7', name: 'Week Warrior', description: 'Chat for 7 days in a row', icon: '🔥', maxProgress: 7, crystalReward: 50, xpReward: 100 },
    { id: 'chat_streak_30', name: 'Monthly Master', description: 'Chat for 30 days in a row', icon: '⚡', maxProgress: 30, crystalReward: 200, xpReward: 500 },
    { id: 'conversations_100', name: 'Century Club', description: 'Complete 100 conversations', icon: '💯', maxProgress: 100, crystalReward: 300, xpReward: 750 },
    
    // Assessment achievements
    { id: 'first_assessment', name: 'Self-Discovery', description: 'Complete your first assessment', icon: '🎯', maxProgress: 1, crystalReward: 20, xpReward: 40 },
    { id: 'balance_master', name: 'Life in Balance', description: 'Score 70%+ in all life areas', icon: '⚖️', maxProgress: 8, crystalReward: 500, xpReward: 1000 },
    { id: 'growth_spurt', name: 'Growth Spurt', description: 'Improve any area by 30%', icon: '📈', maxProgress: 1, crystalReward: 100, xpReward: 200 },
    
    // Community achievements
    { id: 'first_connection', name: 'Social Butterfly', description: 'Make your first connection', icon: '🤝', maxProgress: 1, crystalReward: 30, xpReward: 60 },
    { id: 'community_helper', name: 'Helping Hand', description: 'Help 10 community members', icon: '💝', maxProgress: 10, crystalReward: 150, xpReward: 300 },
    { id: 'group_leader', name: 'Group Leader', description: 'Lead a support group', icon: '👑', maxProgress: 1, crystalReward: 200, xpReward: 400 },
    
    // Wellness achievements
    { id: 'breath_beginner', name: 'Breath of Life', description: 'Complete 10 breathing exercises', icon: '🌬️', maxProgress: 10, crystalReward: 40, xpReward: 80 },
    { id: 'meditation_master', name: 'Zen Master', description: 'Meditate for 100 minutes total', icon: '🧘', maxProgress: 100, crystalReward: 200, xpReward: 400 },
    { id: 'wellness_warrior', name: 'Wellness Warrior', description: 'Complete wellness activities 30 days', icon: '💪', maxProgress: 30, crystalReward: 250, xpReward: 500 },
    
    // Special achievements
    { id: 'early_adopter', name: 'Early Adopter', description: 'Join in the first month', icon: '🌟', maxProgress: 1, crystalReward: 100, xpReward: 200 },
    { id: 'night_owl', name: 'Night Owl', description: 'Chat between midnight and 4 AM', icon: '🦉', maxProgress: 1, crystalReward: 25, xpReward: 50 },
    { id: 'voice_pioneer', name: 'Voice Pioneer', description: 'Use voice mode 50 times', icon: '🎤', maxProgress: 50, crystalReward: 150, xpReward: 300 },
  ]

  // Crystal reward events
  static readonly CRYSTAL_REWARDS = {
    DAILY_LOGIN: 5,
    CONVERSATION_COMPLETE: 10,
    ASSESSMENT_COMPLETE: 20,
    CHALLENGE_COMPLETE: 50,
    LEVEL_UP: 100,
    STREAK_BONUS: 5, // per day
    REFERRAL: 200,
    PERFECT_WEEK: 100,
  }

  // XP reward events
  static readonly XP_REWARDS = {
    CONVERSATION_MINUTE: 1,
    ASSESSMENT_COMPLETE: 50,
    CHALLENGE_COMPLETE: 100,
    JOURNAL_ENTRY: 20,
    WELLNESS_ACTIVITY: 30,
    COMMUNITY_INTERACTION: 15,
    HELPFUL_FEEDBACK: 40,
  }

  /**
   * Award crystals to a user
   */
  static async awardCrystals(userId: string, amount: number, reason: string): Promise<void> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (!profile) {
        throw new Error('User profile not found')
      }

      await prisma.userProfile.update({
        where: { userId },
        data: {
          crystals: profile.crystals + amount
        }
      })

      // Log the transaction
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'CRYSTALS_AWARDED',
          entity: 'UserProfile',
          entityId: profile.id,
          changes: { amount, reason, newTotal: profile.crystals + amount }
        }
      })

      // Clear cache
      await cache.del(`user:${userId}:profile`)
    } catch (error) {
      console.error('Failed to award crystals:', error)
      throw error
    }
  }

  /**
   * Award XP and handle level progression
   */
  static async awardXP(userId: string, amount: number, source: string): Promise<boolean> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (!profile) {
        throw new Error('User profile not found')
      }

      const oldLevel = this.calculateLevel(profile.experiencePoints)
      const newXP = profile.experiencePoints + amount
      const newLevel = this.calculateLevel(newXP)

      await prisma.userProfile.update({
        where: { userId },
        data: {
          experiencePoints: newXP,
          level: newLevel.level
        }
      })

      // Check for level up
      if (newLevel.level > oldLevel.level) {
        // Award level up bonus
        await this.awardCrystals(userId, this.CRYSTAL_REWARDS.LEVEL_UP, 'Level up bonus')
        
        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            type: 'LEVEL_UP',
            title: 'Level Up!',
            message: `Congratulations! You've reached Level ${newLevel.level}: ${newLevel.title}`,
            data: { level: newLevel.level, title: newLevel.title, perks: newLevel.perks }
          }
        })

        return true // Level up occurred
      }

      return false
    } catch (error) {
      console.error('Failed to award XP:', error)
      throw error
    }
  }

  /**
   * Check and update achievement progress
   */
  static async updateAchievementProgress(
    userId: string, 
    achievementId: string, 
    progress: number = 1
  ): Promise<boolean> {
    try {
      const achievementDef = this.ACHIEVEMENTS.find(a => a.id === achievementId)
      if (!achievementDef) {
        throw new Error(`Achievement ${achievementId} not found`)
      }

      // Get or create achievement record
      let achievement = await prisma.achievement.findUnique({
        where: {
          userId_type: {
            userId,
            type: achievementId
          }
        }
      })

      if (!achievement) {
        achievement = await prisma.achievement.create({
          data: {
            userId,
            type: achievementId,
            name: achievementDef.name,
            description: achievementDef.description,
            iconUrl: achievementDef.icon,
            maxProgress: achievementDef.maxProgress,
            progress: 0,
            completed: false
          }
        })
      }

      if (achievement.completed) {
        return false // Already completed
      }

      const newProgress = Math.min(
        achievement.progress + progress,
        achievementDef.maxProgress
      )

      const completed = newProgress >= achievementDef.maxProgress

      await prisma.achievement.update({
        where: { id: achievement.id },
        data: {
          progress: newProgress,
          completed,
          unlockedAt: completed ? new Date() : null
        }
      })

      if (completed) {
        // Award rewards
        await this.awardCrystals(userId, achievementDef.crystalReward, `Achievement: ${achievementDef.name}`)
        await this.awardXP(userId, achievementDef.xpReward, `Achievement: ${achievementDef.name}`)

        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            type: 'ACHIEVEMENT_UNLOCKED',
            title: 'Achievement Unlocked!',
            message: `You've earned "${achievementDef.name}" - ${achievementDef.description}`,
            data: { 
              achievementId,
              crystalReward: achievementDef.crystalReward,
              xpReward: achievementDef.xpReward
            }
          }
        })

        return true // Achievement completed
      }

      return false
    } catch (error) {
      console.error('Failed to update achievement:', error)
      throw error
    }
  }

  /**
   * Calculate user level from XP
   */
  static calculateLevel(xp: number): LevelRequirements {
    for (let i = this.LEVELS.length - 1; i >= 0; i--) {
      if (xp >= this.LEVELS[i].xpRequired) {
        return this.LEVELS[i]
      }
    }
    return this.LEVELS[0]
  }

  /**
   * Get user's gamification stats
   */
  static async getUserStats(userId: string) {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        include: {
          user: {
            include: {
              achievements: true
            }
          }
        }
      })

      if (!profile) {
        throw new Error('User profile not found')
      }

      const currentLevel = this.calculateLevel(profile.experiencePoints)
      const nextLevel = this.LEVELS[currentLevel.level] || this.LEVELS[this.LEVELS.length - 1]
      const xpProgress = profile.experiencePoints - currentLevel.xpRequired
      const xpNeeded = nextLevel.xpRequired - currentLevel.xpRequired

      return {
        level: currentLevel.level,
        title: currentLevel.title,
        perks: currentLevel.perks,
        crystals: profile.crystals,
        experiencePoints: profile.experiencePoints,
        xpProgress,
        xpNeeded,
        xpPercentage: Math.round((xpProgress / xpNeeded) * 100),
        streakDays: profile.streakDays,
        achievements: profile.user.achievements,
        totalAchievements: this.ACHIEVEMENTS.length,
        completedAchievements: profile.user.achievements.filter(a => a.completed).length
      }
    } catch (error) {
      console.error('Failed to get user stats:', error)
      throw error
    }
  }

  /**
   * Process daily login rewards
   */
  static async processDailyLogin(userId: string): Promise<void> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (!profile) return

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const lastLogin = profile.lastStreakDate ? new Date(profile.lastStreakDate) : null
      if (lastLogin) {
        lastLogin.setHours(0, 0, 0, 0)
        
        // Check if already logged in today
        if (lastLogin.getTime() === today.getTime()) {
          return
        }
      }

      // Award daily login crystals
      await this.awardCrystals(userId, this.CRYSTAL_REWARDS.DAILY_LOGIN, 'Daily login bonus')

      // Update streak (already handled in auth service)
      // Check for streak achievements
      if (profile.streakDays >= 7) {
        await this.updateAchievementProgress(userId, 'chat_streak_7', profile.streakDays)
      }
      if (profile.streakDays >= 30) {
        await this.updateAchievementProgress(userId, 'chat_streak_30', profile.streakDays)
      }
    } catch (error) {
      console.error('Failed to process daily login:', error)
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(type: 'crystals' | 'level' | 'streak', limit: number = 10) {
    try {
      const orderBy = type === 'crystals' 
        ? { crystals: 'desc' as const }
        : type === 'level'
        ? { experiencePoints: 'desc' as const }
        : { streakDays: 'desc' as const }

      const profiles = await prisma.userProfile.findMany({
        orderBy,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          }
        }
      })

      return profiles.map((profile, index) => ({
        rank: index + 1,
        userId: profile.userId,
        name: profile.user.name || profile.user.username || 'Anonymous',
        avatar: profile.user.avatar,
        value: type === 'crystals' 
          ? profile.crystals
          : type === 'level'
          ? profile.level
          : profile.streakDays,
        level: profile.level,
        title: this.calculateLevel(profile.experiencePoints).title
      }))
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      throw error
    }
  }
}

export default GamificationService