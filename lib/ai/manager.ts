import { prisma } from '../db'
import { cache } from '../redis'
import { AIProvider, AIMessage, AICompletionOptions, AIModel } from './providers/base'
import { OpenAIProvider } from './providers/openai'
import { GeminiProvider } from './providers/gemini'

export class AIManager {
  private providers: Map<string, AIProvider> = new Map()
  private activeProvider: string | null = null
  
  constructor() {
    this.initializeProviders()
  }
  
  private async initializeProviders() {
    // Load providers from database
    const dbProviders = await prisma.aIProvider.findMany({
      where: { isActive: true }
    })
    
    for (const provider of dbProviders) {
      this.registerProvider(provider.name, provider.apiKey)
    }
    
    // Set default active provider
    if (dbProviders.length > 0) {
      this.activeProvider = dbProviders[0].name
    }
  }
  
  registerProvider(name: string, apiKey: string) {
    let provider: AIProvider | null = null
    
    switch (name.toLowerCase()) {
      case 'openai':
        provider = new OpenAIProvider(apiKey)
        break
      case 'gemini':
        provider = new GeminiProvider(apiKey)
        break
      // Add more providers as needed
    }
    
    if (provider) {
      this.providers.set(name, provider)
    }
  }
  
  async generateCompletion(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<string> {
    const provider = this.getActiveProvider()
    if (!provider) {
      throw new Error('No AI provider available')
    }
    
    const startTime = Date.now()
    
    try {
      const result = await provider.generateCompletion(messages, options)
      
      // Track usage
      await this.trackUsage(
        provider.name,
        options.model || 'default',
        Date.now() - startTime,
        options.userId,
        options.conversationId
      )
      
      return result
    } catch (error) {
      // Try failover
      const fallbackProvider = await this.getFallbackProvider(provider.name)
      if (fallbackProvider) {
        console.log(`Failing over from ${provider.name} to ${fallbackProvider.name}`)
        return fallbackProvider.generateCompletion(messages, options)
      }
      throw error
    }
  }
  
  async *generateStream(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const provider = this.getActiveProvider()
    if (!provider || !provider.generateStream) {
      throw new Error('No streaming AI provider available')
    }
    
    const startTime = Date.now()
    let totalTokens = 0
    
    try {
      for await (const chunk of provider.generateStream(messages, options)) {
        totalTokens += chunk.length / 4 // Rough token estimation
        yield chunk
      }
      
      // Track usage
      await this.trackUsage(
        provider.name,
        options.model || 'default',
        Date.now() - startTime,
        options.userId,
        options.conversationId,
        totalTokens
      )
    } catch (error) {
      // Try failover
      const fallbackProvider = await this.getFallbackProvider(provider.name)
      if (fallbackProvider && fallbackProvider.generateStream) {
        console.log(`Failing over from ${provider.name} to ${fallbackProvider.name}`)
        yield* fallbackProvider.generateStream(messages, options)
      } else {
        throw error
      }
    }
  }
  
  async transcribeAudio(audio: Buffer, userId?: string): Promise<string> {
    const provider = this.getProviderWithCapability('transcribeAudio')
    if (!provider || !provider.transcribeAudio) {
      throw new Error('No speech-to-text provider available')
    }
    
    const result = await provider.transcribeAudio(audio)
    
    // Track usage
    await this.trackUsage(
      provider.name,
      'whisper-1',
      audio.length,
      userId
    )
    
    return result
  }
  
  async synthesizeSpeech(text: string, voice?: string, userId?: string): Promise<Buffer> {
    const provider = this.getProviderWithCapability('synthesizeSpeech')
    if (!provider || !provider.synthesizeSpeech) {
      throw new Error('No text-to-speech provider available')
    }
    
    const result = await provider.synthesizeSpeech(text, voice)
    
    // Track usage
    await this.trackUsage(
      provider.name,
      'tts-1',
      text.length,
      userId
    )
    
    return result
  }
  
  async listModels(providerName?: string): Promise<AIModel[]> {
    if (providerName) {
      const provider = this.providers.get(providerName)
      return provider ? provider.listModels() : []
    }
    
    // List all models from all providers
    const allModels: AIModel[] = []
    for (const [name, provider] of this.providers) {
      const models = await provider.listModels()
      allModels.push(...models.map(m => ({ ...m, provider: name })))
    }
    return allModels
  }
  
  async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}
    
    for (const [name, provider] of this.providers) {
      health[name] = await provider.isHealthy()
    }
    
    return health
  }
  
  private getActiveProvider(): AIProvider | null {
    if (!this.activeProvider) return null
    return this.providers.get(this.activeProvider) || null
  }
  
  private getProviderWithCapability(capability: string): AIProvider | null {
    for (const provider of this.providers.values()) {
      if ((provider as any)[capability]) {
        return provider
      }
    }
    return null
  }
  
  private async getFallbackProvider(excludeName: string): Promise<AIProvider | null> {
    for (const [name, provider] of this.providers) {
      if (name !== excludeName && await provider.isHealthy()) {
        return provider
      }
    }
    return null
  }
  
  private async trackUsage(
    provider: string,
    model: string,
    duration: number,
    userId?: string,
    conversationId?: string,
    tokens?: number
  ) {
    try {
      // Store in database
      await prisma.usageLog.create({
        data: {
          userId: userId || 'anonymous',
          type: 'ai_generation',
          duration: Math.round(duration / 1000),
          tokens,
          aiProvider: provider,
          aiModel: model,
        }
      })
      
      // Update provider stats
      await prisma.aIProvider.update({
        where: { name: provider },
        data: {
          totalRequests: { increment: 1 },
          // Cost calculation would go here based on provider pricing
        }
      })
      
      // Cache recent usage for rate limiting
      if (userId) {
        const key = `usage:${userId}:${provider}`
        const usage = await cache.get<number>(key) || 0
        await cache.set(key, usage + 1, 3600) // 1 hour TTL
      }
    } catch (error) {
      console.error('Failed to track usage:', error)
    }
  }
  
  async setActiveProvider(name: string) {
    if (this.providers.has(name)) {
      this.activeProvider = name
      await cache.set('active_ai_provider', name)
    } else {
      throw new Error(`Provider ${name} not found`)
    }
  }
  
  getProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}

// Singleton instance
let aiManager: AIManager | null = null

export function getAIManager(): AIManager {
  if (!aiManager) {
    aiManager = new AIManager()
  }
  return aiManager
}

export default getAIManager()