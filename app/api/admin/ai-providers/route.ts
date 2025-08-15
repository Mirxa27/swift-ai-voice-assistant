import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AIManager } from '@/lib/ai/manager'

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

    // Get all AI providers from database
    const providers = await prisma.aIProvider.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Add runtime status
    const providersWithStatus = providers.map(provider => ({
      ...provider,
      isCurrentlyActive: provider.isActive,
      totalRequests: provider.totalRequests || 0,
    }))

    return NextResponse.json(providersWithStatus)
  } catch (error) {
    console.error('Get AI providers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI providers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, type, apiKey, isActive, models } = body

    if (!name || !type || !apiKey) {
      return NextResponse.json(
        { error: 'Name, type, and API key are required' },
        { status: 400 }
      )
    }

    // Create or update provider
    const provider = await prisma.aIProvider.upsert({
      where: { name },
      update: {
        type,
        apiKey,
        isActive,
        models: models || [],
      },
      create: {
        name,
        type,
        apiKey,
        isActive: isActive ?? true,
        models: models || [],
        totalRequests: 0,
        totalCost: 0,
      },
    })

    // AI manager will reinitialize on next use

    return NextResponse.json({
      success: true,
      provider,
    })
  } catch (error) {
    console.error('Add AI provider error:', error)
    return NextResponse.json(
      { error: 'Failed to add AI provider' },
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

    const { providerId, updates } = await request.json()

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // Update provider
    const provider = await prisma.aIProvider.update({
      where: { id: providerId },
      data: updates,
    })

    // AI manager will reinitialize on next use

    return NextResponse.json({
      success: true,
      provider,
    })
  } catch (error) {
    console.error('Update AI provider error:', error)
    return NextResponse.json(
      { error: 'Failed to update AI provider' },
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
    const providerId = searchParams.get('providerId')

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // Delete provider
    await prisma.aIProvider.delete({
      where: { id: providerId },
    })

    // AI manager will reinitialize on next use

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete AI provider error:', error)
    return NextResponse.json(
      { error: 'Failed to delete AI provider' },
      { status: 500 }
    )
  }
}