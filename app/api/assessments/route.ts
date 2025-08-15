import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const assessmentSchema = z.object({
  type: z.enum(['BALANCE_WHEEL', 'PERSONALITY', 'NARRATIVE_IDENTITY', 'EMOTIONAL_INTELLIGENCE', 'RELATIONSHIP_COMPATIBILITY']),
  areaId: z.string().optional(),
  score: z.number().min(0).max(100),
  answers: z.record(z.any()),
})

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = assessmentSchema.parse(body)

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        type: validatedData.type,
        score: validatedData.score,
        completedAt: new Date(),
        responses: {
          create: Object.entries(validatedData.answers).map(([key, value]) => ({
            questionId: key,
            answer: JSON.stringify(value),
            score: typeof value === 'number' ? value : 0,
          })),
        },
      },
      include: {
        responses: true,
      },
    })

    return NextResponse.json({
      success: true,
      assessment,
    })
  } catch (error) {
    console.error('Assessment error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    )
  }
}

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

    // Get user's assessments
    const assessments = await prisma.assessment.findMany({
      where: { userId: user.id },
      include: {
        responses: true,
      },
    })

    return NextResponse.json({
      assessments,
    })
  } catch (error) {
    console.error('Get assessments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}