import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { AIManager } from '@/lib/ai/manager'
import { prisma } from '@/lib/db'

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

    // Get form data with audio
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const conversationId = formData.get('conversationId') as string

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // Get AI manager
    const aiManager = new AIManager()

    // Speech-to-text
    const transcript = await aiManager.transcribeAudio(audioBuffer)

    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      )
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: 'Voice Chat',
          mode: 'VOICE',
        },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: transcript,
      },
    })

    // Generate AI response
    const aiResponse = await aiManager.generateCompletion([
      {
        role: 'system',
        content: 'You are Newomen, an emotionally intelligent AI companion focused on personal growth and transformation for women. Respond naturally as if in a voice conversation - keep responses concise and conversational.',
      },
      {
        role: 'user',
        content: transcript,
      },
    ])

    // Save AI message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResponse,
      },
    })

    // Text-to-speech (if provider available)
    let audioResponse = null
    try {
      const audioBuffer = await aiManager.synthesizeSpeech(aiResponse)
      if (audioBuffer && audioBuffer.length > 0) {
        audioResponse = audioBuffer.toString('base64')
      }
    } catch (error) {
      console.log('TTS not available:', error)
      // Continue without audio - text response is still valid
    }

    // Update conversation duration
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        duration: {
          increment: 1, // Increment by 1 minute for each exchange
        },
      },
    })

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      transcript,
      response: aiResponse,
      audio: audioResponse,
    })
  } catch (error) {
    console.error('Voice chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process voice chat' },
      { status: 500 }
    )
  }
}