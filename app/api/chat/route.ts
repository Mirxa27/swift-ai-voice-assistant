import { NextRequest, NextResponse } from 'next/server'
import { getAIManager } from '@/lib/ai/manager'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  conversationId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get user from session (simplified for now)
    const userId = request.headers.get('x-user-id') || 'anonymous'
    
    const body = await request.json()
    const { messages, conversationId } = chatSchema.parse(body)
    
    // Create or get conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    }
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          mode: 'TEXT',
          title: messages[0]?.content.slice(0, 50) || 'New conversation',
        }
      })
    }
    
    // Add system prompt for Newomen personality
    const systemPrompt = {
      role: 'system' as const,
      content: `You are Newomen, an emotionally intelligent AI companion designed to support women's personal growth journeys. 
      You are warm, empathetic, culturally sensitive, and focused on transformation and empowerment. 
      Provide thoughtful, supportive responses that encourage self-reflection and growth.
      Be conversational, authentic, and occasionally use gentle humor when appropriate.`
    }
    
    const messagesWithSystem = [systemPrompt, ...messages]
    
    // Generate AI response
    const aiManager = getAIManager()
    const response = await aiManager.generateCompletion(messagesWithSystem, {
      userId,
      conversationId: conversation.id,
      temperature: 0.8,
    })
    
    // Save messages to database
    const userMessage = messages[messages.length - 1]
    if (userMessage && userMessage.role === 'user') {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'USER',
          content: userMessage.content,
        }
      })
    }
    
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: response,
      }
    })
    
    // Simple emotion detection (would use Hume AI in production)
    const emotion = detectBasicEmotion(response)
    
    return NextResponse.json({
      content: response,
      conversationId: conversation.id,
      emotion,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}

function detectBasicEmotion(text: string): string {
  const emotions = {
    happy: ['happy', 'joy', 'excited', 'wonderful', 'great', 'amazing', '😊', '🎉'],
    sad: ['sad', 'sorry', 'difficult', 'hard', 'tough', 'challenging', '😢'],
    excited: ['excited', 'amazing', 'wonderful', 'fantastic', 'incredible', '🤩'],
    neutral: ['okay', 'fine', 'alright', 'understand', 'see'],
  }
  
  const lowerText = text.toLowerCase()
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return emotion
    }
  }
  
  return 'neutral'
}