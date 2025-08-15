import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication
    
    // Fetch statistics
    const [
      totalUsers,
      activeUsers,
      totalConversations,
      totalPayments,
      totalCrystals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Active in last 7 days
          },
        },
      }),
      prisma.conversation.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.userProfile.aggregate({
        _sum: { crystals: true },
      }),
    ])

    // Calculate average session time
    const sessions = await prisma.conversation.findMany({
      where: {
        duration: { not: null },
      },
      select: { duration: true },
    })
    
    const avgSessionTime = sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length / 60)
      : 0

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRevenue: totalPayments._sum.amount || 0,
      totalConversations,
      avgSessionTime,
      crystalsEarned: totalCrystals._sum.crystals || 0,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}