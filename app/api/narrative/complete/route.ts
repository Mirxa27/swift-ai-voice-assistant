import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { AIManager } from '@/lib/ai/manager'
import GamificationService from '@/lib/gamification/service'

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

    // Parse request body
    const { answers } = await request.json()

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'No answers provided' },
        { status: 400 }
      )
    }

    // Create narrative exploration record
    const exploration = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: 'Narrative Identity Exploration',
        content: JSON.stringify(answers),
        mood: 'REFLECTIVE',
        tags: ['narrative', 'identity', 'growth'],
      },
    })

    // Generate AI analysis
    const aiManager = new AIManager()
    const analysisPrompt = `
      Based on these narrative identity exploration answers, provide a compassionate and insightful analysis:
      
      ${Object.entries(answers).map(([index, answer]) => `Q${Number(index) + 1}: ${answer}`).join('\n\n')}
      
      Please provide:
      1. Key themes and patterns you notice
      2. Strengths that emerge from their story
      3. Areas for potential growth
      4. Empowering reframe of their narrative
      5. Suggested next steps for their journey
      
      Keep the tone warm, supportive, and empowering.
    `

    const analysis = await aiManager.generateCompletion([
      {
        role: 'system',
        content: 'You are Newomen, an emotionally intelligent AI companion specializing in narrative therapy and personal transformation. Provide deep, compassionate insights that help women rewrite their stories.',
      },
      {
        role: 'user',
        content: analysisPrompt,
      },
    ])

    // Save analysis as a message
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: 'Narrative Analysis',
        mode: 'TEXT',
        messages: {
          create: [
            {
              role: 'USER',
              content: 'I completed my narrative exploration',
            },
            {
              role: 'ASSISTANT',
              content: analysis,
            },
          ],
        },
      },
    })

    // Award crystals and XP for completion
    await GamificationService.awardCrystals(user.id, 50, 'Narrative exploration completed')
    await GamificationService.awardXP(user.id, 100, 'Narrative exploration')

    // Check for achievement
    await GamificationService.updateAchievementProgress(user.id, 'self_discovery', 1)

    return NextResponse.json({
      success: true,
      exploration,
      analysis,
      conversationId: conversation.id,
      rewards: {
        crystals: 50,
        xp: 100,
      },
    })
  } catch (error) {
    console.error('Narrative completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete narrative exploration' },
      { status: 500 }
    )
  }
}