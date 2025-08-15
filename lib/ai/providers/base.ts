export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AICompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  userId?: string
  conversationId?: string
}

export interface AIProvider {
  name: string
  type: 'text' | 'speech' | 'emotion' | 'multi'
  
  // Text generation
  generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<string>
  
  // Stream generation
  generateStream?(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): AsyncGenerator<string, void, unknown>
  
  // Speech-to-text
  transcribeAudio?(audio: Buffer | ArrayBuffer): Promise<string>
  
  // Text-to-speech
  synthesizeSpeech?(text: string, voice?: string): Promise<Buffer>
  
  // Emotion analysis
  analyzeEmotion?(audio: Buffer | string): Promise<EmotionAnalysis>
  
  // Model listing
  listModels(): Promise<AIModel[]>
  
  // Cost calculation
  calculateCost(tokens: number, model: string): number
  
  // Health check
  isHealthy(): Promise<boolean>
}

export interface AIModel {
  id: string
  name: string
  description?: string
  contextLength?: number
  costPerToken?: number
}

export interface EmotionAnalysis {
  emotions: Record<string, number>
  dominantEmotion: string
  confidence: number
  timestamp: Date
}

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string
  abstract type: 'text' | 'speech' | 'emotion' | 'multi'
  protected apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  abstract generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<string>
  
  abstract listModels(): Promise<AIModel[]>
  
  abstract calculateCost(tokens: number, model: string): number
  
  async isHealthy(): Promise<boolean> {
    try {
      const models = await this.listModels()
      return models.length > 0
    } catch {
      return false
    }
  }
}