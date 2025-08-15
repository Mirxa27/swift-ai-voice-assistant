import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseAIProvider, AIMessage, AICompletionOptions, AIModel } from './base'

export class GeminiProvider extends BaseAIProvider {
  name = 'Gemini'
  type = 'text' as const
  private client: GoogleGenerativeAI
  
  constructor(apiKey: string) {
    super(apiKey)
    this.client = new GoogleGenerativeAI(apiKey)
  }
  
  async generateCompletion(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: options.model || 'gemini-pro'
    })
    
    // Convert messages to Gemini format
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens,
      }
    })
    
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    
    return response.text()
  }
  
  async *generateStream(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = this.client.getGenerativeModel({
      model: options.model || 'gemini-pro'
    })
    
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens,
      }
    })
    
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessageStream(lastMessage.content)
    
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  }
  
  async listModels(): Promise<AIModel[]> {
    // Gemini models are predefined
    return [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Most capable Gemini model for text generation',
        contextLength: 32768,
        costPerToken: 0.0000125,
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Multimodal model for text and image understanding',
        contextLength: 16384,
        costPerToken: 0.0000125,
      },
    ]
  }
  
  calculateCost(tokens: number, model: string): number {
    const costs: Record<string, number> = {
      'gemini-pro': 0.0000125,
      'gemini-pro-vision': 0.0000125,
    }
    return tokens * (costs[model] || 0.0000125)
  }
}