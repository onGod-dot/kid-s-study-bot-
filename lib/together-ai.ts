const API_KEY = 'ab85f36a6259ab35ff4f2433e1b252e893e4a4ea4577580b60e82b47d1be5abc'

// TypeScript interfaces for Together AI API
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class TogetherAIService {
  // Chat completion via server-side API route (avoids CORS issues)
  static async chatCompletion(
    messages: ChatMessage[], 
    model: string = "meta-llama/Llama-3.3-70B-Instruct-Turbo"
  ): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(`API Error: ${err.error || response.statusText}`)
      }

      const data = await response.json()

      if (!data.content || data.content.trim() === '') {
        throw new Error('Empty response from AI model')
      }

      return data.content
    } catch (error) {
      console.error('Chat completion error:', error)
      throw error
    }
  }

  // Speech to text using direct API call
  static async speechToText(file: File, language: string = 'en'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'openai/whisper-large-v3');
      formData.append('language', language);
      
      const response = await fetch('https://api.together.xyz/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      
      if (!result.text || result.text.trim() === '') {
        throw new Error('No transcription returned');
      }
      
      return result.text;
    } catch (error) {
      console.error('Speech to text error:', error);
      throw error;
    }
  }

}
