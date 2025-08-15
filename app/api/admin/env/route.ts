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

    // Get system configs (stored env vars)
    const configs = await prisma.systemConfig.findMany({
      where: { category: 'environment' },
    })

    // Convert to key-value object
    const envVars = configs.reduce((acc, config) => {
      acc[config.key] = String(config.value || '')
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(envVars)
  } catch (error) {
    console.error('Get env vars error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch environment variables' },
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

    const { key, value, category = 'environment' } = await request.json()

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // Upsert system config
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category },
    })

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error) {
    console.error('Add env var error:', error)
    return NextResponse.json(
      { error: 'Failed to add environment variable' },
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
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    await prisma.systemConfig.delete({
      where: { key },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete env var error:', error)
    return NextResponse.json(
      { error: 'Failed to delete environment variable' },
      { status: 500 }
    )
  }
}