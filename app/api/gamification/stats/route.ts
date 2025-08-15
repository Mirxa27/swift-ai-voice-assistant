import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import GamificationService from '@/lib/gamification/service'

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate user
    const user = await AuthService.validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Get user stats
    const stats = await GamificationService.getUserStats(user.id)

    // Process daily login
    await GamificationService.processDailyLogin(user.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Gamification stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}