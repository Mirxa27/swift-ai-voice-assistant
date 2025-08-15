import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Simple admin authentication
function isAdmin(request: NextRequest): boolean {
  const adminPassword = request.headers.get('x-admin-password')
  return adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          avatar: true,
          isAdmin: true,
          emailVerified: true,
          createdAt: true,
          lastActiveAt: true,
          profile: {
            select: {
              level: true,
              crystals: true,
              experiencePoints: true,
              streakDays: true,
            },
          },
          subscription: {
            select: {
              plan: true,
              status: true,
              minutesRemaining: true,
              minutesUsed: true,
            },
          },
          _count: {
            select: {
              conversations: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      include: {
        profile: true,
        subscription: true,
      },
    })

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: 'admin', // Should be actual admin ID
        action: 'USER_UPDATE',
        entity: 'User',
        entityId: userId,
        changes: updates,
      },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: false,
        // In production, you might want to add a deletedAt field
      },
    })

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: 'admin',
        action: 'USER_DELETE',
        entity: 'User',
        entityId: userId,
        changes: { deleted: true },
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}