import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.TOGETHER_API_KEY ?? ''

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const language = (formData.get('language') as string) || 'en'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const outForm = new FormData()
    outForm.append('file', file)
    outForm.append('model', 'openai/whisper-large-v3')
    outForm.append('language', language)

    const response = await fetch('https://api.together.xyz/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: outForm,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Speech API Error: ${response.status} - ${err?.error?.message || response.statusText}`)
    }

    const result = await response.json()
    if (!result.text?.trim()) throw new Error('No transcription returned')

    return NextResponse.json({ text: result.text })
  } catch (error) {
    console.error('Speech-to-text error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
