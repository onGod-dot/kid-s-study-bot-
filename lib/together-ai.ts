// TypeScript interfaces for Together AI API
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class TogetherAIService {
  // Chat completion via server-side API route (avoids CORS + key exposure)
  static async chatCompletion(
    messages: ChatMessage[],
    model: string = 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    maxTokens?: number
  ): Promise<string> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, maxTokens }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`API Error: ${err.error || response.statusText}`)
    }

    const data = await response.json()
    if (!data.content?.trim()) throw new Error('Empty response from AI model')
    return data.content
  }

  // Image generation via server-side API route
  static async generateImage(prompt: string, ageGroup: 'kids' | 'teens' = 'kids'): Promise<string> {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, ageGroup }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Image API Error: ${err.error || response.statusText}`)
    }

    const data = await response.json()
    if (!data.imageUrl) throw new Error('No image URL returned')
    return data.imageUrl
  }

  // Image editing — takes an existing image URL + text instruction
  static async editImage(imageUrl: string, instruction: string, ageGroup: 'kids' | 'teens' = 'kids'): Promise<string> {
    const response = await fetch('/api/edit-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, instruction, ageGroup }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Edit Image API Error: ${err.error || response.statusText}`)
    }

    const data = await response.json()
    if (!data.imageUrl) throw new Error('No edited image URL returned')
    return data.imageUrl
  }

  // Speech-to-text via server-side route (keeps key server-side)
  static async speechToText(file: File, language: string = 'en'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)

    const response = await fetch('/api/speech-to-text', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Speech API Error: ${err.error || response.statusText}`)
    }

    const result = await response.json()
    if (!result.text?.trim()) throw new Error('No transcription returned')
    return result.text
  }
}
