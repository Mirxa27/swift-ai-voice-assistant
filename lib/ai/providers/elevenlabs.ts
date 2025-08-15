import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { BaseAIProvider, AIModel } from './base'

export class ElevenLabsProvider extends BaseAIProvider {
  name = 'ElevenLabs'
  type = 'speech' as const
  private client: ElevenLabsClient

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new ElevenLabsClient({ apiKey })
  }

  async generateCompletion(): Promise<string> {
    throw new Error('ElevenLabs is a speech provider, not a text generation provider')
  }

  async synthesizeSpeech(text: string, voiceId?: string): Promise<Buffer> {
    try {
      // Simplified implementation - in production, properly handle the stream
      console.log('ElevenLabs TTS called with:', { text, voiceId })
      // Return empty buffer for now - implement proper streaming later
      return Buffer.from([])
    } catch (error) {
      console.error('ElevenLabs synthesis error:', error)
      throw new Error('Failed to synthesize speech')
    }
  }

  async streamSpeech(
    text: string,
    onAudioChunk: (chunk: Buffer) => void,
    voiceId?: string
  ) {
    try {
      // Simplified implementation - in production, properly handle the stream
      console.log('ElevenLabs streaming called with:', { text, voiceId })
      // Mock implementation
      onAudioChunk(Buffer.from([]))
    } catch (error) {
      console.error('ElevenLabs streaming error:', error)
      throw new Error('Failed to stream speech')
    }
  }

  async getVoices() {
    try {
      const voices = await this.client.voices.getAll()
      return voices.voices.map((voice: any) => ({
        id: voice.voiceId || voice.voice_id,
        name: voice.name,
        description: voice.description,
        labels: voice.labels,
        preview_url: voice.previewUrl || voice.preview_url,
      }))
    } catch (error) {
      console.error('Failed to fetch voices:', error)
      return []
    }
  }

  async cloneVoice(name: string, audioFiles: Buffer[]) {
    try {
      // Simplified - voice cloning requires proper file handling
      console.log('Voice cloning called with:', { name, fileCount: audioFiles.length })
      return 'cloned-voice-id'
    } catch (error) {
      console.error('Voice cloning error:', error)
      throw new Error('Failed to clone voice')
    }
  }

  async listModels(): Promise<AIModel[]> {
    return [
      {
        id: 'eleven_multilingual_v2',
        name: 'Multilingual v2',
        description: 'Most natural and versatile model with 29 languages',
        costPerToken: 0.30, // per 1000 characters
      },
      {
        id: 'eleven_monolingual_v1',
        name: 'English v1',
        description: 'Optimized for English with lowest latency',
        costPerToken: 0.18,
      },
      {
        id: 'eleven_turbo_v2',
        name: 'Turbo v2',
        description: 'Ultra-low latency optimized for real-time',
        costPerToken: 0.18,
      },
    ]
  }

  calculateCost(characters: number, model: string): number {
    const costs: Record<string, number> = {
      'eleven_multilingual_v2': 0.30,
      'eleven_monolingual_v1': 0.18,
      'eleven_turbo_v2': 0.18,
    }
    return (characters / 1000) * (costs[model] || 0.30)
  }
}