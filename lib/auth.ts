import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'
import { sessions } from './redis'
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
}

export default AuthService
