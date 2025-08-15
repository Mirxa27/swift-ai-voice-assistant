import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db'
import { sessions } from '../redis'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface AuthToken {
  userId: string
  email: string
  isAdmin: boolean
}

export interface AuthResponse {
  user: Partial<User>
  token: string
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static generateToken(payload: AuthToken): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static verifyToken(token: string): AuthToken {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  }

  static async register(
    email: string,
    password: string,
    name?: string,
    username?: string
  ): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(username ? [{ username }] : [])
        ]
      }
    })

    if (existingUser) {
      throw new Error('User already exists with this email or username')
    }

    // Hash password
    const passwordHash = await this.hashPassword(password)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        username,
        profile: {
          create: {
            level: 1,
            crystals: 10, // Welcome bonus
            experiencePoints: 0,
            streakDays: 0,
          }
        },
        subscription: {
          create: {
            plan: 'DISCOVERY',
            status: 'ACTIVE',
            minutesRemaining: 10, // Free trial minutes
            minutesUsed: 0,
          }
        }
      },
      include: {
        profile: true,
        subscription: true,
      }
    })

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    })

    // Create session
    await sessions.create(user.id, token)

    // Return user without sensitive data
    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = user

    return {
      user: safeUser,
      token,
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        subscription: true,
      }
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isValid = await this.comparePassword(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    })

    // Check and update streak
    if (user.profile) {
      await this.updateStreak(user.id, user.profile)
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    })

    // Create session
    await sessions.create(user.id, token)

    // Return user without sensitive data
    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = user

    return {
      user: safeUser,
      token,
    }
  }

  static async logout(token: string): Promise<void> {
    await sessions.destroy(token)
  }

  static async validateSession(token: string): Promise<User | null> {
    try {
      // Check Redis session
      const session = await sessions.get(token)
      if (!session) {
        return null
      }

      // Verify JWT
      const payload = this.verifyToken(token)

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          profile: true,
          subscription: true,
        }
      })

      if (!user) {
        await sessions.destroy(token)
        return null
      }

      // Refresh session
      await sessions.refresh(token)

      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() }
      })

      return user
    } catch (error) {
      await sessions.destroy(token)
      return null
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isValid = await this.comparePassword(currentPassword, user.passwordHash)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    })
  }

  static async requestPasswordReset(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists
      return 'If an account exists with this email, a reset link has been sent'
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Store in Redis with 1 hour expiry
    await sessions.create(user.id, `reset:${resetToken}`, 3600)

    // TODO: Send email with reset link
    // For now, return the token (in production, this would be sent via email)
    return resetToken
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      const payload = jwt.verify(token, JWT_SECRET) as any
      if (payload.type !== 'password-reset') {
        throw new Error('Invalid reset token')
      }

      // Check if token exists in Redis
      const session = await sessions.get(`reset:${token}`)
      if (!session) {
        throw new Error('Reset token has expired')
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword)

      // Update password
      await prisma.user.update({
        where: { id: payload.userId },
        data: { passwordHash }
      })

      // Delete reset token
      await sessions.destroy(`reset:${token}`)
    } catch (error) {
      throw new Error('Invalid or expired reset token')
    }
  }

  private static async updateStreak(userId: string, profile: any): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (profile.lastStreakDate) {
      const lastStreak = new Date(profile.lastStreakDate)
      lastStreak.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((today.getTime() - lastStreak.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        // Continue streak
        await prisma.userProfile.update({
          where: { userId },
          data: {
            streakDays: profile.streakDays + 1,
            lastStreakDate: today,
            crystals: profile.crystals + 5, // Streak bonus
          }
        })
      } else if (daysDiff > 1) {
        // Reset streak
        await prisma.userProfile.update({
          where: { userId },
          data: {
            streakDays: 1,
            lastStreakDate: today,
          }
        })
      }
    } else {
      // Start streak
      await prisma.userProfile.update({
        where: { userId },
        data: {
          streakDays: 1,
          lastStreakDate: today,
        }
      })
    }
  }
}

export default AuthService