import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import { BaseAIProvider, AIModel } from './base'

export class DeepgramProvider extends BaseAIProvider {
  name = 'Deepgram'
  type = 'speech' as const
  private client: any

  constructor(apiKey: string) {
    super(apiKey)
    this.client = createClient(apiKey)
  }

  async generateCompletion(): Promise<string> {
    throw new Error('Deepgram is a speech provider, not a text generation provider')
  }

  async transcribeAudio(audio: Buffer | ArrayBuffer): Promise<string> {
    try {
      const audioBuffer = audio instanceof ArrayBuffer ? Buffer.from(audio) : audio
      
      const { result } = await this.client.transcription.preRecorded(
        { buffer: audioBuffer, mimetype: 'audio/wav' },
        {
          model: 'nova-2',
          smart_format: true,
          punctuate: true,
          language: 'en',
          diarize: false,
        }
      )

      return result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    } catch (error) {
      console.error('Deepgram transcription error:', error)
      throw new Error('Failed to transcribe audio')
    }
  }

  async transcribeStream(
    onTranscript: (transcript: string, isFinal: boolean) => void
  ) {
    const connection = this.client.transcription.live({
      model: 'nova-2',
      language: 'en',
      smart_format: true,
      punctuate: true,
      interim_results: true,
      endpointing: 300,
    })

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram connection opened')
    })

    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const transcript = data.channel?.alternatives?.[0]?.transcript
      if (transcript) {
        onTranscript(transcript, data.is_final)
      }
    })

    connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      console.error('Deepgram error:', error)
    })

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed')
    })

    return connection
  }

  async listModels(): Promise<AIModel[]> {
    return [
      {
        id: 'nova-2',
        name: 'Nova 2',
        description: 'Most accurate and powerful speech-to-text model',
        costPerToken: 0.0059, // per minute
      },
      {
        id: 'nova',
        name: 'Nova',
        description: 'Highly accurate speech recognition',
        costPerToken: 0.0045,
      },
      {
        id: 'enhanced',
        name: 'Enhanced',
        description: 'Good balance of accuracy and speed',
        costPerToken: 0.0035,
      },
      {
        id: 'base',
        name: 'Base',
        description: 'Fast and cost-effective',
        costPerToken: 0.0025,
      },
    ]
  }

  calculateCost(minutes: number, model: string): number {
    const costs: Record<string, number> = {
      'nova-2': 0.0059,
      'nova': 0.0045,
      'enhanced': 0.0035,
      'base': 0.0025,
    }
    return minutes * (costs[model] || 0.0059)
  }
}