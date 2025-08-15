import OpenAI from 'openai'
import { BaseAIProvider, AIMessage, AICompletionOptions, AIModel } from './base'

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI'
  type = 'text' as const
  private client: OpenAI
  
  constructor(apiKey: string) {
    super(apiKey)
    this.client = new OpenAI({ apiKey })
  }
  
  async generateCompletion(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    })
    
    return completion.choices[0]?.message?.content || ''
  }
  
  async *generateStream(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    })
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
  
  async transcribeAudio(audio: Buffer): Promise<string> {
    const file = new File([audio], 'audio.webm', { type: 'audio/webm' })
    const transcription = await this.client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    })
    return transcription.text
  }
  
  async listModels(): Promise<AIModel[]> {
    const models = await this.client.models.list()
    return models.data
      .filter(m => m.id.includes('gpt'))
      .map(m => ({
        id: m.id,
        name: m.id,
        description: `OpenAI ${m.id} model`,
        contextLength: this.getContextLength(m.id),
        costPerToken: this.getCostPerToken(m.id),
      }))
  }
  
  calculateCost(tokens: number, model: string): number {
    const costPerToken = this.getCostPerToken(model)
    return tokens * costPerToken
  }
  
  private getContextLength(model: string): number {
    const contextLengths: Record<string, number> = {
      'gpt-4-turbo-preview': 128000,
      'gpt-4': 8192,
      'gpt-4-32k': 32768,
      'gpt-3.5-turbo': 16385,
      'gpt-3.5-turbo-16k': 16385,
    }
    return contextLengths[model] || 4096
  }
  
  private getCostPerToken(model: string): number {
    const costs: Record<string, number> = {
      'gpt-4-turbo-preview': 0.00001,
      'gpt-4': 0.00003,
      'gpt-4-32k': 0.00006,
      'gpt-3.5-turbo': 0.0000015,
      'gpt-3.5-turbo-16k': 0.000003,
    }
    return costs[model] || 0.000002
  }
}